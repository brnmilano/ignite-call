import { Button, Heading, MultiStep, Text } from "@ignite-ui/react";
import { Container, Header } from "../styles";
import { ArrowRight } from "phosphor-react";
import { ConnectBox, ConnectItem } from "./styles";
import { signIn, useSession } from "next-auth/react";

export default function Register() {
  const session = useSession();

  console.log(session.status);

  return (
    <Container>
      <Header>
        <Heading as="strong" size="2xl">
          Conecte sua agenda!
        </Heading>

        <Text>
          Conecte o seu calendário para verificar automaticamente as horas
          ocupadas e os novos eventos à medida em que são agendados.
        </Text>

        <MultiStep size={4} currentStep={1} />
      </Header>

      <ConnectBox>
        <ConnectItem>
          <Text>Google Calendar</Text>

          <Button variant="secondary" onClick={() => signIn("google")}>
            Conectar
            <ArrowRight />
          </Button>
        </ConnectItem>

        <Button type="submit">
          Próximo passo
          <ArrowRight />
        </Button>
      </ConnectBox>
    </Container>
  );
}
