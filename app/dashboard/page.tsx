"use client"
import React, { useEffect, useState } from 'react'
import SplitText from "@/app/components/ui/SplitText/SplitText"
import { useAuth } from '@clerk/nextjs';
import StarBorder from '../components/ui/StarBorder/StarBorder';
import Image from 'next/image';
import { ThumbsUp } from 'lucide-react';

interface YouTubeVideo {
  id: string;
  type: "Youtube";
  active: boolean;
  userId: string;
  title: string;
  smallImg: string;
  bigImage: string;
  url: string;
  extractedId: string;
}

export default function Dashboard() {
  const [streams,setStreams] = useState<YouTubeVideo[] | null>(null);
  const {userId} = useAuth()

  useEffect(() => {
    if (!userId) return;
  
    const fetchStreams = async () => {
      try {
        const res = await fetch("/api/streams/my", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: userId }),
        });
        const data = await res.json();
        setStreams(data.streams);
      } catch (err) {
        console.error("Failed to fetch streams:", err);
      }
    };
  
    fetchStreams();
  }, [userId]);

  return (
    <div className=''>
        <div className='text-7xl uppercase text-center py-10 font-bold'>         
        <SplitText text='Dashboard' />
        </div>
        <div className='min-h-full max-w-3xl m-auto'>
              <div className=''>
                {streams && streams.map((stream, i) => (
                  
                  <div key={stream.id} className='my-4 flex items-center justify-between'>
                    <div className='overflow-hidden mx-5 rounded-md '>
                        <Image width={150} height={100} alt={stream.title} src={stream.bigImage}/>
                    </div>
                    <div className='flex-1 self-start'>
                      <p className='text-zinc-400'>{stream.title}</p>
                    </div>
                    <div className='bg-purple-900 hover:bg-purple-800 cursor-pointer px-4 py-4 flex items-center gap-4 rounded-2xl shadow-xl active:shadow-md active:shadow-purple-500/50 hover:shadow-purple-500/10  hover:-translate-y-2 active:-translate-y-0 transition-all duration-150 mx-4'>
                        <ThumbsUp className='w-5 h-5 ' fill="white"/>                        
                    </div>
                  </div>
                  
                ))}
              </div>
              <div className=''>

              </div>
        </div>
    </div>
  )
}
