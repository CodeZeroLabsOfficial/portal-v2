import Image from "next/image";
import { SquareTerminalIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface LogoMarkProps {
  logoUrl?: string | null;
  className?: string;
}

export function LogoMark({ logoUrl, className }: LogoMarkProps) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt=""
        width={32}
        height={32}
        className={cn("size-8 shrink-0 rounded-md object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-md",
        className,
      )}
    >
      <SquareTerminalIcon className="size-4" />
    </div>
  );
}

interface LogoProps {
  logoUrl?: string | null;
  portalName?: string;
  className?: string;
}

export function Logo({ logoUrl, portalName = "Code Zero Labs", className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark logoUrl={logoUrl} />
      <span className="text-foreground text-lg font-semibold tracking-tight">{portalName}</span>
    </div>
  );
}

export default Logo;
