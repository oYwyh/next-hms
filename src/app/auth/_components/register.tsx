"use client";

import { TsignUpSchema, signUpSchema } from "@/app/auth/types";
import { InsertedCredit } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signup } from "@/actions/auth/auth.action";
import { Form, FormMessage } from "@/components/ui/form";
import FormField from "@/components/ui/custom/FormField";
import { useState } from "react";

export default function Register({ insertedCredit }: { insertedCredit: InsertedCredit }) {
  const form = useForm<TsignUpSchema>({
    resolver: zodResolver(signUpSchema),
  });


  const onRegister = async (data: TsignUpSchema) => {
    const result = await signup(data);
    if (result?.error) {
      // Assuming result.error is an object with field-specific errors
      for (const [field, message] of Object.entries(result.error)) {
        form.setError(field as keyof TsignUpSchema, { type: 'server', message: message });
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onRegister)}>
        <FormField form={form} name="firstname" />
        <FormField form={form} name="lastname" />
        {insertedCredit?.column === 'username' ? (
          <FormField form={form} name="username" disabled={true} defaultValue={insertedCredit.credit} />
        ) : (
          <FormField form={form} name="username" />
        )}
        {insertedCredit?.column === 'email' ? (
          <FormField form={form} name="email" disabled={true} defaultValue={insertedCredit.credit} />
        ) : (
          <FormField form={form} name="email" />
        )}
        {insertedCredit?.column === 'phone' ? (
          <FormField form={form} name="phone" disabled={true} defaultValue={insertedCredit.credit} />
        ) : (
          <FormField form={form} name="phone" />
        )}
        {insertedCredit?.column === 'nationalId' ? (
          <FormField form={form} name="nationalId" disabled={true} defaultValue={insertedCredit.credit} />
        ) : (
          <FormField form={form} name="nationalId" />
        )}
        <FormField form={form} name="age" />
        <FormField form={form} name="gender" />
        <FormField form={form} name="password" />
        <FormField form={form} name="confirmPassword" />
        <Button type="submit">Register</Button>
      </form>
    </Form>
  );
}