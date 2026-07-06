import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initialsFromName } from "@/lib/common/format";
import { cn } from "@/lib/utils";
import type { UserSummary } from "@/lib/users/user-summaries";

export interface TemplateAuthorDisplayProps {
  author?: UserSummary;
  className?: string;
  /** Muted value text — properties panel (todo detail style). Hub cards use default emphasis. */
  muted?: boolean;
}

export function TemplateAuthorDisplay({ author, className, muted = false }: TemplateAuthorDisplayProps) {
  const authorName = author?.displayName?.trim() || "Team member";
  const authorInitials = initialsFromName(authorName);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Avatar className="size-6 shrink-0" title={authorName}>
        {author?.photoURL ? <AvatarImage src={author.photoURL} alt="" /> : null}
        <AvatarFallback className="text-[10px] font-semibold">{authorInitials}</AvatarFallback>
      </Avatar>
      <p
        className={cn(
          "truncate text-sm leading-none",
          muted ? "text-muted-foreground" : "font-medium",
        )}>
        {authorName}
      </p>
    </div>
  );
}
