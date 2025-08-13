import React from 'react'
import { Button } from '@/components/ui/button'
import { SignedIn,SignedOut,SignInButton,SignOutButton,UserButton } from '@clerk/nextjs'
import image from "next/image"
const page = () => {
  return (
    <div className="m-10">
      <SignedOut>
        <SignInButton/>
      </SignedOut>
      <SignedIn>
        <SignOutButton/>
      </SignedIn>
    </div>
  )
}
export default page
