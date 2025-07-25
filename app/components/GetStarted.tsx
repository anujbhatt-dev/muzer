"use client"
import { SignInButton } from '@clerk/nextjs'
import { Play } from 'lucide-react'
import React from 'react'

export default function GetStarted({classes}:{classes:string}) {
  return (
    <div className={classes}>
        <Play className="w-4 h-4" />
        <SignInButton mode="modal">
            Get Started
        </SignInButton>
    </div>
  )
}
