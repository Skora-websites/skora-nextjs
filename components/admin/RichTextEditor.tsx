"use client";

import React, { useEffect, useRef } from "react";
import {
  Bold,
  ChevronDown,
  Heading2,
  Heading3,
  Heading4,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";

interface RichTextEditorProps {
  /** Sanitized HTML produced by the editor. */
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

interface ToolbarButton {
  /** execCommand verb, or a custom action id. */
  command: string;
  label: string;
  icon: React.ReactNode;
  value?: string;
  group: "style" | "block" | "list" | "insert" | "history";
}

const BUTTONS: ToolbarButton[] = [
  { command: "bold", label: "Bold", icon: <Bold size={15} />, group: "style" },
  { command: "italic", label: "Italic", icon: <Italic size={15} />, group: "style" },
  { command: "underline", label: "Underline", icon: <Underline size={15} />, group: "style" },
  { command: "strikeThrough", label: "Strikethrough", icon: <Strikethrough size={15} />, group: "style" },
  { command: "formatBlock", label: "Heading 2", icon: <Heading2 size={15} />, value: "h2", group: "block" },
  { command: "formatBlock", label: "Heading 3", icon: <Heading3 size={15} />, value: "h3", group: "block" },
  { command: "formatBlock", label: "Heading 4", icon: <Heading4 size={15} />, value: "h4", group: "block" },
  { command: "formatBlock", label: "Paragraph", icon: <ChevronDown size={15} />, value: "p", group: "block" },
  { command: "insertUnorderedList", label: "Bullet list", icon: <List size={15} />, group: "list" },
  { command: "insertOrderedList", label: "Numbered list", icon: <ListOrdered size={15} />, group: "list" },
  { command: "formatBlock", label: "Quote", icon: <Quote size={15} />, value: "blockquote", group: "list" },
  { command: "insertHorizontalRule", label: "Divider", icon: <Minus size={15} />, group: "insert" },
  { command: "createLink", label: "Link", icon: <Link2 size={15} />, group: "insert" },
  { command: "insertImage", label: "Image", icon: <ImageIcon size={15} />, group: "insert" },
  { command: "removeFormat", label: "Clear formatting", icon: <RemoveFormatting size={15} />, group: "insert" },
  { command: "undo", label: "Undo", icon: <Undo2 size={15} />, group: "history" },
  { command: "redo", label: "Redo", icon: <Redo2 size={15} />, group: "history" },
];

const GROUP_SEPARATORS: ToolbarButton["group"][] = ["block", "list", "insert", "history"];

/**
 * Lightweight WYSIWYG built on contentEditable + document.execCommand.
 * Emits an HTML string; the server re-sanitizes it before storing.
 */
export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastEmitted = useRef<string>(value ?? "");

  // Sync external value changes (e.g. a post finished loading) without
  // stealing the caret: only written when the prop differs from what the
  // editor itself last emitted.
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const next = value ?? "";
    if (next !== lastEmitted.current && el.innerHTML !== next) {
      el.innerHTML = next;
      lastEmitted.current = next;
    }
  }, [value]);

  const emit = () => {
    const html = editorRef.current?.innerHTML ?? "";
    lastEmitted.current = html;
    onChange(html);
  };

  const runCommand = (button: ToolbarButton) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();

    if (button.command === "createLink") {
      const url = window.prompt("Link URL (https://…)");
      if (!url) return;
      document.execCommand("createLink", false, url);
    } else if (button.command === "insertImage") {
      const url = window.prompt("Image URL (https://…)");
      if (!url) return;
      document.execCommand("insertImage", false, url);
    } else if (button.value) {
      document.execCommand(button.command, false, button.value);
    } else {
      document.execCommand(button.command, false);
    }
    emit();
  };

  return (
    <div className="rounded-2xl border border-[#E1E6DF] bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[#E1E6DF] bg-[#F4F6F1] px-2 py-2">
        {BUTTONS.map((button, idx) => {
          const withSeparator = GROUP_SEPARATORS.includes(button.group) && idx > 0;
          return (
            <React.Fragment key={`${button.command}-${button.value || idx}`}>
              {withSeparator && <span className="mx-1 h-5 w-px bg-[#E1E6DF]" />}
              <button
                type="button"
                title={button.label}
                aria-label={button.label}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => runCommand(button)}
                className="p-2 rounded-lg text-slate-600 hover:bg-white hover:text-[#2563EB] hover:border hover:border-[#2563EB]/30 transition-colors cursor-pointer"
              >
                {button.icon}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        data-placeholder={placeholder || "Write the article…"}
        className="rte-content rte-placeholder min-h-[340px] px-5 py-4 text-sm leading-relaxed text-[#0B1310] focus:outline-none"
      />
    </div>
  );
}
