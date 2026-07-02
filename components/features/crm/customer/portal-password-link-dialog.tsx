"use client";

import { Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface PortalPasswordLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: string | null;
}

export function PortalPasswordLinkDialog({ open, onOpenChange, link }: PortalPasswordLinkDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Password link</DialogTitle>
          <DialogDescription>
            Share through a secure channel. Anyone with the link can start the password flow for this login
            email.
          </DialogDescription>
        </DialogHeader>
        {link ? (
          <Textarea readOnly className="min-h-[5.5rem] resize-none font-mono text-xs" value={link} />
        ) : null}
        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            disabled={!link}
            onClick={() => {
              if (link) void navigator.clipboard.writeText(link);
            }}>
            <Copy className="size-3.5" aria-hidden />
            Copy link
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Done
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
