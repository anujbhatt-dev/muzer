import Redirect from "./components/Redirect";
import { Play, Users, Music } from "lucide-react";
import GetStarted from "./components/GetStarted";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {

  
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden ">
      
      {/* <Redirect/>       */}

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
          <h1 className="text-pink-700 font-bold text-[2.5rem] uppercase">
            Naachogaao
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            Join your favorite creators&apos; music streams
          </p>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-white">
            Add songs, vote for favorites, and experience music together in real-time. 
            The future of social music streaming is here.
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mb-12 animate-fade-in delay-300">
          <div className="flex items-center gap-2 text-blue-700">
            <Users className="w-6 h-6" />
            <span className="text-lg font-semibold ">10K+ Active Streamers</span>
          </div>
          <div className="flex items-center gap-2 text-secondary">
            <Music className="w-6 h-6" />
            <span className="text-lg font-semibold">1M+ Songs Shared</span>
          </div>
          <div className="flex items-center gap-2 text-accent">
            <Play className="w-6 h-6" />
            <span className="text-lg font-semibold">24/7 Live Streams</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in delay-500">
          <SignedOut>

          <GetStarted classes="text-lg bg-purple-900 hover:bg-purple-800 cursor-pointer px-10 py-4 flex items-center gap-4 rounded-2xl shadow-sm active:shadow-md active:shadow-purple-500/50 hover:shadow-purple-500/10  transition-all duration-150 justify-center"/>
          </SignedOut>
          <button className="text-lg bg-pink-900 cursor-pointer px-10 py-4 flex items-center gap-4 rounded-2xl justify-center">
            <Users className="w-4 h-4" />
            Join Stream
          </button>
        </div>
      </div>
    </section>    
  );
}
