"use client"
import React, { ReactNode } from 'react'
import { FloatingDock } from './ui/floating-dock'
import { IconDashboard, IconHomeFilled, IconShare, IconUserFilled } from '@tabler/icons-react'
import DarkVeil from './ui/DarkVeil/DarkVeil'

export default function Provider({children}:{children:ReactNode}) {
  const items = [
    
    {
      title:"Home",
      href:"/",
      icon:<IconHomeFilled/>
    },
    {
      title:"Dashboard",
      href:"/dashboard",
      icon:<IconDashboard/>
    },    
  ]
    
  return (
    <>
        <div style={{ width: '100%', height: '100vh', position: 'fixed' }}>
          <DarkVeil />
        </div>
        <div className='flex  mx-auto fixed right-0 left-0 bottom-4' style={{zIndex:1000}}>
          <FloatingDock items={items}/>    
        </div>
       {children}
       
  
    </>
  )
}
