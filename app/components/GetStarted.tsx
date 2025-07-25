"use client"
import { SignInButton } from '@clerk/nextjs'
import { Play } from 'lucide-react'
import React from 'react'

export default function GetStarted() {
  return (
    <div className="text-lg bg-purple-900 hover:bg-purple-800 cursor-pointer px-10 py-4 flex items-center gap-4 rounded-2xl shadow-xl active:shadow-md active:shadow-purple-500/50 hover:shadow-purple-500/10  transition-all duration-150">
        <Play className="w-5 h-5" />
        <SignInButton mode="modal">
            Get Started
        </SignInButton>
    </div>
  )
}
