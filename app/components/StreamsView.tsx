"use client"
import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '@clerk/nextjs';
import { FileStack, Forward, ThumbsUp } from 'lucide-react';
//@ts-ignore
import youtubeThumbnail from "youtube-thumbnail"
import { AnimatePresence, motion } from "motion/react"
import YouTube from 'react-youtube';
import { IconArrowNarrowRightDashed, IconArrowRampRight } from '@tabler/icons-react';
import { AnimatedTooltip } from './animated-tooltip';
import Image from 'next/image';

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

  



export default function StreamsView({streamerName,playVideo=false}:{streamerName:string,playVideo:boolean}) {
  const {userId} = useAuth()
  const [streams,setStreams] = useState<YouTubeVideo[] | null>(null);
  const [streamsLoading,setStreamsLoading] = useState<boolean>(true);
  const [songInput, setSongInput] = useState("");
  const [thumbnail,setThumbnail] = useState("");
  const [currentStream,setCurrentStream] = useState<YouTubeVideo | null>(null);
  const playerRef = useRef<any>(null);
  const now = new Date();
  const [seekTime,setSeekTime] = useState<Number>(0);
  



  const handleSubmit = async () => {
    try {
      await fetch("/api/streams/add",{
        method:"POST",
        body:JSON.stringify({
          creatorName:streamerName,
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
    if (!streamerName) return;
  
    let streamInterval: NodeJS.Timeout; // Correct type for setInterval in Node/Next.js
  
    const fetchStreams = async () => {
      setStreamsLoading(true);
      try {
        streamInterval = setInterval( async () => {
          // Add your polling logic here if needed
          const res = await fetch("/api/streams", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              username: streamerName,
              asker: userId,
            }),
          });
    
          const data = await res.json();
          // console.log("streams: "+JSON.stringify(data));
          setStreams(data.streams);    
          setCurrentStream(data.activeStream.stream)    
          const diff = Math.floor((now.getTime() - new Date(data.activeStream.stream.playedTs).getTime()) / 1000)
          console.log("seek time "+diff)          
          setSeekTime(diff+2)  
        }, 5000);
  
      } catch (err) {
        console.error("Failed to fetch streams:", err);
      } finally {
        setStreamsLoading(false);
      }
    };
  
    fetchStreams();

      // Setup socket connection
    

    
    // Cleanup
    return () => {     
      clearInterval(streamInterval);
    };    
  }, [streamerName]);


  const playNext = async () =>{
    try {
      await fetch(`/api/streams/next`,{
          method:"POST",
          body:JSON.stringify({              
              creatorId:userId
          })
      })
    } catch (error) {
      
    }
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
    <div className='md:px-20 mb-[20rem]'>
    <div className='mb-14 mt-8 flex justify-center gap-x-2 h-[4rem] max-w-4xl relative mx-auto '>
        <input
          placeholder="Add Youtube Song URL"
          className="border rounded-full border-zinc-700/80 w-full mb-4 bg-transparent backdrop-blur-3xl text-center p-2 text-md h-full px-[5rem] lg:px-[10rem] outline-none"
          type="text"
          value={songInput}
          onChange={(e) => setSongInput(e.target.value)}
          />
        {thumbnail!="" && !thumbnail.includes("null") 
          &&
          <Image width={1080} height={916} className="rounded-full  h-3/4 w-auto aspect-square absolute left-2 animate-spin top-[50%] -translate-y-[50%]" src={thumbnail} alt="" />            
        }
      
      <button onClick={handleSubmit} className="absolute right-4 flex top-[50%] -translate-y-[50%] ">
          <IconArrowNarrowRightDashed className='w-10 h-10'/>
      </button>

    </div>

    {currentStream || streams && streams?.length>0 ?
    <div className='flex flex-col-reverse lg:flex-row-reverse justify-between gap-x-4 gap-y-2'>
        {(streams && streams.length) ? 
        <div className='min-h-full  flex-1 '>
              <div className='flex flex-col gap-y-4 '>
                <div className='text-sm uppercase mt-8 md:mt-0 text-zinc-500'>         
                  Watch Next
                </div>
                <AnimatePresence>
                {streams.map((stream, i) => (
                  <>
                  <motion.div  
                  layout 
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{
                    duration: 0.3,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay: i * 0.05,
                  }}
                  key={stream.id} 
                  className='flex flex-wrap md:flex-row gap-x-2  gap-y-4 md:items-center justify-between bg-zinc-900/80 p-2 lg:p-4 border border-zinc-400/20 shadow-md shadow-purple-900/10 rounded-lg'>
                    <div className=''>
                        <img width={150} height={100} alt={stream.title} src={stream.bigImage} className='object-cover w-[6rem] rounded-md'/>
                    </div>
                    <div className='flex-1 self-start'>
                      <p className='text-zinc-300 text-sm md:text-md '>{stream.title.substring(0,75)}</p>
                      <p className='text-white '><span className='text-zinc-500 text-sm'>votes:</span> <span>{stream.upvotes}</span></p>
                    </div>
                    <div onClick={()=>handleVote(stream.id,i, stream.hasUpvoted?"downvote":"upvote")} className='bg-zinc-800 hover:bg-purple-800 cursor-pointer px-3 py-3 flex items-center self-start gap-4 rounded-lg shadow-xl active:shadow-md active:shadow-purple-500/50 hover:shadow-purple-500/10  max-w-sm mx-auto transition-all duration-150 md:mx-4'>
                        <ThumbsUp className='w-4 h-4 ' fill={stream.hasUpvoted?"white":"transparent"}/>                        
                    </div>
                  </motion.div>                  
                    {i==0 && <div className='text-sm uppercase mt-8 md:mt-0 text-zinc-500'>         
                      Upcoming Song
                    </div>}
                    </>
                ))}
                </AnimatePresence>  
              </div>
        </div>:
        <div className='flex items-center justify-center flex-1  flex-col '>
              <div className='text-2xl mb-8 font-bold self-start'>         
                Upcoming Song
              </div>  
              <div className='flex items-center justify-center bg-zinc-900/80 p-4 border border-zinc-400/20 shadow-md shadow-purple-900/10 rounded-lg flex-1 w-full'>
                <p className='text-3xl font-bold tracking-wide'>
                    No <span className='text-[orangered] '>Songs</span> in the Queue
                </p>
              </div>
        </div>
          }
        <div className="flex-1 flex flex-col gap-y-8 bg-black/30 backdrop-blur-3xl p-1 rounded-lg">
          {/* current stream */}
          <div className=''>           
          <div>
          <div className='rounded-[10px] overflow-hidden mb-4'>
          {streams && (
            <YouTube 
              videoId={currentStream?.extractedId} 
              onEnd={playNext}  
              onReady={(e)=>{
                playerRef.current = e.target
                playerRef.current.seekTo(seekTime)
                playerRef.current.playVideo();
              }}
              opts={{
              width:"100%",
              height:"500px",
              playerVars: {              
              // https://developers.google.com/youtube/player_parameters
              autoplay: 1,
              mute: 0,
              modestbranding: 1,
              controls: 1,
            }}} className='mx-auto' />
          )}
          </div>
          

          {playVideo &&
            // <button onClick={playNext} className="text-lg bg-[orangered] hover:bg-[orangered]/90 cursor-pointer px-10 py-2 gap-4 rounded-lg shadow-sm active:shadow-md active:shadow-[orangered]/50 hover:shadow-[orangered]/10  mx-auto transition-all duration-150 text-center flex justify-center">
            // </button>
            <div onClick={playNext} className='flex flex-col lg:flex-row mx-auto lg:items-center justify-between cursor-pointer  pr-6 pl-2 pb-2'>              
              <div className='lg:w-1/2'>
                {currentStream?.title}
              </div>
              <div className='flex items-center justify-end cursor-pointer gap-x-2'>
                <div className='text-zinc-500 text-sm uppercase'>
                  Upcoming Song
                </div>
                <IconArrowNarrowRightDashed className='w-14 h-14 hover:animate-pulse'/>
                <AnimatedTooltip items={[{id:1,name:"Next Stream",designation:streams && streams[0].title || "" ,image:streams && streams[0].smallImg || ""}]}/>
              </div>
            </div>
          }
          </div>
        </div>
        {/*  */}
        
        </div>
    </div>
    :
          <div className='flex justify-center items-center relative h-[60vh] overflow-hidden rounded-2xl mx-auto'>                        
            {streamsLoading?
            <h4 className='absolute uppercase font-bold text-7xl text-center tracking-wide leading-25'>
              <span className='text-[orangered]'>Streams</span> Loading...
            </h4>

            :
            <div className='uppercase font-bold text-7xl text-center tracking-wide leading-25'>
              
              <div className='text-2xl mb-8 font-bold'>         
                Start <span className='text-[orangered]'>Streaming</span>
              </div>   
              <div className="flex flex-col items-center">
                <input
                  placeholder="ADD YOUR SONG HERE"
                  className="border rounded-lg border-zinc-600/80 mb-4 h-12 bg-zinc-950 text-center p-2 text-sm w-[80vw]"
                  type="text"
                  value={songInput}
                  onChange={(e) => setSongInput(e.target.value)}
                  />
                {thumbnail!="" && !thumbnail.includes("null") 
                  &&
                  <img className="rounded-xl mb-4 " src={thumbnail} alt="" />            
                }
                <button onClick={handleSubmit} className="w-[20rem] text-lg bg-purple-900 hover:bg-purple-800 cursor-pointer px-10 py-2 gap-4 rounded-lg shadow-xl active:shadow-md active:shadow-purple-500/50 hover:shadow-purple-500/10  max-w-sm mx-auto transition-all duration-150 text-center flex justify-center">
                    <FileStack/>
                    Add to Queue
                </button>
              </div>
              <h4 className='uppercase font-bold text-xl text-center tracking-wide leading-25 mt-10'>
                No <span className='text-[orangered]'>Stream</span> added yet
              </h4>
            </div>
            
          }
          </div>        }
      </div>
  )
}
