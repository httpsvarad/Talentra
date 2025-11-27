import { SignUp } from "@clerk/nextjs"
import { ClerkLoaded, ClerkLoading } from '@clerk/nextjs'
import { Loader } from "lucide-react"

export default function Page() {
  return (
    <>
      <ClerkLoading>
        <Loader className="animate-spin mb-1" size={24}/>
        <p>Just a moment...</p>
      </ClerkLoading>
      <ClerkLoaded>
        <SignUp />
      </ClerkLoaded>
    </>
  )
}
