"use client";
import Image from "next/image";
import { SignIn } from "@/components/signIn";
import CustomLink from "@/components/custom-link";
import { useSession } from "next-auth/react";
import { auth } from "@/auth";
import { ModeToggle } from "@/components/themeSwitcher";

export default function Home() {
    const { data: session } = useSession();
    console.log("user session client", session);
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="flex flex-col gap-6">
                <h1 className="text-3xl font-bold">Auth Roles Test</h1>
                <ModeToggle />
                <SignIn />
                {session?.roles?.includes("Managers") && (
                    <div>is in managers group</div>
                )}
                {session?.roles?.includes("Human Resources") && (
                    <div>is in HR group</div>
                )}
                <div className="flex flex-col bg-gray-100 rounded-md">
                    <div className="p-4 font-bold bg-gray-200 rounded-t-md dark:text-black">
                        Current Session
                    </div>
                    <pre className="py-6 px-4 whitespace-pre-wrap break-all dark:text-black">
                        {JSON.stringify(session?.user, null, 2)}
                        <br />
                        <span className="text-pink-700 font-bold text-lg">
                            Roles:
                        </span>
                        {session?.roles?.map((role: string) => (
                            <div key={role}>{role}</div>
                        ))}
                    </pre>
                </div>
            </div>
        </main>
    );
}
