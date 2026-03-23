import { toast } from "sonner";

export async function copyToClipboard(val: string, toastMessage?: string) {
  await navigator.clipboard.writeText(val).then(() => {
    toast.success(`Copied ${toastMessage ?? val} to clipboard!`);
  });
}
