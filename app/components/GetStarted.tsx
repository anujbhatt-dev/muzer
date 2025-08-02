"use client"
import { SignInButton } from '@clerk/nextjs'
import { LogIn } from 'lucide-react'
import React from 'react'

export default function GetStarted({classes}:{classes:string}) {
  return (
    <div className={classes}>
        <SignInButton forceRedirectUrl="/dashboard" mode="modal">
            Get Started
        </SignInButton>
        <LogIn />
    </div>
  )
}
