import { ManualShell } from "@/modules/living-docs-externa/ui/reader/manual-shell";

export default function ManualLayout({ children }: { children: React.ReactNode }) {
  return <ManualShell>{children}</ManualShell>;
}
