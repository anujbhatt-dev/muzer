"use client"
import { SignInButton } from '@clerk/nextjs'
import { LogIn } from 'lucide-react'
import React from 'react'

export default function GetStarted({classes}:{classes:string}) {
  return (
        <SignInButton forceRedirectUrl="/dashboard" mode="modal">
          <div className={classes}>
                  Get Started
              <LogIn  className='bg-white rounded-full w-10 h-10 p-2 text-zinc-800 shadow-[5px_5px_rgba(0,_98,_90,_0.4),_10px_10px_rgba(0,_98,_90,_0.3)] '/>
          </div>
        </SignInButton>
  )
}
