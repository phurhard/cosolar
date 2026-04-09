-- Forum Posts Table
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  author_email TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  likes_count INTEGER NOT NULL DEFAULT 0,
  replies_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Forum Replies Table
CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  author_email TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_forum_posts_category ON forum_posts(category);
CREATE INDEX idx_forum_posts_author ON forum_posts(author_email);
CREATE INDEX idx_forum_posts_created ON forum_posts(created_at DESC);
CREATE INDEX idx_forum_replies_post ON forum_replies(post_id);

-- RLS Policies
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

-- Anyone can read posts
CREATE POLICY "Anyone can read forum posts"
  ON forum_posts FOR SELECT
  USING (true);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create forum posts"
  ON forum_posts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authors can update their own posts
CREATE POLICY "Authors can update their own posts"
  ON forum_posts FOR UPDATE
  USING (auth.jwt() ->> 'email' = author_email);

-- Authors can delete their own posts
CREATE POLICY "Authors can delete their own posts"
  ON forum_posts FOR DELETE
  USING (auth.jwt() ->> 'email' = author_email);

-- Anyone can read replies
CREATE POLICY "Anyone can read forum replies"
  ON forum_replies FOR SELECT
  USING (true);

-- Authenticated users can create replies
CREATE POLICY "Authenticated users can create forum replies"
  ON forum_replies FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authors can update their own replies
CREATE POLICY "Authors can update their own replies"
  ON forum_replies FOR UPDATE
  USING (auth.jwt() ->> 'email' = author_email);

-- Authors can delete their own replies
CREATE POLICY "Authors can delete their own replies"
  ON forum_replies FOR DELETE
  USING (auth.jwt() ->> 'email' = author_email);

-- Function to auto-update replies_count on forum_posts
CREATE OR REPLACE FUNCTION update_forum_post_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_posts SET replies_count = replies_count + 1, updated_at = now() WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_posts SET replies_count = replies_count - 1, updated_at = now() WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_forum_replies_count
  AFTER INSERT OR DELETE ON forum_replies
  FOR EACH ROW EXECUTE FUNCTION update_forum_post_replies_count();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE forum_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE forum_replies;
