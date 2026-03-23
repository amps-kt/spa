import {
  DownloadIcon,
  HelpCircleIcon,
  PlusCircleIcon,
  SaveIcon,
  UploadIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export function TopBar() {
  return (
    <div className="flex items-center justify-between border-b p-4">
      <h1 className="text-2xl font-bold">Marking Scheme Builder</h1>
      <div className="flex space-x-2">
        <Button variant="outline">
          <PlusCircleIcon className="mr-2 h-4 w-4" /> Create New Schema
        </Button>
        <Button variant="outline">
          <UploadIcon className="mr-2 h-4 w-4" /> Import JSON
        </Button>
        <Button variant="outline">
          <DownloadIcon className="mr-2 h-4 w-4" /> Export JSON
        </Button>
        <Button variant="outline">
          <HelpCircleIcon className="mr-2 h-4 w-4" /> Quick Start Guide
        </Button>
        <Button variant="default" disabled>
          <SaveIcon className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </div>
    </div>
  );
}
