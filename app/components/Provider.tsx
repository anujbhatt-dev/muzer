"use client"
import React, { ReactNode, useState } from 'react'
import Squares from './ui/Squares/Squares'
import SplashCursor from './ui/SplashCursor/SplashCursor'
import GlareHover from './ui/GlareHover/GlareHover'
import { FloatingDock } from './ui/floating-dock'
import { IconDashboard, IconHomeFilled, IconShare, IconUserFilled } from '@tabler/icons-react'
import LightRays from './ui/LightRays/LightRays'

export default function Provider({children}:{children:ReactNode}) {
  const items = [
    {
      title:"Share",
      href:"/",
      icon:<IconShare/>
    },
    {
      title:"Dashboard",
      href:"/dashboard",
      icon:<IconDashboard/>
    },
    {
      title:"Home",
      href:"/",
      icon:<IconHomeFilled/>
    },
    {
      title:"Profile",
      href:"/",
      icon:<IconUserFilled/>
    },
    
  ]
  
  const [splashCursor,setSplashCursor] = useState<boolean>(false)
  return (
    <>
        <div onClick={()=>setSplashCursor(!splashCursor)} className='fixed bottom-5 left-5 hover:-translate-y-2 active:-translate-y-0 transition-all duration-150 hidden lg:flex '>

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
        {/* <Squares 
        speed={0.5} 
        squareSize={20}
        direction='diagonal' // up, down, left, right, diagonal
        borderColor='#004030'
        hoverFillColor='#222'        
        /> */}
        <div className='fixed h-screen'>
          <LightRays
            raysOrigin="top-center"
            raysColor="#00ffff"
            raysSpeed={1.5}
            lightSpread={0.8}
            rayLength={1.2}
            followMouse={true}
            mouseInfluence={0.1}
            noiseAmount={0.1}
            distortion={0.05}
            className="custom-rays"
          />
        </div>
        <div className='flex  mx-auto fixed right-0 left-0 bottom-4' style={{zIndex:1000}}>
          <FloatingDock items={items}/>    

        </div>
       {children}
       
  
    </>
  )
}
