import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "./ui/button";

export function SignIn() {
    const { data: session } = useSession();
    if (session && session.user) {
        return (
          <>
            Signed in as {session.user.email} <br />
            <Button onClick={() => signOut()}>Sign out</Button>
          </>
        )
      }
      return (
        <>
          Not signed in <br />
          <Button onClick={() => signIn()}>Sign in</Button>
        </>
      )
    }