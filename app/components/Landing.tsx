"use client"
import Redirect from "@/app/components/Redirect";
import GetStarted from "@/app/components/GetStarted";
import { anton } from "@/app/lib/fonts";
import CountUp from "@/app/components/ui/CountUp/CountUp";
import { TextGenerateEffect } from "@/app/components/ui/text-generate-effect";
import { SignedOut } from "@clerk/nextjs";

export default function Landing() {

  
  return (
    <section className={`${anton.className} tracking-widest relative min-h-[80vh] flex justify-center lg:justify-between flex-col lg:flex-row`}>      
      <Redirect/>            

      {/* Content */}
      {/* <div className="relative z-10 flex justify-between"> */}
        <div className="mb-8 animate-fade-in lg:mt-[10rem]">
          <h1 className={`${anton.className} font-bold text-[3rem] lg:text-[5rem] uppercase`}>
            Naachogaao
          </h1>
            <TextGenerateEffect words="Join your favorite creators&apos; music streams " className=" max-w-[40rem] mx-auto mt-8" />
            <TextGenerateEffect startDelay={1} words="Add songs, vote for favorites, and experience music together in real-time. 
            The future of social music streaming is here." className=" max-w-[40rem] mx-auto mb-12 -mt-2" />
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in delay-500 mt-4">
            <SignedOut>
            <GetStarted classes="text-sm bg-green-900/80 hover:bg-green-800 cursor-pointer px-10 py-4 flex items-center gap-4 rounded-lg shadow-sm active:shadow-md active:shadow-green-500/50 hover:shadow-green-500/10  transition-all duration-150 justify-center backdrop-blur-xl"/>
            </SignedOut>          
            </div>
        </div>

        {/* Stats */}
        <div className={`${anton.className} tracking-widest flex flex-wrap justify-center lg:items-end gap-8 mb-4 animate-fade-in delay-300`}>
          <div className="gap-2 text-white">
            <span className="font-semibold text-[3rem] leading-snug">
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

        
      {/* </div> */}
    </section>    
  );
}
