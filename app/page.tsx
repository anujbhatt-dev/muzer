"use client"
import Redirect from "./components/Redirect";
import { Play, Users, Music } from "lucide-react";
import GetStarted from "./components/GetStarted";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { anton } from "./lib/fonts";
import CountUp from "./components/ui/CountUp/CountUp";
import { TextGenerateEffect } from "./components/ui/text-generate-effect";
import Landing from "./components/Landing";

export default function Home() {

  
  return (
    <div className="max-w-[95rem] mx-auto">
        <Landing/>
    </div>
  );
}
