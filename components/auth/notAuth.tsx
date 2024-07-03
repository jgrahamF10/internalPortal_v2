'use client';
import { SignIn } from '../signIn'
import { signIn } from "next-auth/react";
import { Button } from "../ui/button";

export default function NotAuth() {
    return (
        <div className="text-center p-10">
            <p className="text-lg text-red-800">
                Not authenticated, use the link below to sign in.
            </p>
            <Button className='mt-4 text-xl bg-green-700 hover:text-white hover:bg-green-800' onClick={() => signIn("microsoft-entra-id")}>Sign in</Button>
        </div>
    )
}