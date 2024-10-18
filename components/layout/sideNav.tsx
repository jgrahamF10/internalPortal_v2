"use client";
import React from "react";
import type { SVGProps } from "react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import f10Logo from "@/public/f10_logo.png";
import {
    Collapsible,
    CollapsibleTrigger,
    CollapsibleContent,
} from "@/components/ui/collapsible";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useSession, signOut } from "next-auth/react";
import { ModeToggle } from "@/components/themeSwitcher";

export default function SideNav() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { data: session } = useSession();

    const toggleMobileMenu = (): void => {
        setIsMobileMenuOpen((prevState) => !prevState);
    };

    return (
        <div className="flex h-screen w-full">
            <button
                onClick={toggleMobileMenu}
                className="text-black mt-14 md:hidden"
            >
                {/* only shows on mobile */}
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                ></svg>
            </button>
            <div
                className={`w-[286px] h-screen bg-gray-800 text-white  fixed transform ${
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                } transition-transform duration-300 ease-in-out md:translate-x-0`}
            >
                <nav className="flex flex-col bg-gray-800 text-white w-[286px]">
                    <div className="flex h-32 items-center justify-center ">
                        <Link href="/">
                            <Image
                                src={f10Logo}
                                className="h-22 w-26 "
                                alt="Form 10 Group"
                                priority={true}
                            />
                        </Link>
                    </div>
                    <div className="flex flex-1 flex-col overflow-y-auto">
                        {session && session?.user && (
                            <Link
                                href="/dashboard"
                                className="flex h-12 items-center pl-4 border-b px-4 text-sm font-medium transition-colors hover:bg-gray-700"
                            >
                                <DashboardIcon />
                                <span className="text-center pl-20">
                                    {" "}
                                    Dashboard
                                </span>
                            </Link>
                        )}
                        {session?.roles?.some((role) =>
                            ["Managers", "Human Resources"].includes(role)
                        ) && (
                            <div>
                                <Link
                                    href="/hr/projects"
                                    className="flex h-12 items-center pl-4  border-b px-4 text-sm font-medium transition-colors hover:bg-gray-700"
                                >
                                    <CodiconProject />
                                    <span className="text-center pl-20">
                                        {" "}
                                        Project Management
                                    </span>
                                </Link>
                                <Link
                                    href="/hr/roster"
                                    className="flex h-12 items-center pl-4  border-b px-4 text-sm font-medium transition-colors hover:bg-gray-700"
                                >
                                    <RiTeamFill />
                                    <span className="text-center pl-20">
                                        {" "}
                                        Tech Management
                                    </span>
                                </Link>
                            </div>
                        )}
                        <Accordion type="single" collapsible>
                            {/* <--------- Trackers --------- */}
                            {session?.roles?.some((role) =>
                                ["Managers", "Human Resources"].includes(role)
                            ) && (
                                <AccordionItem value="item-2">
                                    <AccordionTrigger className="h-12 px-4 text-sm font-medium transition-colors hover:bg-gray-700">
                                        <AppReporting /> Trackers
                                    </AccordionTrigger>
                                    <AccordionContent className="flex h-9 items-center px-8 py-2 text-sm transition-colors hover:bg-gray-700">
                                        <Link href="/hotels">
                                            Hotel Tracker
                                        </Link>
                                    </AccordionContent>
                                    <AccordionContent className="flex h-9 items-center px-8 py-2 text-sm transition-colors hover:bg-gray-700">
                                        <Link href="/flights">
                                            Flight Tracker
                                        </Link>
                                    </AccordionContent>
                                    <AccordionContent className="flex h-9 items-center px-8 py-2 text-sm transition-colors hover:bg-gray-700">
                                        <Link href="/rentals">
                                            Rental Car Tracker
                                        </Link>
                                    </AccordionContent>
                                </AccordionItem>
                            )}
                            {/* <--------- Tech Resources --------- */}
                            {session?.roles?.includes("Managers") && (
                                <AccordionItem value="item-3">
                                    <AccordionTrigger  className="h-12 px-4 text-sm font-medium transition-colors hover:bg-gray-700">
                                        <GraphIcon /> Manager Tools
                                    </AccordionTrigger>
                                    <AccordionContent className="flex h-9 items-center px-8 py-2 text-sm transition-colors hover:bg-gray-700">
                                        <Link href="/">TBD</Link>
                                    </AccordionContent>
                                </AccordionItem>
                            )}
                        </Accordion>
                        {session && session?.user && (
                            <button
                                onClick={() => signOut()}
                                className="flex h-32 items-center justify-center"
                            >
                                Sign Out
                            </button>
                        )}
                    </div>
                </nav>
            </div>
            <ModeToggle />
        </div>
    );
}

function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
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
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}

export function RiTeamFill(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            viewBox="0 0 24 24"
            {...props}
        >
            <path
                fill="currentColor"
                d="M12 10a4 4 0 1 0 0-8a4 4 0 0 0 0 8m-6.5 3a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5M21 10.5a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0m-9 .5a5 5 0 0 1 5 5v6H7v-6a5 5 0 0 1 5-5m-7 5c0-.693.1-1.362.288-1.994l-.17.014A3.5 3.5 0 0 0 2 17.5V22h3zm17 6v-4.5a3.5 3.5 0 0 0-3.288-3.494c.187.632.288 1.301.288 1.994v6z"
            ></path>
        </svg>
    );
}

export function AppReporting(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            viewBox="0 0 32 32"
            {...props}
        >
            <g fill="currentColor">
                <path d="M25 5h-.17v2H25a1 1 0 0 1 1 1v20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h.17V5H7a3 3 0 0 0-3 3v20a3 3 0 0 0 3 3h18a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3"></path>
                <path d="M23 3h-3V0h-8v3H9v6h14zm-2 4H11V5h3V2h4v3h3z"></path>
                <path
                    d="M10 13h12v2H10zm0 5h12v2H10zm0 5h12v2H10z"
                    className="ouiIcon__fillSecondary"
                ></path>
            </g>
        </svg>
    );
}

export function GraphIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            viewBox="0 0 16 16"
            {...props}
        >
            <path
                fill="currentColor"
                fillRule="evenodd"
                d="M1.5 14H15v-1H2V0H1v13.5zM3 11.5v-8l.5-.5h2l.5.5v8l-.5.5h-2zm2-.5V4H4v7zm6-9.5v10l.5.5h2l.5-.5v-10l-.5-.5h-2zm2 .5v9h-1V2zm-6 9.5v-6l.5-.5h2l.5.5v6l-.5.5h-2zm2-.5V6H8v5z"
                clipRule="evenodd"
            ></path>
        </svg>
    );
}

export function HotelIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            viewBox="0 0 32 32"
            {...props}
        >
            <path
                fill="currentColor"
                d="M9.5 15A1.5 1.5 0 1 1 8 16.5A1.5 1.5 0 0 1 9.5 15m0-2a3.5 3.5 0 1 0 3.5 3.5A3.5 3.5 0 0 0 9.5 13"
            ></path>
            <path
                fill="currentColor"
                d="M25 14h-8a2 2 0 0 0-2 2v6H4V10.6l12-6.46l12.53 6.74l.94-1.76l-13-7a1 1 0 0 0-.94 0l-13 7A1 1 0 0 0 2 10v20h2v-6h24v6h2V19a5 5 0 0 0-5-5m-8 8v-6h8a3 3 0 0 1 3 3v3Z"
            ></path>
        </svg>
    );
}

export function CarIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            viewBox="0 0 24 24"
            {...props}
        >
            <path
                fill="currentColor"
                d="m20.772 10.156l-1.368-4.105A2.995 2.995 0 0 0 16.559 4H7.441a2.995 2.995 0 0 0-2.845 2.051l-1.368 4.105A2.003 2.003 0 0 0 2 12v5c0 .753.423 1.402 1.039 1.743c-.013.066-.039.126-.039.195V21a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2h12v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2.062c0-.069-.026-.13-.039-.195A1.993 1.993 0 0 0 22 17v-5c0-.829-.508-1.541-1.228-1.844M4 17v-5h16l.002 5zM7.441 6h9.117c.431 0 .813.274.949.684L18.613 10H5.387l1.105-3.316A1 1 0 0 1 7.441 6"
            ></path>
            <circle cx={6.5} cy={14.5} r={1.5} fill="currentColor"></circle>
            <circle cx={17.5} cy={14.5} r={1.5} fill="currentColor"></circle>
        </svg>
    );
}

export function PlaneIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            viewBox="0 0 36 36"
        >
            <path
                fill="currentColor"
                d="M35.77 8.16a2.43 2.43 0 0 0-1.9-2L28 4.87a4.5 4.5 0 0 0-3.65.79L7 18.3l-4.86-.2a1.86 1.86 0 0 0-1.23 3.31l5 3.93c.6.73 1 .59 10.93-4.82l.93 9.42a1.36 1.36 0 0 0 .85 1.18a1.4 1.4 0 0 0 .54.1a1.54 1.54 0 0 0 1-.41l2.39-2.18a1.52 1.52 0 0 0 .46-.83l2.19-11.9c3.57-2 6.95-3.88 9.36-5.25a2.43 2.43 0 0 0 1.21-2.49m-2.2.75c-2.5 1.42-6 3.41-9.76 5.47l-.41.23l-2.33 12.67l-1.47 1.34l-1.1-11.3l-1.33.68C10 22 7.61 23.16 6.79 23.52l-4.3-3.41l5.08.22l18-13.06a2.5 2.5 0 0 1 2-.45l5.85 1.26a.43.43 0 0 1 .35.37a.42.42 0 0 1-.2.46"
                className="clr-i-outline clr-i-outline-path-1"
            ></path>
            <path
                fill="currentColor"
                d="m7 12.54l3.56 1l1.64-1.19l-4-1.16l1.8-1.1l5.47-.16l2.3-1.67L10 8.5a1.25 1.25 0 0 0-.7.17L6.67 10.2A1.28 1.28 0 0 0 7 12.54"
                className="clr-i-outline clr-i-outline-path-2"
            ></path>
            <path fill="none" d="M0 0h36v36H0z"></path>
        </svg>
    );
}

export function DashboardIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            viewBox="0 0 36 36"
            {...props}
        >
            <path
                fill="currentColor"
                d="m25.18 12.32l-5.91 5.81a3 3 0 1 0 1.41 1.42l5.92-5.81Z"
                className="clr-i-outline clr-i-outline-path-1"
            ></path>
            <path
                fill="currentColor"
                d="M18 4.25A16.49 16.49 0 0 0 5.4 31.4l.3.35h24.6l.3-.35A16.49 16.49 0 0 0 18 4.25m11.34 25.5H6.66a14.43 14.43 0 0 1-3.11-7.84H7v-2H3.55A14.4 14.4 0 0 1 7 11.29l2.45 2.45l1.41-1.41l-2.43-2.46A14.4 14.4 0 0 1 17 6.29v3.5h2V6.3a14.47 14.47 0 0 1 13.4 13.61h-3.48v2h3.53a14.43 14.43 0 0 1-3.11 7.84"
                className="clr-i-outline clr-i-outline-path-2"
            ></path>
            <path fill="none" d="M0 0h36v36H0z"></path>
        </svg>
    );
}

export function CodiconProject(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            viewBox="0 0 16 16"
            {...props}
        >
            <path
                fill="currentColor"
                fillRule="evenodd"
                d="M1.5 1h13l.5.5v13l-.5.5h-13l-.5-.5v-13zM2 14h12V2H2zM3 3h2v10H3zm6 0H7v6h2zm2 0h2v8h-2z"
                clipRule="evenodd"
            ></path>
        </svg>
    );
}
