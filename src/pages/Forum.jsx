import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ForumPost } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import PostCard from '@/components/forum/PostCard';
import NewPostDialog from '@/components/forum/NewPostDialog';
import CategoryBadge, { FORUM_CATEGORIES } from '@/components/forum/CategoryBadge';

export default function Forum() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['forum-posts', category, search],
    queryFn: () => ForumPost.list({ category: category === 'All' ? null : category, search: search || null }),
  });

  const createPostMutation = useMutation({
    mutationFn: async (data) => {
      return await ForumPost.create({
        ...data,
        author_email: user.email,
        author_name: user.user_metadata?.full_name || user.email.split('@')[0],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      toast.success('Post created successfully!');
    },
    onError: () => {
      toast.error('Failed to create post');
    },
  });

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  Community Forum
                </h1>
                <p className="text-muted-foreground">
                  Discuss solar topics with the CoSolar community
                </p>
              </div>
            </div>
            {user && (
              <NewPostDialog
                onSubmit={createPostMutation.mutateAsync}
                isPending={createPostMutation.isPending}
              />
            )}
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 space-y-4"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {FORUM_CATEGORIES.map((cat) => (
              <CategoryBadge
                key={cat}
                category={cat}
                active={category === cat}
                onClick={setCategory}
              />
            ))}
          </div>
        </motion.div>

        {/* Posts List */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No posts found</p>
                <p className="text-sm text-muted-foreground">
                  {user ? 'Be the first to start a discussion!' : 'Sign in to create a post.'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
