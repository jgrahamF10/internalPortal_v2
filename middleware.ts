import { auth } from "@/auth";

export { auth as middleware };

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};