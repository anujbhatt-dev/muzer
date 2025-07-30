"use client"
import StreamsView from '../components/StreamsView';
import { useAuth } from "@clerk/nextjs";
import { toast } from 'sonner';
import { Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";




export default function Dashboard() {
  const { userId } = useAuth();
  const [username,setUsename] = useState("")

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
          console.log("Dashboard ",data.username);
          
        } catch (error) {
          console.log("error fetching username dashboard "+error);          
        }
    }
    fetchUserName();

  },[])




  return (
    <div className='relative '>      
      <StreamsView streamerName={username as string} playVideo={true} />
    </div>
  );
}
