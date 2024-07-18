"use client";

import { InsertedCredit, TloginSchema, loginSchema } from "@/app/auth/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { login } from "@/actions/auth/auth.actions";
import { Form } from "@/components/ui/Form";
import FormField from "@/components/ui/custom/FormField";
import { Button } from "@/components/ui/Button";

export default function Login({ insertedCredit }: { insertedCredit: InsertedCredit }) {
  const form = useForm<TloginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onLogin = async (data: { [key: string]: string | number } & TloginSchema) => {

    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        data[key] = value.toLowerCase();
      }
    });

    const result = await login(data);

    if (result?.error) {
      form.setError("password", { type: 'server', message: 'Invalid Password' });
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onLogin)}>
          <FormField form={form} name="column" type={'hidden'} disabled={true} defaultValue={insertedCredit.column} />
          <FormField form={form} name="credit" disabled={true} defaultValue={insertedCredit.credit} />
          <FormField form={form} name="password" />
          <Button type="submit">Login</Button>
        </form>
      </Form>
    </>
  );
}
