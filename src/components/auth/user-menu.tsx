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
          className="h-9 rounded-xl border-white/10 bg-white/[0.04] px-2 text-slate-100 hover:bg-white/[0.08]"
          aria-label="Open user menu"
        >
          <Avatar size="sm" className="bg-cyan-300/10">
            {user?.image ? (
              <AvatarImage src={user.image} alt={displayName} />
            ) : null}
            <AvatarFallback className="bg-cyan-300/10 text-[0.65rem] font-semibold text-cyan-100">
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
        className="w-64 border-white/10 bg-[#0b0f19] text-slate-100"
      >
        <DropdownMenuLabel>
          <div className="flex min-w-0 items-center gap-2">
            <Avatar size="sm" className="bg-cyan-300/10">
              {user?.image ? (
                <AvatarImage src={user.image} alt={displayName} />
              ) : null}
              <AvatarFallback className="bg-cyan-300/10 text-[0.65rem] font-semibold text-cyan-100">
                {initialsFromName(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm text-white">{displayName}</p>
              {user?.email ? (
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              ) : null}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          onClick={() => void signOut({ callbackUrl: "/" })}
          className="cursor-pointer text-slate-200 focus:bg-white/[0.08] focus:text-white"
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
        {!user?.email ? (
          <>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              disabled
              className="text-slate-500 focus:bg-transparent"
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
