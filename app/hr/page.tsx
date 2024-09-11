'use client';
import { auth } from "@/auth"
import { Session } from "next-auth";
import NotAuth from "@/components/auth/notAuth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Modal from "@/components/test";
import { Button } from "@/components/ui/button";

type SearchParamProps = {
  searchParams: Record<string, string> | null | undefined;
};
 
export default function Page({ searchParams }: SearchParamProps) {
  const { data: session } = useSession();
  const show = searchParams?.show;
 
  if (!session?.roles?.some(role => ["Managers", "Human Resources"].includes(role))) {
    return <NotAuth />
    
  }
 
  return (
    <div className="container">
      {session?.roles?.includes("Human Resources") && (
                    <div>is in HR group</div>
                )}
      <pre>{JSON.stringify(session, null, 2)}</pre>

      <Link href="/hr?show=true">
        <Button>SUMMON THE MODAL</Button>
      </Link>


    </div>
  )
}