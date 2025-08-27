"use client";

import { useState } from "react";

import { InfoIcon } from "lucide-react";

import { ExtendedReaderPreferenceType } from "@/db/types";

import { ReadingPreferenceButton } from "@/components/reading-preference-button";
import { preferenceConfigs } from "@/components/reading-preference-button/config";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";

export function HelpSection() {
  return (
    <Dialog>
      <DialogTrigger className="ml-auto w-max">
        <Button
          variant="outline"
          className="hover:bg-indigo-100 flex items-center gap-2"
        >
          <InfoIcon className="text-indigo-600 size-5" />{" "}
          <span className="text-indigo-700">Help</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Reader Preferences Help</DialogTitle>
        </DialogHeader>
        <div>
          Readers have a &apos;preference&apos; over every project that they
          don&apos;t supervise themselves.
          <br />
          Supervisors can never read their own projects, so anything you
          proposed won&apos;t show up in this list.
          <br />
          Preferences for readers come in three kinds, as laid out below:
        </div>

        <ol className="mx-auto flex flex-row p-3 bg-accent text-accent-foreground rounded-md drop-shadow-md">
          <li className="p-3 flex flex-col gap-1">
            <div className="flex flex-row items-center gap-2 text-lg">
              <div className="size-8 border-1 border-amber-300 bg-amber-100 rounded-full" />
              <h1 className="font-semibold text-foreground">
                {preferenceConfigs.ACCEPTABLE.label}
              </h1>
            </div>
            <div>You are OK with reading this project</div>
          </li>
          <Separator orientation="vertical" />
          <li className="p-3 flex flex-col gap-1">
            <div className="flex flex-row items-center gap-2 text-lg">
              <div className="size-8 border-1 border-green-300 bg-green-100 rounded-full" />
              <h1 className="font-semibold text-foreground">
                {preferenceConfigs.PREFERRED.label}
              </h1>
            </div>
            <div>You would prefer to read this project</div>
          </li>
          <Separator orientation="vertical" />
          <li className="p-3 flex flex-col gap-1">
            <div className="flex flex-row items-center gap-2 text-lg">
              <div className="size-8 border-1 border-red-300 bg-red-100 rounded-full  " />
              <h1 className="font-semibold text-foreground">
                {preferenceConfigs.UNACCEPTABLE.label}
              </h1>
            </div>
            <div>You would prefer not to read this project</div>
          </li>
        </ol>
        <div className="mx-auto">
          The button cycles through each option as you click it - give it a try!
        </div>
        <Demo />
      </DialogContent>
    </Dialog>
  );
}

function Demo() {
  const [pref, setPref] = useState<ExtendedReaderPreferenceType>(
    ExtendedReaderPreferenceType.ACCEPTABLE,
  );

  const [stupid, setStupid] = useState(false);

  return (
    <div className="mx-auto p-5 bg-accent rounded-md drop-shadow-lg flex flex-col gap-2 items-center">
      <ReadingPreferenceButton
        currentPreference={pref}
        setPreference={async (a) => {
          setPref(a);
          if (a === ExtendedReaderPreferenceType.ACCEPTABLE) {
            setStupid(true);
            setTimeout(() => setStupid(false), 100);
          }
        }}
      />
      <Diagram
        className={cn(
          "size-45 ease-in-out transition-duration-500",
          pref === ExtendedReaderPreferenceType.PREFERRED &&
            "-rotate-120 transition-transform",
          pref === ExtendedReaderPreferenceType.UNACCEPTABLE &&
            "-rotate-240 transition-transform",
          pref === ExtendedReaderPreferenceType.ACCEPTABLE &&
            stupid &&
            "-rotate-360 transition-transform",
        )}
      />
    </div>
  );
}

export function Diagram({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="500"
      height="500"
      viewBox="-1 -1 501 501"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-accent-foreground" />
        </marker>
      </defs>
      <circle
        cx="76.7949"
        cy="350"
        r="50"
        transform="rotate(-120 76.7949 350)"
        className="fill-red-100 stroke-red-300 stroke-4"
      />
      <circle
        cx="423.205"
        cy="350"
        r="50"
        transform="rotate(120 423.205 350)"
        className="fill-green-100 stroke-green-300 stroke-4"
      />
      <circle
        cx="250"
        cy="50"
        r="50"
        className="fill-amber-100 stroke-amber-300 stroke-4"
      />
      <path
        markerEnd="url(#arrow)"
        d="M362.5 55.1443C396.358 74.6924 424.539 102.726 444.264 136.481C463.989 170.237 474.578 208.55 474.988 247.644"
        className="stroke-5 stroke-accent-foreground"
      />
      <path
        markerEnd="url(#arrow)"
        d="M362.5 444.856C328.642 464.404 290.274 474.792 251.178 474.997C212.082 475.202 173.608 465.216 139.547 446.023"
        className="stroke-5 stroke-accent-foreground"
      />
      <path
        markerEnd="url(#arrow)"
        d="M25 250C25 210.904 35.1873 172.482 54.5579 138.522C73.9285 104.562 101.814 76.2347 135.466 56.3331"
        className="stroke-5 stroke-accent-foreground"
      />
    </svg>
  );
}
