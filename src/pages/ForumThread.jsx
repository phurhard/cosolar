import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ForumPost, ForumReply } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Heart, MessageSquare, Loader2, Send, Clock, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import CategoryBadge from '@/components/forum/CategoryBadge';
import ReplyCard from '@/components/forum/ReplyCard';

export default function ForumThread() {
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('id');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [replyBody, setReplyBody] = useState('');

  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ['forum-post', postId],
    queryFn: () => ForumPost.get(postId),
    enabled: !!postId,
  });

  const { data: replies = [], isLoading: repliesLoading } = useQuery({
    queryKey: ['forum-replies', postId],
    queryFn: () => ForumReply.listByPost(postId),
    enabled: !!postId,
  });

  const createReplyMutation = useMutation({
    mutationFn: async (body) => {
      return await ForumReply.create({
        post_id: postId,
        body,
        author_email: user.email,
        author_name: user.user_metadata?.full_name || user.email.split('@')[0],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-replies', postId] });
      queryClient.invalidateQueries({ queryKey: ['forum-post', postId] });
      setReplyBody('');
      toast.success('Reply posted!');
    },
    onError: () => {
      toast.error('Failed to post reply');
    },
  });

  const deleteReplyMutation = useMutation({
    mutationFn: async (id) => await ForumReply.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-replies', postId] });
      queryClient.invalidateQueries({ queryKey: ['forum-post', postId] });
      toast.success('Reply deleted');
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async () => await ForumPost.delete(postId),
    onSuccess: () => {
      toast.success('Post deleted');
      window.location.href = createPageUrl('Forum');
    },
  });

  const handleSubmitReply = (e) => {
    e.preventDefault();
    if (!replyBody.trim()) return;
    createReplyMutation.mutate(replyBody.trim());
  };

  if (postLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Post not found</h2>
            <Link to={createPageUrl('Forum')}>
              <Button variant="outline">Back to Forum</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPostAuthor = user && post.author_email === user.email;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6 max-w-3xl">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            to={createPageUrl('Forum')}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Forum
          </Link>
        </motion.div>

        {/* Post */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-border mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CategoryBadge category={post.category} />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">{post.title}</h1>
                </div>
                {isPostAuthor && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      if (window.confirm('Delete this post and all its replies?')) {
                        deletePostMutation.mutate();
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap mb-4">{post.body}</p>

              {/* Post Meta */}
              <div className="flex items-center gap-4 pt-4 border-t border-border text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">
                      {(post.author_name || 'A').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium text-foreground">{post.author_name}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground ml-auto">
                  <Heart className="w-3.5 h-3.5" />
                  {post.likes_count || 0}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {post.replies_count || 0}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Replies */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Replies ({replies.length})
          </h2>

          {repliesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : replies.length > 0 ? (
            <Card className="border-border mb-6">
              <CardContent className="px-5 py-2">
                {replies.map((reply) => (
                  <ReplyCard
                    key={reply.id}
                    reply={reply}
                    currentUserEmail={user?.email}
                    onDelete={(id) => deleteReplyMutation.mutate(id)}
                  />
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border mb-6">
              <CardContent className="p-8 text-center text-muted-foreground">
                No replies yet. {user ? 'Be the first to respond!' : 'Sign in to reply.'}
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Reply Form */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border">
              <CardContent className="p-5">
                <form onSubmit={handleSubmitReply} className="space-y-3">
                  <Textarea
                    placeholder="Write your reply..."
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    className="bg-background min-h-[100px]"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-primary/90"
                      disabled={createReplyMutation.isPending || !replyBody.trim()}
                    >
                      {createReplyMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Reply
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
