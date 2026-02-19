"use client";

import { DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { RotateCcwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTrigger } from "@/components/ui/dialog";

export function ResetMarksButton() {
  return (
    <Button size="icon" variant="destructive">
      <RotateCcwIcon />
    </Button>
  );
}

export function OverwriteMarks() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Overwrite Marks</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Overwrite marks for ....</DialogTitle>
        </DialogHeader>
      </DialogContent>
      Warning: this is a ... and should only be used in *exceptional
      circumstances*. Before doing this, consider if any of the following (more
      usual) options may suit the situation:
      <ul>
        <li>Resolving a negotiation through the usual mechanism</li>
        <li>Resolving a moderation (this is a separate mechanism)</li>
        <li>Resetting the marks for a marker</li>
      </ul>
      {/* Then the rest: */}
      <form>
        <Button variant="destructive">Submit</Button>
      </form>
    </Dialog>
  );
}
