"use client";

import FormField from "@/components/ui/custom/FormField";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { TupdatePasswordSchema, updatePasswordSchema } from "@/app/(dashboard)/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { updatePassword } from "../_actions/profile.action";
import toast from "react-hot-toast";
import { useState } from "react";

type FormUpdatePasswordTypes = {
  id: string;
}

export default function FormUpdateProfile({ id }: FormUpdatePasswordTypes) {

  const [empty, setEmpty] = useState<boolean>(false)

  const form = useForm<TupdatePasswordSchema>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      id
    }
  });

  const onSubmit = async (data: TupdatePasswordSchema) => {
    await updatePassword(data)
    toast.success('Password Updated')
    setEmpty(true)
    setTimeout(() => {
      setEmpty(false)
    }, 1000);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField form={form} name="id" type={'hidden'} />
        {empty ? (
          <>
            <FormField form={form} value={''} name="password" />
            <FormField form={form} value={''} name="confirmPassword" />
          </>
        ): (
          <>
            <FormField form={form} name="password" />
            <FormField form={form} name="confirmPassword" />
          </>
        )}
        <Button type="submit">Update</Button>
      </form>
    </Form>
  );
}
