// localhost:3000/api/users

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { setCookie } from "nookies";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  /**
   * Se o método da requisição não for POST, retorna status 405
   * (Method Not Allowed)
   * .end encerra a resposta sem enviar dados.
   */
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { name, username } = req.body;

  const userExists = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (userExists) {
    return res.status(400).json({
      message: "Username already exists",
    });
  }

  const user = await prisma.user.create({
    data: {
      name,
      username,
    },
  });

  setCookie({ res }, "@ignitecall:userId", user.id, {
    maxAge: 60 * 60 * 24 * 7, // 1 week or 7 days
    path: "/",
  });

  return res.status(201).json(user);
}
