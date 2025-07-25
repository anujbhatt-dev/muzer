"use client"
import { useAuth } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'


export default function Redirect() {
    
    const {isSignedIn} = useAuth()
    const router = useRouter();
    useEffect(()=>{
        if(isSignedIn){
            router.push("/dashboard");
        }
    },[])
    return null
}
