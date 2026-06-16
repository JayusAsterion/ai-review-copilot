"use client";

import { LogOut, UserRound } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function initialsFromName(value?: string | null) {
  if (!value) {
    return "AI";
  }

  const parts = value
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function UserMenu() {
  const { data: session } = useSession();
  const user = session?.user;
  const displayName = user?.name || user?.email || "Signed in";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-9 rounded-xl border-border bg-surface/80 px-2 text-foreground hover:bg-surface-elevated"
          aria-label="Open user menu"
        >
          <Avatar size="sm" className="bg-valra-cyan/10">
            {user?.image ? (
              <AvatarImage src={user.image} alt={displayName} />
            ) : null}
            <AvatarFallback className="bg-valra-cyan/10 text-[0.65rem] font-semibold text-valra-cyan">
              {initialsFromName(displayName)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-32 truncate text-xs md:inline">
            {displayName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 border-border bg-popover text-popover-foreground"
      >
        <DropdownMenuLabel>
          <div className="flex min-w-0 items-center gap-2">
            <Avatar size="sm" className="bg-valra-cyan/10">
              {user?.image ? (
                <AvatarImage src={user.image} alt={displayName} />
              ) : null}
              <AvatarFallback className="bg-valra-cyan/10 text-[0.65rem] font-semibold text-valra-cyan">
                {initialsFromName(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm text-foreground">{displayName}</p>
              {user?.email ? (
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              ) : null}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          onClick={() => void signOut({ callbackUrl: "/" })}
          className="cursor-pointer text-foreground focus:bg-accent focus:text-accent-foreground"
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
        {!user?.email ? (
          <>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              disabled
              className="text-muted-foreground focus:bg-transparent"
            >
              <UserRound className="size-4" />
              Microsoft account
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
