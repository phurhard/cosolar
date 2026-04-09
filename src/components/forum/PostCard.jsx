import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Heart, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import CategoryBadge from './CategoryBadge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PostCard({ post }) {
  return (
    <Link to={`${createPageUrl('ForumThread')}?id=${post.id}`}>
      <Card className="border-border hover:border-primary/30 transition-all duration-200 cursor-pointer group">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-primary">
                {(post.author_name || 'A').charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              {/* Title */}
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {post.title}
              </h3>

              {/* Body preview */}
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {post.body}
              </p>

              {/* Meta */}
              <div className="flex items-center flex-wrap gap-3 mt-3">
                <CategoryBadge category={post.category} />
                <span className="text-xs text-muted-foreground">
                  by <span className="font-medium text-foreground">{post.author_name}</span>
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Heart className="w-3 h-3" />
                    {post.likes_count || 0}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="w-3 h-3" />
                    {post.replies_count || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
