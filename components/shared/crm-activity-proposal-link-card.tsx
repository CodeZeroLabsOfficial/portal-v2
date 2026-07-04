import Link from "next/link";
import { FileText } from "lucide-react";

export interface CrmActivityProposalLinkCardProps {
  href: string;
  title: string;
  subtitle?: string;
}

/** Linked proposal row for CRM activity timelines (Profile v2 activity-stream file card pattern). */
export function CrmActivityProposalLinkCard({
  href,
  title,
  subtitle = "Draft proposal",
}: CrmActivityProposalLinkCardProps) {
  return (
    <Link
      href={href}
      className="bg-muted/30 hover:bg-muted flex items-center gap-3 rounded-lg border p-4 transition-colors">
      <FileText className="text-muted-foreground size-5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-xs">{subtitle}</p>
      </div>
    </Link>
  );
}
