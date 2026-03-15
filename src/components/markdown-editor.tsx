"use client";

import { type JSX } from "react";

import MDEditor, { type MDEditorProps } from "@uiw/react-md-editor";
import { type ClassValue } from "clsx";
import rehypeKatex from "rehype-katex";
import rehypeSanitize from "rehype-sanitize";
import remarkMath from "remark-math";

import { cn } from "@/lib/utils";

export function MarkdownEditor(props: JSX.IntrinsicAttributes & MDEditorProps) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
      />
      <MDEditor
        {...props}
        commands={[]}
        previewOptions={{
          className: "prose max-w-full prose-code:text-foreground",
          remarkPlugins: [[remarkMath]],
          rehypePlugins: [[rehypeSanitize], [rehypeKatex]],
        }}
      />
    </>
  );
}

export function MarkdownRenderer({
  source,
  className,
}: {
  source: string;
  className?: ClassValue;
}) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
      />
      <MDEditor.Markdown
        className={cn("prose max-w-full prose-code:text-foreground", className)}
        source={source}
        remarkPlugins={[[remarkMath]]}
        rehypePlugins={[[rehypeSanitize], [rehypeKatex]]}
      />
    </>
  );
}
