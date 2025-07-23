"use client"
import SplitText from "@/app/components/ui/SplitText/SplitText";
import StreamsView from '../components/StreamsView';
import { useAuth } from "@clerk/nextjs";

export default function Dashboard() {  
  const {userId} = useAuth();
  

  return (
    <div className='relative'>
      <div className='text-3xl uppercase text-center py-10 font-bold'>         
        <SplitText text='Dashboard' />
      </div>      
      <StreamsView streamerId={userId as string}/>              
    </div>
  )
}
