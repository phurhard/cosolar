import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReplyCard({ reply, currentUserEmail, onDelete }) {
  const isAuthor = currentUserEmail && reply.author_email === currentUserEmail;

  return (
    <div className="flex gap-3 py-4 border-b border-border/50 last:border-0">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-semibold text-foreground">
          {(reply.author_name || 'A').charAt(0).toUpperCase()}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-foreground">{reply.author_name}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
          </span>
          {isAuthor && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 ml-auto text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(reply.id)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{reply.body}</p>
      </div>
    </div>
  );
}
