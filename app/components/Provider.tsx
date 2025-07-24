"use client"
import React, { ReactNode, useState } from 'react'
import Squares from './ui/Squares/Squares'
import SplashCursor from './ui/SplashCursor/SplashCursor'
import GlareHover from './ui/GlareHover/GlareHover'

export default function Provider({children}:{children:ReactNode}) {
  
  const [splashCursor,setSplashCursor] = useState<boolean>(false)
  return (
    <>
        <div onClick={()=>setSplashCursor(!splashCursor)} className='fixed bottom-5 left-5 hover:-translate-y-2 active:-translate-y-0 transition-all duration-150'>
          <GlareHover
            glareColor="#ffffff"
            glareOpacity={0.3}
            glareAngle={-30}
            glareSize={300}
            transitionDuration={800}
            playOnce={false}
            >
            <h2 className='text-zinc-400 hover:text-zinc-100 text-sm font-semibold h-full w-full flex justify-center items-center'>
              {splashCursor?"Normal Cursor":"Splash Cursor"}
            </h2>
          </GlareHover>
        </div>
        {splashCursor && <SplashCursor/>}
        <Squares 
        speed={0.5} 
        squareSize={20}
        direction='diagonal' // up, down, left, right, diagonal
        borderColor='black'
        hoverFillColor='#222'        
        />
       {children}
    </>
  )
}
