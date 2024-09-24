import { Avatar, Heading, Text } from "@ignite-ui/react";
import { GetStaticPaths, GetStaticProps } from "next";
import { prisma } from "../../../lib/prisma";
import { Container, UserHeader } from "./styles";
import { ScheduleForm } from "./ScheduleForm";

interface ScheduleProps {
  user: {
    name: string;
    bio: string;
    avatarUrl: string;
  };
}

export default function Schedule({ user }: ScheduleProps) {
  const { avatarUrl, bio, name } = user;

  return (
    <Container>
      <UserHeader>
        <Avatar src={avatarUrl} />

        <Heading>{name}</Heading>

        <Text>{bio}</Text>
      </UserHeader>

      <ScheduleForm />
    </Container>
  );
}

/**
 * Quando temos uma página estática no Next.js e ela tem um parâmetro que é dinâmico,
 * por exemplo, username, que vem da URL. Obrigatóriamente precisamos criar o
 * método getStaticPaths, quando rodamos o build da aplicação, o Next.js vai
 * gerar automaticamente todas as páginas estáticas no momento do build. Nesse
 * momento, o Next.js não sabe qual é o parâmetro username que será passado para
 * gerar as páginas estáticas. O método getStaticPaths é responsável por informar
 * ao Next.js quais são os parâmetros que serão passados para gerar as páginas
 * estáticas desde o primeiro momento da build do Next.js.
 *
 * No nosso caso, iremos retornar paths como um array vazio, dessa forma o Next.js
 * não irá gerar nenhuma página estática no momento do build. O fallback: "blocking"
 * é responsável por gerar a página estática no momento da primeira requisição.
 * Ou seja, a página será gerada conforme os usuários forem acessando a página.
 *
 * @returns {GetStaticPaths} - Retorna os parâmetros que serão passados para gerar
 */
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const username = String(params?.username);

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (!user) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      user: {
        name: user.name,
        bio: user.bio,
        avatarUrl: user.avatar_url,
      },
    },
    revalidate: 60 * 60 * 24, // 1 day
  };
};
