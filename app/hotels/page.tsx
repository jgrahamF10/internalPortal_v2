import Image from "next/image";
import myImage from "@/public/images/bg.jpg";
import { ModeToggle } from "@/components/themeSwitcher";
import { JSX, SVGProps, useState } from "react";
import { signIn, auth } from "@/auth";

export default function Page() {
    return (
        <div className="relative flex min-h-screen w-full items-center justify-center bg-background transition-colors">
            <div className="absolute inset-0 z-0">
                <Image
                    src={myImage}
                    alt="Background Image"
                    fill={true}
                    style={{ objectFit: "cover" }}
                    
                />
                
            </div>
            <div className="relative z-10 w-full max-w-md rounded-lg border bg-card p-4 shadow-lg dark:border-muted">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Login</h1>
                    <ModeToggle />
                </div>
                <div className="mt-6 space-y-4">
                    <form
                        action={async () => {
                            "use server";
                            await signIn("microsoft-entra-id", {
                                redirectTo: "/dashboard",
                            });
                        }}
                    >
                        <button
                            type="submit"
                            className="bg-blue-700 rounded-lg px-2 py-2 text-white hover:text-white hover:bg-green-800"
                        >
                            Click to sign in
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
