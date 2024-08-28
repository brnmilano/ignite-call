/**
 * No nome do arquivo, os [ ] serve para recebermos algum tipo de paramêtro.
 * Quando coloco o [ ] em rotas parametrizadas, eu basicamente estou dizendo:
 * "Qualquer coisa que vier depois de https://localhost/api/auth/ eu estou
 * dizendo que eu posso colocar qualquer coisa aqui dentro.
 * Esse qualquer coisa é um parâmetro que vai ser repassado pra dentro da nossa
 * rota, pra dentro do arquivo.
 *
 * Por exemplo: https://localhost/api/auth/123teste
 *
 * Quando eu coloco o [...nextauth.ts] eeu estou dizendo, basicamente, que eu
 * posso ter múltiplos parâmetros sendo enviados ali pra dentro. Como que seriam
 * múltiplos parâmetros? Seriam, basicamente, várias informações, cada uma
 * separada por barra. Qualquer coisa aqui, no final, ele vai sempre redirecionar
 * pra essa mesma rota
 */

import { PrismaAdapter } from "@/lib/auth/prisma-adaptor";
import { NextApiRequest, NextApiResponse } from "next";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export function buildNextAuthOptions(
  req: NextApiRequest,
  res: NextApiResponse
): NextAuthOptions {
  return {
    // Configure one or more authentication providers
    adapter: PrismaAdapter(req, res),

    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        authorization: {
          params: {
            scope:
              "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar",
          },
        },
      }),
      // ...add more providers here
    ],

    callbacks: {
      async signIn({ account }) {
        if (
          !account?.scope?.includes("https://www.googleapis.com/auth/calendar")
        ) {
          return "/register/connect-calendar/?error=permissions";
        }

        return true;
      },

      async session({ session, user }) {
        return {
          ...session,
          user,
        };
      },
    },
  };
}

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  return await NextAuth(req, res, buildNextAuthOptions(req, res));
}
