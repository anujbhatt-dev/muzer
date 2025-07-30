"use client"
import React, { useEffect, useRef, useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs';
import { ThumbsUp } from 'lucide-react';
//@ts-ignore
import youtubeThumbnail from "youtube-thumbnail"
import { AnimatePresence, motion } from "motion/react"
import YouTube from 'react-youtube';
import { IconArrowNarrowRightDashed } from '@tabler/icons-react';
import { AnimatedTooltip } from './animated-tooltip';
import Image from 'next/image';
import { CardBody, CardContainer, CardItem } from '@/components/ui/3d-card';
import Dither from './ui/Dither/Dither';
import { BackgroundGradient } from './ui/background-gradient';
import { io, Socket } from "socket.io-client";

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

interface OnlineUserSchema {
  socketId: string;
  fullName: string;
  imageUrl: string;
}

  



export default function StreamsView({streamerName,playVideo=false}:{streamerName:string,playVideo:boolean}) {
  const {userId} = useAuth()
  const [streams,setStreams] = useState<YouTubeVideo[] | null>(null);
  const [streamsLoading,setStreamsLoading] = useState<boolean>(true);
  const [songInput, setSongInput] = useState("");
  const [thumbnail,setThumbnail] = useState<string | null>(null);
  const [currentStream,setCurrentStream] = useState<YouTubeVideo | null>(null);
  const playerRef = useRef<any>(null);
  const [seekTime,setSeekTime] = useState<number>(0);
  const [nextLoading,setNextLoading] = useState(false);
  const [username,setUsename] = useState("");
  const [onlineUsers,setOnlineUsers] = useState<OnlineUserSchema[] | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const { user } = useUser();



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

    
  
    let streamInterval: NodeJS.Timeout;

    const fetchUserName = async () => {
      const res = await fetch("/api/me",{
        method:"POST",
        body:JSON.stringify({
          id:userId
        })
      })
      const data = await res.json()
      setUsename(data.username)
      console.log("username fetched", data.username, streamerName);      
      const socket = io("http://localhost:4000", {
        query: { 
          creatorUsername:streamerName,
          creatorId:"",
          joineeId:userId,
          fullname:user?.firstName || "Guest user",
          imageUrl:user?.imageUrl
         },
      });  
      socketRef.current = socket
      socket.on('joined_room',(res)=>{
          console.log(`streamers `, (res.onlineUsers));      
          setOnlineUsers(res.onlineUsers)    
      })
    }
    fetchUserName();
  
    

    const fetchStreams = async () => {
      if (document.visibilityState !== "visible") return;
      
      try {
        const res = await fetch("/api/streams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: streamerName,
            asker: userId,
          }),
        });
  
        const data = await res.json();
        setStreams(data.streams);
  
        if (data.activeStream?.stream) {
          const stream = data.activeStream.stream;
          setCurrentStream(stream);
  
          if (stream.playedTs) {
            const diff = Math.floor(
              (new Date().getTime() - new Date(stream.playedTs).getTime()) / 1000
            );
            console.log("seek time", diff);
            setSeekTime(diff + 2);
          }
        } else {
          setCurrentStream(null);
          setSeekTime(0);
        }
      } catch (err) {
        console.error("Failed to fetch streams:", err);
      } finally {
        setStreamsLoading(false);
      }
    };
  
    // Initial call
    fetchStreams();
    // Poll every 5 seconds
    streamInterval = setInterval(fetchStreams, 5000);
  
    // Cleanup on unmount


    console.log("thumbnail  "+thumbnail)

    return () => clearInterval(streamInterval);
  }, [streamerName, userId]);
  


  const playNext = async () =>{
    if (nextLoading) return;
    if(streamerName!=username) return;
    try {
      setNextLoading(true)
      await fetch(`/api/streams/next`,{
          method:"POST",
          body:JSON.stringify({              
              creatorId:userId
          })
      })      
    } catch (error) {
      
    } finally {
      setTimeout(() => {
        setNextLoading(false)        
      }, 2000);
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
        {thumbnail && !thumbnail.includes("null") &&
          (
          <Image
            width={1080}
            height={916}
            className="rounded-full h-3/4 w-auto aspect-square absolute left-2 animate-spin top-[50%] -translate-y-[50%] object-cover"
            src={thumbnail}
            alt=""
          />
        )}
      
      <button onClick={handleSubmit} className="absolute right-4 flex top-[50%] -translate-y-[50%] cursor-pointer">
          <IconArrowNarrowRightDashed className='w-10 h-10'/>
      </button>

    </div>

    {(currentStream || streams && streams?.length>0)  ?
    <div className='flex flex-col-reverse lg:flex-row-reverse justify-between gap-x-4 gap-y-2'>
        {(streams && streams.length) ? 
        <div className='min-h-full  flex-1 '>
              <div className='flex flex-col gap-y-4 '>
                <div className='text-sm uppercase mt-8 md:mt-0 text-zinc-500'>         
                  Watch Next
                </div>
                <AnimatePresence>
                {streams.map((stream, i) => (
                  <div key={stream.id+i} >
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
                  
                  className='flex flex-wrap md:flex-row gap-x-2  gap-y-4 md:items-center justify-between bg-zinc-900/80 p-2 lg:p-4 border border-zinc-400/20 shadow-md shadow-purple-900/10 rounded-lg'>
                    <div className=''>
                        <Image width={150} height={100} alt={stream.title} src={stream.bigImage} className='w-[6rem] h-auto rounded-md object-cover'/>
                    </div>
                    <div className='flex-1 self-start'>
                      <p className='text-zinc-300 text-sm md:text-md '>{stream.title}</p>
                      <p className='text-white '><span className='text-zinc-500 text-sm'>votes:</span> <span>{stream.upvotes}</span></p>
                    </div>
                    <div onClick={()=>handleVote(stream.id,i, stream.hasUpvoted?"downvote":"upvote")} className='bg-zinc-800 hover:bg-purple-800 cursor-pointer px-3 py-3 flex items-center self-start gap-4 rounded-lg shadow-xl active:shadow-md active:shadow-purple-500/50 hover:shadow-purple-500/10  max-w-sm mx-auto transition-all duration-150 md:mx-4'>
                        <ThumbsUp className='w-4 h-4 ' fill={stream.hasUpvoted?"white":"transparent"}/>                        
                    </div>
                  </motion.div>                  
                    {streams.length>1 && i==0 && <div className='text-sm uppercase mt-4 text-zinc-500'>         
                      Upcoming Song
                    </div>}
                    </div>
                ))}
                </AnimatePresence>  
              </div>
        </div>:
        <div  className='flex items-stretch flex-1 relative rounded-2xl overflow-hidden min-h-[60%]'>      
              <Dither
                waveColor={[0.5, 0.5, 0.5]}
                disableAnimation={false}
                enableMouseInteraction={true}
                mouseRadius={0.3}
                colorNum={4}
                waveAmplitude={0.3}
                waveFrequency={3}
                waveSpeed={0.05}                
              />        
              <CardContainer  className="inter-var h-full w-full flex-1" containerClassName='flex-1  absolute -translate-x-[50%] left-[50%]'>
              <BackgroundGradient>
                <CardBody
                  className="relative group/card  hover:shadow-2xl hover:shadow-emerald-500/[0.1]  backdrop-blur-sm bg-black/80 border-white/[0.2] rounded-xl p-6 border flex flex-col justify-center items-center w-auto ">
                  <CardItem 
                    translateZ="50"
                    translatex="-10"
                    translateY="-10"
                    className="text-lg font-bold text-zinc-300 w-full text-center uppercase hover:scale-150">         
                    Add More <span className='text-[orangered]'>Songs</span> in the queue
                  </CardItem>
                  
                </CardBody>
              </BackgroundGradient>
              </CardContainer>
              {/* </div> */}
        </div>
          }
        <div className="flex-1 flex flex-col gap-y-8 bg-black/70 backdrop-blur-3xl p-2 rounded-2xl">
          {/* current stream */}
          <div className=''>           
          <div>
          <div className='rounded-[10px] overflow-hidden mb-4'>
          {currentStream?.extractedId && (
            <BackgroundGradient>

            <YouTube 
              videoId={currentStream?.extractedId} 
              title={currentStream?.title} 
              iframeClassName='h-[200px] md:h-[350px] lg:h-[500px] w-full'
              onEnd={playNext}  
              loading="eager"
              onReady={(e)=>{
                playerRef.current = e.target
                playerRef.current.seekTo(seekTime)
                playerRef.current.playVideo();
              }}
              opts={{
              playerVars: {              
              autoplay: 1,
              mute: 0,
              modestbranding: 1,
              controls: 1,
            }}} className='mx-auto rounded-lg overflow-hidden' />
            </BackgroundGradient>
          )}
          </div>
          

          {playVideo &&
            <div onClick={playNext} className={`${nextLoading && "opacity-30"} flex flex-col lg:flex-row mx-auto lg:items-center justify-between cursor-pointer  pr-6 pl-2 pb-2`}>              
              <div className='lg:w-2/3 text-sm opacity-80 hover:opacity-100 transition-all duration-150'>
                {currentStream?.title}
              </div>
              {
                streams && streams.length>0 &&
                  <div className='flex items-center justify-end cursor-pointer gap-x-2'>
                    <div className='text-zinc-500 text-sm uppercase'>
                      Next
                    </div>
                    <IconArrowNarrowRightDashed className='w-14 h-14 hover:animate-pulse'/>
                    <AnimatedTooltip items={[{id:1,name:"Next Stream",designation:streams && streams?.[0]?.title || "" ,image:streams && streams?.[0]?.smallImg || ""}]}/>
                  </div>
              }
            </div>
          }

          {/* online users */}
          {onlineUsers &&
            <div>
                <div className='text-zinc-500 text-sm uppercase'>
                  Online users
                </div>
                {onlineUsers.map((onlineuser,i)=>(
                   <div key={i}>
                      {JSON.stringify(onlineuser)}
                   </div>
                ))}
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
            <CardContainer  className="inter-var">
            <BackgroundGradient>
              <CardBody
                className="relative group/card  hover:shadow-2xl hover:shadow-emerald-500/[0.1] bg-black/50 border-white/[0.2] h-[15rem] rounded-xl p-6 border flex flex-col justify-center items-center w-auto lg:w-[55rem]">
                <CardItem 
                  translateZ="50"
                  className="text-lg font-bold text-zinc-200 w-full text-center uppercase ">         
                  <span className='text-[orangered]'>Streams</span> Loading
                </CardItem>            
              </CardBody>
            </BackgroundGradient>  
          </CardContainer>

            : !thumbnail?.includes("null") ?
            <CardContainer  className="inter-var">
              <BackgroundGradient>
                <CardBody
                  className="relative group/card  hover:shadow-2xl hover:shadow-emerald-500/[0.1] bg-black/50 border-white/[0.2] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border">
                  <CardItem 
                    translateZ="50"
                    className="text-sm font-bold text-zinc-200 w-full text-right uppercase ">         
                    Start <span className='text-[orangered]'>Streaming</span>
                  </CardItem>   
                  {thumbnail && thumbnail!="" && !thumbnail.includes("null") &&
                  <CardItem 
                    translateZ="100"
                    rotateX={20}
                    rotateZ={10}
                    className="w-full mt-4">
                      <Image width={1080} height={916} className="rounded-xl mb-4 w-full h-full" src={thumbnail ?? "https://fastly.picsum.photos/id/237/200/300.jpg?hmac=TmmQSbShHz9CdQm0NkEjx1Dyh_Y984R9LpNrpvH2D_U"} alt="" />            
                  </CardItem>
                  }
                  <CardItem 
                    translateZ={20}
                    translateX={40}
                    as="button"
                    className="p-2 rounded-xl bg-zinc-950  text-white text-lg font-bold flex gap-x-2 items-center justify-center hover:bg-amber-200 hover:text-black cursor-pointer"
                    onClick={handleSubmit}>          
                      <div
                        className="text-sm font-bold w-full text-right uppercase ">         
                        Play <span className='text-[orangered]'>Next</span>
                      </div>       
                      <IconArrowNarrowRightDashed className='w-8 h-8'/>
                  </CardItem>
                </CardBody>
              </BackgroundGradient>
            </CardContainer>
            :
            <CardContainer  className="inter-var">
            <CardBody
               className="relative group/card  hover:shadow-2xl hover:shadow-emerald-500/[0.1] bg-black/50 border-white/[0.2] h-[15rem] rounded-xl p-6 border flex flex-col justify-center items-center w-auto lg:w-[55rem]">
              <CardItem 
                translateZ="50"
                className="text-lg font-bold text-zinc-200 w-full text-center uppercase ">         
                Add <span className='text-[orangered]'>Streams</span> start <span className='text-[orangered]'>Streaming</span>
              </CardItem>
              <CardItem 
                translateZ="50"
                className="text-sm font-bold text-zinc-200 w-full text-center mt-4">         
                  <p >
                    No need to watch alone just join your favorite streams
                  </p>
              </CardItem>                 
            </CardBody>
          </CardContainer>
            
            
          }
          </div> 
          }
      </div>
  )
}
