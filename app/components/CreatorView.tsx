"use client"
import React from 'react'
import SplitText from './ui/SplitText/SplitText'
import StreamsView from './StreamsView'

export default function CreatorView({creatorId}:{creatorId:string}) {
  return (
    <div>
    <div className='text-3xl uppercase text-center py-10 font-bold'>         
    <SplitText text='your fav creator' />
  </div>
    <StreamsView streamerId={creatorId}/>
</div>
  )
}
