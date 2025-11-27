// import { Button } from "@/components/ui/button"
// import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
// import { auth } from "@clerk/nextjs/server"
// import { redirect } from "next/navigation"

// export default function HomePage() {
//   const { userId } = auth()
//   if (userId != null) redirect("/events")

//   return (
//     <div className="text-center container my-4 mx-auto">
//       <h1 className="text-3xl mb-4">Fancy Home Page</h1>
//       <div className="flex gap-2 justify-center">
//         <Button asChild>
//           <SignInButton />
//         </Button>
//         <Button asChild>
//           <SignUpButton />
//         </Button>
//         <UserButton />
//       </div>
//     </div>
//   )
// }





import { Button } from "@/components/ui/button"
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default function HomePage() {
  const { userId } = auth()
  if (userId) redirect("/events")

  return (
    <main className="min-h-screen">
      {/* <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full text-center animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Join the Queue!</h1>
        <p className="text-gray-600 mb-6">
          Plan, organize, and schedule your events effortlessly.
        </p>
        
        <div className="flex flex-col gap-4">
          <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl">
            <SignInButton>Sign In</SignInButton>
          </Button>
          <Button asChild className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-6 rounded-xl">
            <SignUpButton>Create an Account</SignUpButton>
          </Button>
        </div>

        <div className="mt-6">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div> */}
    </main>
  )
}