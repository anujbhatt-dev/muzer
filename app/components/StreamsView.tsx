"use client"
import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '@clerk/nextjs';
import { FileStack, Forward, ThumbsUp } from 'lucide-react';
//@ts-ignore
import youtubeThumbnail from "youtube-thumbnail"
import { AnimatePresence, motion } from "motion/react"
import YouTube from 'react-youtube';

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




export default function StreamsView({streamerId,playVideo=false}:{streamerId:string,playVideo:boolean}) {
  const {userId} = useAuth()
  const [streams,setStreams] = useState<YouTubeVideo[] | null>(null);
  const [streamsLoading,setStreamsLoading] = useState<boolean>(true);
  const [songInput, setSongInput] = useState("");
  const [thumbnail,setThumbnail] = useState("");
  const [currentStream,setCurrentStream] = useState<string>("");
  const playerRef = useRef<any>(null);
  const now = new Date();
  const [seekTime,setSeekTime] = useState<Number>(0);


  const handleSubmit = async () => {
    try {
      await fetch("/api/streams/add",{
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
              id: streamerId,
              asker: userId,
            }),
          });
    
          const data = await res.json();
          // console.log("streams: "+JSON.stringify(data));
          setStreams(data.streams);    
          setCurrentStream(data.activeStream.stream.extractedId)    
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
    
    return () => {
      clearInterval(streamInterval);
    };    
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

    {currentStream!="" || streams && streams?.length>0 ?
    <div className='flex flex-col-reverse lg:flex-row justify-between gap-x-8 gap-y-4'>
        {(streams && streams.length) ? 
        <div className='min-h-full  flex-1 '>
              <div className='flex flex-col gap-y-4'>
                <div className='text-2xl mb-4 mt-8 md:mt-0 font-bold'>         
                  Upcoming Song
                </div>
                <AnimatePresence>
                {streams.map((stream, i) => (
                  
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
        <div className="flex-1">
          <div className='text-2xl mb-8 font-bold hidden lg:flex'>         
            Add Song
          </div>   
          <div className="flex flex-col">
            <input
              placeholder="Add Youtube Song URL"
              className="border rounded-lg border-zinc-600/80 w-full mb-4 h-12 bg-zinc-950 text-center p-2 text-md"
              type="text"
              value={songInput}
              onChange={(e) => setSongInput(e.target.value)}
              />
            {thumbnail!="" && !thumbnail.includes("null") 
              &&
              <img className="rounded-xl mb-4 " src={thumbnail} alt="" />            
            }
            <button onClick={handleSubmit} className="text-lg bg-purple-900 hover:bg-purple-800 cursor-pointer px-10 py-2 gap-4 rounded-lg shadow-sm active:shadow-md active:shadow-purple-500/50 hover:shadow-purple-500/10  lg:max-w-[20rem] mx-auto transition-all duration-150 text-center flex justify-center w-full">
                <FileStack/>
                 Add to Queue
            </button>
          </div>

          {/* current stream */}


          <div className='text-2xl  mt-10 font-bold hidden lg:flex'>         
            Now Playing
          </div>   
          <div>
          <div className=''>
          {streams && (
            // <iframe
            // className="w-full my-4 rounded-xl"
            // width="560"
            // height="315"
            // src={`https://www.youtube.com/embed/${currentStream}?autoplay=1&controls=0`}
            // title="YouTube video player"
            // allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            // allowFullScreen
            // ></iframe>
            <YouTube 
              videoId={currentStream} 
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
            }}} className='my-4 rounded-md mx-auto ' />
          )}
          </div>
          {playVideo &&
            <button onClick={playNext} className="text-lg bg-[orangered] hover:bg-[orangered]/90 cursor-pointer px-10 py-2 gap-4 rounded-lg shadow-sm active:shadow-md active:shadow-[orangered]/50 hover:shadow-[orangered]/10  lg:max-w-[20rem] mx-auto transition-all duration-150 text-center w-full flex justify-center">
                <Forward/>
                Play Next
            </button>
          }
          </div>
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
