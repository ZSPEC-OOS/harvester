import type { ComponentPropsWithoutRef } from "react";

export function ScrollArea({ className = "", ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={className} {...props} />;
}
