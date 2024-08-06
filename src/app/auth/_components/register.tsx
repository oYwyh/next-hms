"use client";

import { InsertedCredential, TRegisterSchema, registerSchema } from "@/types/auth.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { register } from "@/actions/auth.actions";
import { Form } from "@/components/ui/Form";
import FormField from "@/components/ui/custom/FormField";
import { useState } from "react";
import { uniqueColumns } from "@/constants";
import { TIndex } from "@/types/index.types";
import { handleError, normalizeDataFields } from "@/lib/funcs";

export default function Register({ insertedCredential }: { insertedCredential: InsertedCredential }) {
  const form = useForm<TRegisterSchema>({
    resolver: zodResolver(registerSchema),
  });


  const onRegister = async (data: TIndex<string | Date> & TRegisterSchema) => {
    normalizeDataFields(data);

    const result = await register(data);

    if (result?.error) {
      handleError(form, result?.error)
    }
  };

  const renderUniqueFormFields = () => {
    return uniqueColumns.map((column) => (
      insertedCredential?.column === column ? (
        <FormField
          key={column}
          form={form}
          name={column}
          disabled={true}
          defaultValue={insertedCredential.credential}
        />
      ) : (
        <FormField key={column} form={form} name={column} />
      )
    ));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onRegister)}>
        <FormField form={form} name="firstname" />
        <FormField form={form} name="lastname" />
        {renderUniqueFormFields()}
        <FormField form={form} name="dob" label="data of birth" />
        <FormField form={form} name="gender" select="gender" />
        <FormField form={form} name="password" />
        <FormField form={form} name="confirmPassword" />
        <Button className="mt-3 w-full" type="submit">Register</Button>
      </form>
    </Form>
  );
}