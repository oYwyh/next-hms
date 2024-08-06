"use client";

import { InsertedCredential, TLoginSchema, loginSchema } from "@/types/auth.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { login } from "@/actions/auth.actions";
import { Form } from "@/components/ui/Form";
import FormField from "@/components/ui/custom/FormField";
import { Button } from "@/components/ui/Button";
import { TIndex } from "@/types/index.types";
import { normalizeDataFields } from "@/lib/funcs";

export default function Login({ insertedCredential }: { insertedCredential: InsertedCredential }) {
  const form = useForm<TLoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onLogin = async (data: TIndex<string> & TLoginSchema) => {

    normalizeDataFields(data);

    const result = await login(data);

    if (result?.error) {
      form.setError("password", { type: 'server', message: 'Invalid Password' });
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onLogin)}>
          <FormField form={form} name="column" type={'hidden'} disabled={true} defaultValue={insertedCredential.column} />
          <FormField form={form} name="credential" disabled={true} defaultValue={insertedCredential.credential} />
          <FormField form={form} name="password" />
          <Button className="mt-3 w-full" type="submit">Login</Button>
        </form>
      </Form>
    </>
  );
}
