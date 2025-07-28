"use client"
import { SignedIn, SignedOut, useClerk, UserButton } from '@clerk/clerk-react'
import { LogOut } from 'lucide-react'
import React from 'react'
import GetStarted from './GetStarted'
import Link from 'next/link'


export default function Appbar() {
    const {signOut, isSignedIn} = useClerk()
    
    
  return (
    <div className='flex w-full justify-between p-4 px-4 md:px-20 text-white font-semibold items-center sticky top-0 right-0 left-0 z-50'>
        <Link href="/" className='font-extrabold tracking-widest text-xl cursor-pointer'>
            NAACHOGAAO
        </Link>
        {/* {
            isSignedIn &&
            <Link href={"/dashboard"} className='text-zinc-500 hover:text-[orangered] transition-all duration-75'>
                Dashboard
            </Link>
        } */}
        <div className='flex gap-5' >
                <SignedIn>                        
                    <UserButton/>
                    <LogOut onClick={()=>signOut()}/>
                </SignedIn>                    
                <SignedOut>
                    <GetStarted classes="text-[0.8rem] bg-purple-900 hover:bg-purple-800 cursor-pointer px-8 py-3 flex items-center gap-4 rounded-md shadow-sm active:shadow-md active:shadow-purple-500/50 hover:shadow-purple-500/10  transition-all duration-150"/>
                </SignedOut>
        </div>
    </div>
  )
}
