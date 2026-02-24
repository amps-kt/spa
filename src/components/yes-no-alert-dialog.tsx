"use client";

import { type ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type YesNoAlertDialogTriggerProps = { disabled?: boolean; trigger: ReactNode };

function YesNoAlertDialogTrigger({
  disabled,
  trigger,
}: YesNoAlertDialogTriggerProps) {
  return (
    <AlertDialogTrigger disabled={disabled} asChild>
      {trigger}
    </AlertDialogTrigger>
  );
}

type YesNoAlertDialogContainerProps = {
  action: () => void;
  title: ReactNode;
  description: ReactNode;
  children: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  confirmVariant?: "default" | "destructive";
  cancelVariant?: "default" | "outline" | "ghost" | "secondary";
};

function YesNoAlertDialogContainer({
  action,
  title,
  description,
  children,
  confirmLabel = "Yes",
  cancelLabel = "No",
  confirmVariant = "destructive",
  cancelVariant = "outline",
}: YesNoAlertDialogContainerProps) {
  return (
    <AlertDialog>
      {children}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant={cancelVariant}>{cancelLabel}</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant={confirmVariant} onClick={action}>
              {confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

type YesNoAlertDialogProps = {
  action: () => void;
  trigger: ReactNode;
  title: ReactNode;
  description: ReactNode;
  disabled?: boolean;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  confirmVariant?: "default" | "destructive";
  cancelVariant?: "default" | "outline" | "ghost" | "secondary";
};

function YesNoAlertDialog({
  trigger,
  disabled = false,
  ...rest
}: YesNoAlertDialogProps) {
  return (
    <YesNoAlertDialogContainer {...rest}>
      <YesNoAlertDialogTrigger trigger={trigger} disabled={disabled} />
    </YesNoAlertDialogContainer>
  );
}

export { YesNoAlertDialog, YesNoAlertDialogContainer, YesNoAlertDialogTrigger };
