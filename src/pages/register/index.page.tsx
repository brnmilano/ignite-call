import { Button, Heading, MultiStep, Text, TextInput } from "@ignite-ui/react";
import { Container, Form, FormError, Header } from "./styles";
import { ArrowRight } from "phosphor-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { api } from "../api/axios";
import { AxiosError } from "axios";

/**
 * @description Schema de validação do formulário de criação do perfil.
 *
 * .min(3) - Mínimo de 3 caracteres
 *
 * .regex(/^([a-z\\-]+)$/i) - Apenas letras minúsculas e hífens, uma ou mais vezes.
 *
 * .transform((username) => username.toLowerCase()) - Transforma o valor para minúsculas.
 */
const registerFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: "O usuário precisa ter pelo menos 3 letras." })
    .regex(/^([a-z\\-]+)$/i, {
      message: "O usuário só pode conter letras e hífens.",
    })
    .transform((username) => username.toLowerCase()),

  name: z
    .string()
    .min(3, { message: "O nome precisa ter pelo menos 3 letras." }),
});

/**
 * @description Define o tipo RegisterFormData inferido automaticamente a partir
 * do schema de validação registerFormSchema.
 * Isso garante que os dados do formulário estejam em conformidade com o schema
 * definido.
 */
type RegisterFormData = z.infer<typeof registerFormSchema>;

export default function Register() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      name: "",
    },
  });

  async function HandleRegister(data: RegisterFormData) {
    const { name, username } = data;

    try {
      await api.post("/users", {
        name,
        username,
      });
    } catch (error) {
      if (error instanceof AxiosError && error?.response?.data?.message) {
        alert(error.response.data.message);

        return;
      }

      console.log(error);
    }
  }

  useEffect(() => {
    if (router.query?.username) {
      setValue("username", String(router.query.username));
    }
  }, [router.query?.username, setValue]);

  return (
    <Container>
      <Header>
        <Heading as="strong" size="2xl">
          Bem-vindo ao Ignite Call!
        </Heading>

        <Text>
          Precisamos de algumas informações para criar seu perfil! Ah, você pode
          editar essas informações depois.
        </Text>

        <MultiStep size={4} currentStep={1} />
      </Header>

      <Form as="form" onSubmit={handleSubmit(HandleRegister)}>
        <label>
          <Text size="small">Nome de usuário</Text>

          <TextInput
            prefix="ignite.com/"
            placeholder="Seu usuario"
            {...register("username")}
          />

          {errors.username && (
            <FormError size="sm">{errors.username.message}</FormError>
          )}
        </label>

        <label>
          <Text size="small">Nome completo</Text>

          <TextInput placeholder="Seu nome" {...register("name")} />

          {errors.name && (
            <FormError size="sm">{errors.name.message}</FormError>
          )}
        </label>

        <Button type="submit">
          Próximo passo
          <ArrowRight />
        </Button>
      </Form>
    </Container>
  );
}
