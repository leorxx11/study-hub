import type { ReactNode } from "react";

export function StatusBadge({ tone, children }: { tone: "blue" | "green" | "gray" | "amber"; children: ReactNode }) {
  return <span className={`status-badge ${tone}`}>{children}</span>;
}
