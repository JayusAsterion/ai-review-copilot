import Image from "next/image";

import { cn } from "@/lib/utils";

type LogoProps = {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const iconSizes = {
  sm: 24,
  md: 34,
  lg: 48,
};

const textSizes = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-2xl",
};

export function Logo({
  variant = "full",
  size = "md",
  className,
}: LogoProps) {
  const iconSize = iconSizes[size];

  return (
    <div
      className={cn(
        "inline-flex min-w-0 items-center gap-2.5 text-foreground",
        className
      )}
      aria-label="Valra"
    >
      <span
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center",
          size === "sm" && "size-6",
          size === "md" && "size-9",
          size === "lg" && "size-12"
        )}
        aria-hidden="true"
      >
        <Image
          src="/brand/valra-isotipo-transparent.svg"
          alt=""
          width={iconSize}
          height={iconSize}
          priority={size === "lg"}
          className="h-full w-full object-contain drop-shadow-[0_0_18px_rgba(39,245,165,0.18)]"
        />
      </span>
      {variant === "full" ? (
        <span
          className={cn(
            "truncate font-display font-semibold leading-none tracking-tight text-foreground",
            textSizes[size]
          )}
        >
          Valra
        </span>
      ) : (
        <span className="sr-only">Valra</span>
      )}
    </div>
  );
}
