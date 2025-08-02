"use client"
import Redirect from "./components/Redirect";
import { Play, Users, Music } from "lucide-react";
import GetStarted from "./components/GetStarted";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { anton } from "./lib/fonts";
import CountUp from "./components/ui/CountUp/CountUp";
import { TextGenerateEffect } from "./components/ui/text-generate-effect";

export default function Home() {

  
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden max-w-3xl mx-auto">
      
      <Redirect/>      

      {/* Background Image with Overlay */}
      <div className="absolute inset-0 ">
        <div className="absolute inset-0 bg-gradient-hero"></div>
      </div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
        <div className="mb-8 animate-fade-in">
          <h1 className={`${anton.className} text-pink-700 font-bold text-[3rem] lg:text-[5rem] uppercase`}>
            Naachogaao
          </h1>
          <TextGenerateEffect words="Join your favorite creators&apos; music streams Add songs, vote for favorites, and experience music together in real-time. 
            The future of social music streaming is here." className=" max-w-[35rem] mx-auto mt-4" />
          <p className="">
            
          </p>
        </div>

        {/* Stats */}
        <div className={`${anton.className} tracking-widest flex flex-wrap justify-center gap-8 mb-4 animate-fade-in delay-300`}>
          <div className="flex items-center gap-2 text-white">
            <span className="font-semibold text-[3rem]">
              <CountUp
                from={0}
                to={100}
                separator=","
                direction="up"
                duration={1}
                className="count-up-text  text-green-500 pr-1"
              />
              K+ Active Streamers
            </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in delay-500">
          <SignedOut>

          <GetStarted classes="text-sm bg-purple-900/20 hover:bg-purple-800 cursor-pointer px-10 py-4 flex items-center gap-4 rounded-lg shadow-sm active:shadow-md active:shadow-purple-500/50 hover:shadow-purple-500/10  transition-all duration-150 justify-center backdrop-blur-xl"/>
          </SignedOut>          
        </div>
      </div>
    </section>    
  );
}
