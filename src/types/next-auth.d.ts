/**
 * Este é um arquivo específico de definição de tipos.
 * Ele serve pra eu sobrescrever tipagens de bibliotecas.
 *
 * Não é possivel alterar as tipagens de arquivos dentro da pasta node_modules.
 * Aqui iremos sobrescrever as tipagens do Next Auth.
 */

import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * Sobrescreve a tipagem do objeto de sessão.
   */
  interface User {
    id: string;
    name: string;
    email: string;
    username: string;
    avatar_url: string;
  }

  interface Session {
    user: User;
  }
}
