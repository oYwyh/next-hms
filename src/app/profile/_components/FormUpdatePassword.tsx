"use client";

import FormField from "@/components/ui/custom/FormField";
import { Button } from "@/components/ui/Button";
import { Form } from "@/components/ui/Form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updatePassword } from "@/actions/profile.actions";
import toast from "react-hot-toast";
import { useState } from "react";
import { passwordSchema, TpasswordSchema } from "@/types/dashboard.types";

export default function FormUpdateProfile() {

  const [empty, setEmpty] = useState<boolean>(false)

  const form = useForm<TpasswordSchema>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: TpasswordSchema) => {
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
        <div className="flex flex-row gap-3 pb-2">
          {empty ? (
            <>
              <FormField form={form} name="password" />
              <FormField form={form} name="confirmPassword" />
            </>
          ) : (
            <>
              <FormField form={form} name="password" />
              <FormField form={form} name="confirmPassword" />
            </>
          )}
        </div>
        <Button className="w-[100%]" type="submit">Update</Button>
      </form>
    </Form>
  );
}
