"use client"
import React, { ReactNode } from 'react'
import { FloatingDock } from './ui/floating-dock'
import { IconDashboard, IconHomeFilled } from '@tabler/icons-react'
import { useAuth } from '@clerk/nextjs'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ConvexReactClient } from 'convex/react'

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null

export default function Provider({children}:{children:ReactNode}) {
  const {isSignedIn} = useAuth()
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

  if (!convexClient) {
    console.error("NEXT_PUBLIC_CONVEX_URL is not set; Convex hooks will not work.")
    return <>{children}</>
  }

  return (
    <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
      {isSignedIn &&
        <div className='flex  mx-auto fixed right-0 left-0 bottom-4' style={{zIndex:1000}}>
          <FloatingDock items={items}/>    
        </div>        
      }
      {children}
    </ConvexProviderWithClerk>
  )
}
