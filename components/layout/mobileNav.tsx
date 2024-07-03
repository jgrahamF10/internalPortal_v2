import { Drawer, DrawerTrigger, DrawerContent } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import type { SVGProps } from "react";


export default function NavMenu() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon">
          <MenuIcon className="h-6 w-6" />
          <span className="sr-only">Toggle navigation</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-full max-w-xs bg-background p-4 lg:hidden">
        <nav className="grid gap-4">
          <Link
            href="#"
            className="flex items-center justify-between rounded-md px-3 py-2 text-md font-medium transition-colors hover:bg-muted hover:text-muted-foreground"
            prefetch={false}
          >
            Home
            <ChevronRightIcon className="h-5 w-5 transition-transform group-[.open]:rotate-90" />
          </Link>
          <Collapsible className="grid gap-2">
            <CollapsibleTrigger className="flex items-center justify-between rounded-md px-3 py-2 text-lg font-medium transition-colors hover:bg-muted hover:text-muted-foreground [&[data-state=open]>svg]:rotate-90">
              Features
              <ChevronRightIcon className="h-5 w-5 transition-transform" />
            </CollapsibleTrigger>
            <CollapsibleContent className="grid gap-2 pl-6">
              <Link
                href="#"
                className="flex items-center rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-muted hover:text-muted-foreground"
                prefetch={false}
              >
                Analytics
              </Link>
              <Link
                href="#"
                className="flex items-center rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-muted hover:text-muted-foreground"
                prefetch={false}
              >
                Developer Tools
              </Link>
              <Link
                href="#"
                className="flex items-center rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-muted hover:text-muted-foreground"
                prefetch={false}
              >
                Security &amp; Compliance
              </Link>
              <Link
                href="#"
                className="flex items-center rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-muted hover:text-muted-foreground"
                prefetch={false}
              >
                Scalability
              </Link>
            </CollapsibleContent>
          </Collapsible>
          <Link
            href="#"
            className="flex items-center justify-between rounded-md px-3 py-2 text-lg font-medium transition-colors hover:bg-muted hover:text-muted-foreground"
            prefetch={false}
          >
            Pricing
            <ChevronRightIcon className="h-5 w-5 transition-transform group-[.open]:rotate-90" />
          </Link>
          <Collapsible className="grid gap-2">
            <CollapsibleTrigger className="flex items-center justify-between rounded-md px-3 py-2 text-lg font-medium transition-colors hover:bg-muted hover:text-muted-foreground [&[data-state=open]>svg]:rotate-90">
              Resources
              <ChevronRightIcon className="h-5 w-5 transition-transform" />
            </CollapsibleTrigger>
            <CollapsibleContent className="grid gap-2 pl-6">
              <Link
                href="#"
                className="flex items-center rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-muted hover:text-muted-foreground"
                prefetch={false}
              >
                Blog Posts
              </Link>
              <Link
                href="#"
                className="flex items-center rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-muted hover:text-muted-foreground"
                prefetch={false}
              >
                Case Studies
              </Link>
              <Link
                href="#"
                className="flex items-center rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-muted hover:text-muted-foreground"
                prefetch={false}
              >
                Documentation
              </Link>
              <Link
                href="#"
                className="flex items-center rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-muted hover:text-muted-foreground"
                prefetch={false}
              >
                Help Center
              </Link>
            </CollapsibleContent>
          </Collapsible>
          <Link
            href="#"
            className="flex items-center justify-between rounded-md px-3 py-2 text-lg font-medium transition-colors hover:bg-muted hover:text-muted-foreground"
            prefetch={false}
          >
            Contact
            <ChevronRightIcon className="h-5 w-5 transition-transform group-[.open]:rotate-90" />
          </Link>
        </nav>
      </DrawerContent>
    </Drawer>
  )
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
  )
}


function MenuIcon(props: SVGProps<SVGSVGElement>) {
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
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}