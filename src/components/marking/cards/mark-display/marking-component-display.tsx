"use client";

import { Grade } from "@/logic/grading";
import { type ClassValue } from "clsx";

import { MarkdownRenderer } from "@/components/markdown-editor";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Item, ItemContent, ItemMedia } from "@/components/ui/item";

import { cn } from "@/lib/utils";

export function MarkingComponentDisplay({
  className,
  title,
  description,
  result: { mark, justification },
}: {
  className?: ClassValue;
  title: string;
  description: string;
  result: { mark: number; justification: string };
}) {
  return (
    <Card className={cn(className, "row-span-1")}>
      <CardHeader className="pt-4 pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent>
        <Item variant="muted" className="items-start">
          <ItemMedia className="font-semibold text-secondary text-lg">
            {Grade.toLetter(mark)}
          </ItemMedia>
          <ItemContent>
            <MarkdownRenderer
              className="bg-muted! text-muted-foreground! marker:text-muted-foreground"
              source={justification}
            />
          </ItemContent>
        </Item>
      </CardContent>
    </Card>
  );
}
