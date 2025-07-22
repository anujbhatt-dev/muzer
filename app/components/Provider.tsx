"use client"
import React, { ReactNode } from 'react'
import Squares from './ui/Squares/Squares'
import SplashCursor from './ui/SplashCursor/SplashCursor'

export default function Provider({children}:{children:ReactNode}) {
  return (
    <>
        <SplashCursor/>
        <Squares 
        speed={0.5} 
        squareSize={20}
        direction='diagonal' // up, down, left, right, diagonal
        borderColor='black'
        hoverFillColor='#222'
        
        />
       {children}
    </>
  )
}
