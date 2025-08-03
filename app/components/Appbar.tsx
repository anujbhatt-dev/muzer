"use client";
import { SignedIn, SignedOut, SignInButton, useClerk, UserButton, useSignIn } from "@clerk/clerk-react";
import { LogIn, LogOut } from "lucide-react";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import signature from "@/public/mylivesignature.png"

export default function Appbar() {
  const { signOut } = useClerk();

  return (
    <div className="flex w-full justify-between p-8 px-0 pr-8 md:px-20 text-white font-semibold items-center sticky top-0 right-0 left-0 z-50">
      <Link href="/" className="font-extrabold tracking-widest text-xl cursor-pointer relative">
        <div>NAACHOGAAO</div>
        <Image  src={signature} alt="" className="absolute top-[30%] left-[60%] invert w-20 h-auto" />
      </Link>

      <div className="flex gap-5">
        <SignedIn>
          <UserButton />
          <LogOut className="cursor-pointer" onClick={() => signOut()} />
        </SignedIn>

        <SignedOut>
           <SignInButton forceRedirectUrl="/dashboard" mode="modal">
                <LogIn className="cursor-pointer"/>
            </SignInButton> 
        </SignedOut>
      </div>
    </div>
  );
}
