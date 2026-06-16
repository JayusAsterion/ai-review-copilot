"use client";

import { Check, Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
];

export function ThemeToggle() {
  const { theme = "dark", resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  const Icon = !isDark ? Sun : Moon;

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="border-border bg-surface/80 text-foreground/80 hover:bg-surface-elevated hover:text-foreground"
              aria-label="Change theme"
            >
              <Icon />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Change theme</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-36">
        {themeOptions.map((option) => {
          const OptionIcon = option.icon;
          const isSelected = theme === option.value;

          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              className="justify-between"
            >
              <span className="flex items-center gap-2">
                <OptionIcon className="size-4" />
                {option.label}
              </span>
              {isSelected ? <Check className="size-4 text-valra-cyan" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
