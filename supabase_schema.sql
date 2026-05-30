-- ====================================================================
-- DATABASE MIGRATIONS & SCHEMA FOR UISWIPE
-- Execute this SQL in the Supabase SQL Editor
-- ====================================================================

-- 1. EXTEND PROFILES FOR SOCIAL LINKS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS github_url TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS twitter_url TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website_url TEXT DEFAULT '';

-- 2. CREATE FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    component_id UUID NOT NULL REFERENCES public.components(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, component_id)
);

-- 3. CREATE FOLLOWS (FOLLOWER/FOLLOWING) RELATION TABLE
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- 4. CREATE NOTIFICATIONS SYSTEM
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- target recipient
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- triggering user
    type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow')),
    component_id UUID REFERENCES public.components(id) ON DELETE CASCADE, -- optional component reference
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- AUTOMATED TRIGGER FUNCTIONS FOR ATOMIC COUNTERS & ALERTS
-- ====================================================================

-- Trigger for Likes count increment/decrement
CREATE OR REPLACE FUNCTION public.handle_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.components 
    SET likes_count = COALESCE(likes_count, 0) + 1 
    WHERE id = NEW.component_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.components 
    SET likes_count = GREATEST(0, COALESCE(likes_count, 0) - 1) 
    WHERE id = OLD.component_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_likes_count ON public.likes;
CREATE TRIGGER tr_likes_count
AFTER INSERT OR DELETE ON public.likes
FOR EACH ROW EXECUTE FUNCTION public.handle_likes_count();


-- Trigger for Comments count increment/decrement
CREATE OR REPLACE FUNCTION public.handle_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.components 
    SET comments_count = COALESCE(comments_count, 0) + 1 
    WHERE id = NEW.component_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.components 
    SET comments_count = GREATEST(0, COALESCE(comments_count, 0) - 1) 
    WHERE id = OLD.component_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_comments_count ON public.comments;
CREATE TRIGGER tr_comments_count
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.handle_comments_count();


-- ====================================================================
-- NOTIFICATION BUILDER TRIGGERS
-- ====================================================================

-- Log Like Notification
CREATE OR REPLACE FUNCTION public.handle_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  comp_owner UUID;
BEGIN
  SELECT user_id INTO comp_owner FROM public.components WHERE id = NEW.component_id;
  IF comp_owner IS NOT NULL AND comp_owner != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, actor_id, type, component_id)
    VALUES (comp_owner, NEW.user_id, 'like', NEW.component_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_like_notification ON public.likes;
CREATE TRIGGER tr_like_notification
AFTER INSERT ON public.likes
FOR EACH ROW EXECUTE FUNCTION public.handle_like_notification();


-- Log Comment Notification
CREATE OR REPLACE FUNCTION public.handle_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  comp_owner UUID;
BEGIN
  SELECT user_id INTO comp_owner FROM public.components WHERE id = NEW.component_id;
  IF comp_owner IS NOT NULL AND comp_owner != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, actor_id, type, component_id)
    VALUES (comp_owner, NEW.user_id, 'comment', NEW.component_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_comment_notification ON public.comments;
CREATE TRIGGER tr_comment_notification
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.handle_comment_notification();


-- Log Follow Notification
CREATE OR REPLACE FUNCTION public.handle_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, actor_id, type)
  VALUES (NEW.following_id, NEW.follower_id, 'follow');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_follow_notification ON public.follows;
CREATE TRIGGER tr_follow_notification
AFTER INSERT ON public.follows
FOR EACH ROW EXECUTE FUNCTION public.handle_follow_notification();


-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Favorites RLS
CREATE POLICY "Allow public read access to favorites" ON public.favorites
    FOR SELECT USING (true);

CREATE POLICY "Allow users to manage their own favorites" ON public.favorites
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Follows RLS
CREATE POLICY "Allow public read access to follows" ON public.follows
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to follow" ON public.follows
    FOR ALL USING (auth.uid() = follower_id) WITH CHECK (auth.uid() = follower_id);

-- Notifications RLS
CREATE POLICY "Allow users to read their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete or update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
