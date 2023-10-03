"use client";
import whiteLogo from "@/assets/uofg-white.png";
import { User2 } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

function UserButton() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const user = session?.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={user?.image ?? ""} />
          <AvatarFallback>
            <User2 />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-3 w-60">
        {user && (
          <DropdownMenuLabel className="py-4">
            <div className="flex flex-col space-y-1 pb-2.5">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
            <DropdownMenuSeparator />
          </DropdownMenuLabel>
        )}
        <DropdownMenuItem>
          <Link href="/account" className="w-full">
            <Button variant="link">My account</Button>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          {session ? (
            <Button
              className="w-full"
              variant="outline"
              onClick={async () => await signOut()}
            >
              Sign out
            </Button>
          ) : (
            <Button
              className="w-full"
              variant="outline"
              onClick={async () =>
                await signIn("google", {
                  callbackUrl: searchParams?.get("from") ?? "/",
                })
              }
            >
              Sign In
            </Button>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header() {
  return (
    <nav className="fixed flex h-[8dvh] max-h-[5rem] w-full items-center justify-center gap-6 bg-primary py-5">
      <Link href="/">
        <Image
          className="max-w-[10rem] object-scale-down"
          width={300}
          height={100}
          src={whiteLogo}
          alt="University of Glasgow logo"
        />
      </Link>
      <Link className="text-white hover:underline" href="/projects">
        <Button variant="ghost">Projects</Button>
      </Link>
      <Link className="text-white hover:underline" href="/supervisors">
        <Button variant="ghost">Supervisors</Button>
      </Link>
      <Link
        className="text-white hover:underline"
        href="/account/my-preferences"
      >
        <Button variant="ghost">My Preferences</Button>
      </Link>
      <Link className="text-white hover:underline" href="/account/my-projects">
        <Button variant="ghost">My Projects</Button>
      </Link>
      <Link className="text-white hover:underline" href="/help">
        <Button variant="ghost">Help</Button>
      </Link>
      <Link className="text-white hover:underline" href="/students">
        <Button variant="ghost">Students</Button>
      </Link>
      <Link className="text-white hover:underline" href="/allocations">
        <Button variant="ghost">Allocations</Button>
      </Link>
      <Link className="text-white hover:underline" href="/admin-panel">
        <Button variant="ghost">Admin Panel</Button>
      </Link>
      <UserButton />
    </nav>
  );
}
