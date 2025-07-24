"use client"
import SplitText from "@/app/components/ui/SplitText/SplitText";
import StreamsView from '../components/StreamsView';
import { useAuth } from "@clerk/nextjs";

export default function Dashboard() {  
  const {userId} = useAuth();
  

  return (
    <div className='relative min-h-[200vh]'>
      <div className='text-3xl uppercase py-10 font-bold text-center md:text-left md:ml-20'>         
        <SplitText text='Dashboard' />
      </div>      
      <StreamsView streamerId={userId as string} playVideo={true}/>              
    </div>
  )
}
