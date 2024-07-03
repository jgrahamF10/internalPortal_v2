import { auth } from "@/auth";
import Image from "next/image";
import { Session } from "next-auth";
import type { SVGProps } from "react";
import NavMenu from "@/components/layout/mobileNav";

export default async function SearchBar() {
    const session: Session | null = await auth();
    return (
      <div className="fixed top-0 left-0 right-0 pr-2 z-10 flex items-center justify-between h-14 
        bg-white shadow-slate-300 shadow-md md:ml-72 dark:bg-background dark:shadow-slate-800 ">
            {/* Adjust margin-left for medium screens and up */}
            <div className="ml-4 pl-4 font-bold">
                Form 10 Group Internal Portal
            </div>
            <div className="mr-4 pr-4 flex items-center space-x-4">
                <div className="lg:hidden">
                    <NavMenu/>
                </div>
                {session?.user?.image && (
                    <Image
                        src={session.user.image}
                        width={44}
                        height={44}
                        alt="User Avatar"
                        className="hidden lg:block rounded-full"
                    />
                )}
            </div>
        </div>
    );
}


function MobileMenu() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24"><g fill="currentColor"><path d="M8 6.983a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2zM7 12a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1m1 3.017a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2z"></path><path fillRule="evenodd" d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10m-2 0a8 8 0 1 1-16 0a8 8 0 0 1 16 0" clipRule="evenodd"></path></g></svg>);
}