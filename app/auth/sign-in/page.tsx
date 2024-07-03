
import { redirect } from "next/navigation";
import { signIn, auth, providerMap } from "@/auth";
import { AuthError } from "next-auth";
import { JSX, SVGProps, useState } from "react";
import { Toggle } from "@/components/ui/toggle";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/themeSwitcher";

const SIGNIN_ERROR_URL = "/auth/error";

export default function SignInPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background transition-colors">
            <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg dark:border-muted">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Login</h1>
                    <ModeToggle />
                </div>
                <div className="mt-6 space-y-4">
                <form
      action={async () => {
        "use server"
        await signIn("microsoft-entra-id", { redirectTo: "/" })
      }}
    >
      <button type="submit">Sign in</button>
    </form>
                
                </div>
            </div>
        </div>
    );
}

function SunIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
        </svg>
    );
}

function SunMoonIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 8a2.83 2.83 0 0 0 4 4 4 4 0 1 1-4-4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.9 4.9 1.4 1.4" />
            <path d="m17.7 17.7 1.4 1.4" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.3 17.7-1.4 1.4" />
            <path d="m19.1 4.9-1.4 1.4" />
        </svg>
    );
}
//  return (
//    <div className="flex flex-col gap-2">
//      {Object.values(providerMap).map((provider) => (
//        <form
//          key={provider.id}
//          action={async () => {
//            "use server"
//            try {
//                await signIn(provider.id)
//            } catch (error) {
//              // Signin can fail for a number of reasons, such as the user
//              // not existing, or the user not having the correct role.
//              // In some cases, you may want to redirect to a custom error
//              if (error instanceof AuthError) {
//                return redirect(`${SIGNIN_ERROR_URL}?error=${error.type}`)
//              }
//
//              // Otherwise if a redirects happens NextJS can handle it
//              // so you can just re-thrown the error and let NextJS handle it.
//              // Docs:
//              // https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
//              throw error
//            }
//          }}
//        >
//          <button type="submit">
//            <span>Sign in with {provider.name} {provider.id}</span>
//          </button>
//        </form>
//      ))}
//    </div>
//  )
//}
