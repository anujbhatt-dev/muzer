"use client"
import React, { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs';
import Image from 'next/image';
import { FileStack, Forward, ThumbsUp } from 'lucide-react';
//@ts-ignore
import youtubeThumbnail from "youtube-thumbnail"

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
    upvotes:number
    hasUpvoted: boolean
  }

export default function StreamsView({streamerId}:{streamerId:string}) {
  const {userId} = useAuth()
  const [streams,setStreams] = useState<YouTubeVideo[] | null>(null);
  const [streamsLoading,setStreamsLoading] = useState<boolean>(true);
  const [songInput, setSongInput] = useState("");
  const [thumbnail,setThumbnail] = useState("");
  const [currentStrem,setCurrentStream] = useState<string>("");


  const handleSubmit = async () => {
    try {
      await fetch("/api/streams",{
        method:"POST",
        body:JSON.stringify({
          creatorId:streamerId,
          url:songInput
        })
      })
      setSongInput("")
      setThumbnail("")
    } catch (error) {
      
    }
  }

  useEffect(()=>{
    setThumbnail(youtubeThumbnail(songInput).medium.url)    
    console.log(JSON.stringify(youtubeThumbnail(songInput)));
        
  }, [songInput, youtubeThumbnail])
  

  useEffect(() => {
    if (!streamerId) return;
  
    const fetchStreams = async () => {
      setStreamsLoading(true)
      try {
        const res = await fetch("/api/streams/my", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: streamerId }),
        });
        const data = await res.json();
        setStreams(data.streams);
      } catch (err) {
        console.error("Failed to fetch streams:", err);
      } finally{
        setStreamsLoading(false)
      }
    };
  
    fetchStreams();
  }, [streamerId]);

  useEffect(()=>{
    const fetchCurrentStream = async  () => {
        const result =  await fetch("",{
            method:"POST",
            body:JSON.stringify({
                creatorId:streamerId
            })
        })
        const data = await result.json()
        setCurrentStream(data.extractedId)
    }
    fetchCurrentStream()
  },[])

  const playNext = () =>{

  }

  const handleVote = async (streamId:string,idx:number, voteType:string) =>{
      try {
        await fetch(`/api/streams/${voteType}`,{
            method:"POST",
            body:JSON.stringify({
                streamId:streamId,
                userId
            })
        })
      } catch (error) {
        
      }
  }


  return (
    <div className='flex justify-center gap-x-2'>
        {streams && streams.length ?<div className='min-h-full max-w-3xl'>
              <div className='flex flex-col gap-y-4'>
                { streams.map((stream, i) => (
                  
                  <div key={stream.id} className='flex items-center justify-between'>
                    <div className='overflow-hidden mx-5 rounded-md '>
                        <img width={150} height={100} alt={stream.title} src={stream.bigImage} className='object-cover'/>
                    </div>
                    <div className='flex-1 self-start '>
                      <p className='text-zinc-300'>{stream.title}</p>
                      <p className='text-white '><span className='text-zinc-500 text-sm'>votes:</span> <span>{stream.upvotes}</span></p>
                    </div>
                    <div onClick={()=>handleVote(stream.id,i, stream.hasUpvoted?"downvote":"upvote")} className='bg-zinc-900 hover:bg-purple-800 cursor-pointer px-3 py-3 flex items-center self-start gap-4 rounded-lg shadow-xl active:shadow-md active:shadow-purple-500/50 hover:shadow-purple-500/10  hover:-translate-y-2 active:-translate-y-0 transition-all duration-150 mx-4'>
                        <ThumbsUp className='w-4 h-4 ' fill={stream.hasUpvoted?"white":"transparent"}/>                        
                    </div>
                  </div>
                  
                ))}
              </div>
        </div>:
          <div className='flex justify-center items-center relative h-[60vh] overflow-hidden max-w-3xl rounded-2xl mx-auto'>                        
            {streamsLoading?
            <h4 className='absolute uppercase font-bold text-7xl text-center tracking-wide leading-25'>
              <span className='text-[orangered]'>Streams</span> Loading...
            </h4>
            :
            <h4 className='absolute uppercase font-bold text-7xl text-center tracking-wide leading-25'>
              No <span className='text-[orangered]'>Stream</span> added yet
            </h4>
            
            }
          </div>
        }
        <div className="">
          <div className="flex flex-col">
            <input
              placeholder="ADD YOUR SONG HERE"
              className="border rounded-lg border-zinc-600/80 w-[30rem] mb-4 h-12 bg-zinc-950 text-center p-2 text-sm"
              type="text"
              value={songInput}
              onChange={(e) => setSongInput(e.target.value)}
            />
            {thumbnail!="" && !thumbnail.includes("null") 
              &&
              <img className="rounded-xl mb-4 " src={thumbnail} alt="" />            
            }
            <button onClick={handleSubmit} className="text-lg bg-purple-900 hover:bg-purple-800 cursor-pointer px-10 py-2 gap-4 rounded-lg shadow-xl active:shadow-md active:shadow-purple-500/50 hover:shadow-purple-500/10  hover:-translate-y-2 active:-translate-y-0 transition-all duration-150 text-center flex justify-center">
                <FileStack/>
                 Add to Queue
            </button>
          </div>

          {/* current stream */}
          <div>
                {streams && <iframe className='w-full my-4 rounded-xl' width="560" height="315" src={`https://www.youtube.com/embed/${streams[1].extractedId}?si=YWuIAPabaKdu4hYT&amp;controls=0`} title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>}
                <button onClick={playNext} className="text-lg bg-[orangered] hover:bg-[orangered]/90 cursor-pointer px-10 py-2 gap-4 rounded-lg shadow-xl active:shadow-md active:shadow-[orangered]/50 hover:shadow-[orangered]/10  hover:-translate-y-2 active:-translate-y-0 transition-all duration-150 text-center w-full flex justify-center">
                    <Forward/>
                    Play Next
                </button>
          </div>
        </div>
    </div>
  )
}
