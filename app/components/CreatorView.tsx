"use client"
import React from 'react'
import SplitText from './ui/SplitText/SplitText'
import StreamsView from './StreamsView'

export default function CreatorView({creatorName}:{creatorName:string}) {
  console.log("CreatorView ", creatorName);
  
  return (
    <div>
    <div className='text-xl text-right px-20 py-10 font-bold'> 
               
       <span className='text-[orangered]'>
            @{creatorName}
       </span>
    </div>
    <StreamsView streamerName={creatorName} playVideo={false}/>
</div>
  )
}
