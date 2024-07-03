import { auth } from "@/auth"
import { useSession } from "next-auth/react"
import { Session } from "next-auth";
import NotAuth from "@/components/auth/notAuth";

 
export default async function Page() {
  const session: Session | null = await auth();
 
  if (!session) {
    return <NotAuth />
    
  }
 
  return (
    <div className="container">
      {session?.roles?.includes("Human Resources") && (
                    <div>is in HR group</div>
                )}
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  )
}