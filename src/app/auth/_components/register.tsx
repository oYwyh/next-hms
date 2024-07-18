"use client";

import { InsertedCredit, TregisterSchema, registerSchema } from "@/app/auth/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { register } from "@/actions/auth/auth.actions";
import { Form, FormMessage } from "@/components/ui/Form";
import FormField from "@/components/ui/custom/FormField";
import { useState } from "react";

export default function Register({ insertedCredit }: { insertedCredit: InsertedCredit }) {
  const form = useForm<TregisterSchema>({
    resolver: zodResolver(registerSchema),
  });


  const onRegister = async (data: { [key: string]: string | number } & TregisterSchema) => {

    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        data[key] = value.toLowerCase();
      }
    });

    const result = await register(data);

    if (result?.error) {
      for (const [field, message] of Object.entries(result.error)) {
        form.setError(field as keyof TregisterSchema, { type: 'server', message: message });
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
        <FormField form={form} name="gender" select="gender" />
        <FormField form={form} name="password" />
        <FormField form={form} name="confirmPassword" />
        <Button type="submit">Register</Button>
      </form>
    </Form>
  );
}