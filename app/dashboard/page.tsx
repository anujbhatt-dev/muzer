"use client"
import SplitText from "@/app/components/ui/SplitText/SplitText";
import StreamsView from '../components/StreamsView';
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { toast } from 'sonner';
import { Share, Share2 } from "lucide-react";

export default function Dashboard() {
  const { userId } = useAuth();

  const handleCopy = () => {
    if (!userId) return;

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const link = `${baseUrl}/creator/${userId}`;

    navigator.clipboard.writeText(link)
      .then(() => {
        toast.success("Link copied!",{
          style:{
            color:"green",
            background:"rgba(0,0,0,0.5)",
            border:"1px solid green"
          }
        })
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  return (
    <div className='relative '>
      <div className='text-xl uppercase py-10 font-bold text-center md:text-left md:mx-20 flex justify-between items-center'>
        <SplitText text='Dashboard' />
        <div className="flex justify-center md:justify-start items-center">
          <button
            onClick={handleCopy}
            className="bg-purple-800 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition cursor-pointer"
          >
            <Share2/>            
          </button>          
        </div>
      </div>
      
      <StreamsView streamerId={userId as string} playVideo={true} />
    </div>
  );
}
