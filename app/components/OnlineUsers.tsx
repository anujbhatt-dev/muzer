import { useAuth, useUser } from '@clerk/nextjs'
import React from 'react'

export default function OnlineUsers() {
  const useriD = useAuth();
  const {user} = useUser()
  return (
    <div>

    </div>
  )
}
