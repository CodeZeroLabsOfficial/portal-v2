"use client";

import * as React from "react";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Strikethrough,
  Underline as UnderlineIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import "./crm-note-editor.css";

interface CrmNoteEditorToolbarButtonProps {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}

function CrmNoteEditorToolbarButton({
  active,
  disabled,
  label,
  onClick,
  children
}: CrmNoteEditorToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      className={cn("size-8", active && "bg-muted text-foreground")}
      onClick={onClick}>
      {children}
    </Button>
  );
}

export interface CrmNoteEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CrmNoteEditor({
  value,
  onChange,
  placeholder = "Enter note description...",
  disabled = false,
  className
}: CrmNoteEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false
      }),
      Underline,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline underline-offset-2" }
      }),
      Placeholder.configure({ placeholder })
    ],
    content: value,
    editable: !disabled,
    autofocus: false,
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
    editorProps: {
      attributes: {
        class: "crm-note-editor-content max-w-full px-4 py-4 text-sm focus:outline-none"
      }
    }
  });

  React.useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  React.useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "<p></p>", false);
    }
  }, [editor, value]);

  function handleSetLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  if (!editor) {
    return (
      <div
        className={cn(
          "bg-card min-h-60 w-full border bg-muted/20",
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "bg-card relative w-full overflow-hidden border",
        className
      )}>
      <div className="bg-background sticky top-0 z-20 w-full border-b">
        <div className="flex flex-wrap items-center gap-1 px-2 py-0.5">
          <CrmNoteEditorToolbarButton
            label="Bold"
            active={editor.isActive("bold")}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold className="size-4" />
          </CrmNoteEditorToolbarButton>
          <CrmNoteEditorToolbarButton
            label="Italic"
            active={editor.isActive("italic")}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic className="size-4" />
          </CrmNoteEditorToolbarButton>
          <CrmNoteEditorToolbarButton
            label="Underline"
            active={editor.isActive("underline")}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <UnderlineIcon className="size-4" />
          </CrmNoteEditorToolbarButton>
          <CrmNoteEditorToolbarButton
            label="Strikethrough"
            active={editor.isActive("strike")}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleStrike().run()}>
            <Strikethrough className="size-4" />
          </CrmNoteEditorToolbarButton>
          <CrmNoteEditorToolbarButton
            label="Link"
            active={editor.isActive("link")}
            disabled={disabled}
            onClick={handleSetLink}>
            <LinkIcon className="size-4" />
          </CrmNoteEditorToolbarButton>
          <Separator orientation="vertical" className="mx-1 h-7" />
          <CrmNoteEditorToolbarButton
            label="Bullet list"
            active={editor.isActive("bulletList")}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <List className="size-4" />
          </CrmNoteEditorToolbarButton>
          <CrmNoteEditorToolbarButton
            label="Ordered list"
            active={editor.isActive("orderedList")}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <ListOrdered className="size-4" />
          </CrmNoteEditorToolbarButton>
        </div>
      </div>
      <EditorContent editor={editor} className="min-h-60 w-full min-w-full" />
    </div>
  );
}
