"use client"
import SplitText from "@/app/components/ui/SplitText/SplitText";
import StreamsView from '../components/StreamsView';
import { useAuth } from "@clerk/nextjs";
import { toast } from 'sonner';
import { Share2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { userId } = useAuth();
  const [username,setUsename] = useState("")

  const handleCopy = () => {
    if (!userId) return;

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const link = `${baseUrl}/creator/${username}`;

    navigator.clipboard.writeText(link)
      .then(() => {
        toast.success("Link copied!",{
          style:{
            color:"green",
            background:"rgba(0,0,0,1)",
            border:"1px solid green"
          }
        })
      })      
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };


  useEffect(()=>{
    const fetchUserName = async () =>{
        try {
          const res = await fetch("/api/me",{
            method:"POST",
            body:JSON.stringify({
              id:userId
            })
          })
          const data = await res.json()
          setUsename(data.username)
        } catch (error) {
          console.log("error fetching username dashboard "+error);          
        }
    }

    fetchUserName();
  },[])




  return (
    <div className='relative '>
      <div className='text-xl uppercase py-10 font-bold text-center md:text-left md:mx-20 flex justify-between items-center'>
        {/* <SplitText text='Dashboard' /> */}
        <div className="flex justify-center md:justify-start items-center">
          <button
            onClick={handleCopy}
            style={{zIndex:1000}}
            className="bg-purple-800 hover:bg-purple-700 text-white p-2 rounded-full text-sm transition cursor-pointer w-10 h-10 flex items-center justify-center fixed z-50 bottom-10 right-10"
          >
            <Share2 className="w-3 h-3"/>            
          </button>          
        </div>
      </div>
      
      <StreamsView streamerName={username as string} playVideo={true} />
    </div>
  );
}
