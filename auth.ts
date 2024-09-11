import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import "next-auth/jwt";
import { Client } from "@microsoft/microsoft-graph-client";
import type { Provider } from "next-auth/providers"
import authConfig from "./auth.config"
import { db } from "@/db/index"; 
import { users, accounts, sessions, } from "@/db/schema/auth_db";
import { eq, ne, and } from "drizzle-orm";
import { DrizzleAdapter } from "@auth/drizzle-adapter";

async function getUserRoles(accessToken: string) {
    const client = Client.init({
        authProvider: (done) => {
            done(null, accessToken);
        },
    });

    try {
        const memberOf = await client.api("/me/memberOf").get();
        //console.log("MemberOf API response:", memberOf);

        const groups = memberOf.value
            .filter(
                (group: any) =>
                    group["@odata.type"] === "#microsoft.graph.group"
            )
            .map((group: any) => group.displayName);
        return groups;
    } catch (error) {
        console.error("Error fetching user roles:", error);
        return [];
    }
}
 

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut
} = NextAuth({
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
    }),
    pages: {
        signIn: "/auth/sign-in",
        signOut: "/auth/sign-out",
    },
    callbacks: {
        async jwt({ token, account, user }) {
            if (account && account.access_token) {
                token.accessToken = account.access_token;
                token.roles = await getUserRoles(account.access_token);
                //console.log("Fetched User:", user);
                if (user && user.email) {
                    await db.update(users)
                        .set({ last_login: new Date() })
                        .where(eq(users.email, user.email))
                        .execute();
                }
            }
            return token;
        },
        async session({ session, token }) {
            (session as any).accessToken = token.accessToken;
            (session as any).roles = token.roles;
            return session;
        },
    },
    session: {
        strategy: "jwt"
    },
    ...authConfig,
    
});
