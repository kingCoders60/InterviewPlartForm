import React from 'react'
import { Button } from '@/components/ui/button'
import { SignedIn,SignedOut,SignInButton,SignOutButton,UserButton } from '@clerk/nextjs'
import image from "next/image"
const Home = () => {
  return (
    <div className="m-10">
      <SignInButton>
        <Button>
          Sign In
        </Button>
      </SignInButton>
      <SignOutButton>
        <Button>
          SignOut
        </Button>
      </SignOutButton>
    </div>
  )
}
export default Home
