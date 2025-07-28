"use client"
import StreamsView from '../components/StreamsView';
import { useAuth } from "@clerk/nextjs";
import { toast } from 'sonner';
import { Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
// import {io, Socket} from "socket.io-client"




export default function Dashboard() {
  const { userId } = useAuth();
  const [username,setUsename] = useState("")
  // const socketRef = useRef<Socket | null>(null);

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
    
    //  // Setup socket connection
    //  const socket = io("http://localhost:4000", {
    //   query: { userId }, // optional if you need to send userId
    // });
    // socketRef.current = socket;

    // socket.on("connect", () => {
    //   console.log("Connected with socket ID:", socket.id);
    // });

    // socket.on("disconnect", () => {
    //   console.log("Socket disconnected");
    // });

    // // Cleanup
    // return () => {
    //   socket.disconnect();
    // };

  },[])




  return (
    <div className='relative '>      
      <StreamsView streamerName={username as string} playVideo={true} />
    </div>
  );
}
