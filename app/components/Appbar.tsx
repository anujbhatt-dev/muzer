"use client"
import { SignedIn, SignedOut, SignOutButton, useClerk, UserButton, UserProfile, useUser } from '@clerk/clerk-react'
import { SignInButton } from '@clerk/nextjs'
import { LogOut } from 'lucide-react'
import React from 'react'
import GetStarted from './GetStarted'


export default function Appbar() {
    const {signOut} = useClerk()
    
    
  return (
    <div className='flex w-full justify-between p-4 px-20 bg-black text-white font-semibold border-b border-black/40 shadow-md items-center sticky top-0 right-0 left-0'>
        <div className='font-extrabold tracking-widest text-xl'>
            MUZER
        </div>
        <div>
            <div className='flex gap-5' >
                    <SignedIn>                        
                        <UserButton/>
                        <LogOut onClick={()=>signOut()}/>
                    </SignedIn>
                    <SignedOut>
                        <GetStarted/>
                    </SignedOut>
            </div>
        </div>
    </div>
  )
}
