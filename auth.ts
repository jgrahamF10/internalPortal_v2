import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import "next-auth/jwt";
import { Client } from "@microsoft/microsoft-graph-client";
import type { Provider } from "next-auth/providers"
import authConfig from "./auth.config"
import { db } from "@/db/index";
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

const providers: Provider[] = [
    MicrosoftEntraID({
        clientId: process.env.AZURE_AD_CLIENT_ID!,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
        tenantId: process.env.AZURE_AD_TENANT_ID!,
        authorization: {
            params: {
                scope: "openid profile email User.Read Directory.Read.All",
            },
        },
    }),
];

export const providerMap = providers.map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider()
      return { id: providerData.id, name: providerData.name }
    } else {
      return { id: provider.id, name: provider.name }
    }
  })

export const {
    handlers: { GET, POST },
    auth,
    signIn,
} = NextAuth({
    adapter: DrizzleAdapter(db),
    pages: {
        signIn: "/auth/sign-in",
    },
    callbacks: {
        async jwt({ token, account }) {
            if (account && account.access_token) {
                token.accessToken = account.access_token;
                token.roles = await getUserRoles(account.access_token);
                //console.log("Fetched roles:", token.roles);
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
