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
          <Button onClick={() => signIn("microsoft-entra-id")}>Sign in</Button>
        </>
      )
    }