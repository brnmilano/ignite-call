import { Button, Text, TextInput } from "@ignite-ui/react";
import { ArrowRight } from "phosphor-react";
import { Form, FormAnnotation } from "./styles";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

/**
 * @description Schema de validação do formulário de reserva de username.
 *
 * .min(3) - Mínimo de 3 caracteres
 *
 * .regex(/^([a-z\\-]+)$/i) - Apenas letras minúsculas e hífens, uma ou mais vezes.
 *
 * .transform((username) => username.toLowerCase()) - Transforma o valor para minúsculas.
 */
const claimUserNameFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: "O usuário precisa ter pelo menos 3 letras" })
    .regex(/^([a-z\\-]+)$/i, {
      message: "O usuário só pode conter letras e hífens",
    })
    .transform((username) => username.toLowerCase()),
});

/**
 * @description Tipo inferido a partir do schema de validação.
 */
type ClaimUsernameFormData = z.infer<typeof claimUserNameFormSchema>;

export function ClaimUsernameForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClaimUsernameFormData>({
    resolver: zodResolver(claimUserNameFormSchema),
  });

  const handleClaimUsername = async (data: any) => {
    console.log(data);
  };

  return (
    <>
      <Form as="form" onSubmit={handleSubmit(handleClaimUsername)}>
        <TextInput
          size="sm"
          prefix="ignite.com/"
          placeholder="seu-usuário"
          {...register("username")}
        />

        <Button size="sm" type="submit">
          Reservar
          <ArrowRight />
        </Button>
      </Form>

      <FormAnnotation>
        <Text size="sm">
          {errors.username
            ? errors.username.message
            : "Digite o nome do usuário desejado"}
        </Text>
      </FormAnnotation>
    </>
  );
}
