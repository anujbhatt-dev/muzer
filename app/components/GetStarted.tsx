"use client"
import { SignInButton } from '@clerk/nextjs'
import { LogIn } from 'lucide-react'
import React from 'react'

export default function GetStarted({classes}:{classes:string}) {
  return (
        <SignInButton forceRedirectUrl="/dashboard" mode="modal">
          <div className={classes}>
                  Get Started
              <LogIn />
          </div>
        </SignInButton>
  )
}
