"use client";

import { TsignInSchema, signInSchema } from "@/app/auth/types";
import { InsertedCredit } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signin } from "@/actions/auth/auth.action";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import FormField from "@/components/ui/custom/FormField";

export default function Login({ insertedCredit }:{ insertedCredit: InsertedCredit }) {
  const form = useForm<TsignInSchema>({
    resolver: zodResolver(signInSchema),
  });

  const onLogin = async (data: TsignInSchema) => {
    const result = await signin(data);

    if (result?.error) {
      // Assuming result.error is an object with field-specific errors
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
