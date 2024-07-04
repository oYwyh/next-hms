"use client";

import FormField from "@/components/ui/custom/FormField";
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Form, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { TupdateProfileSchema, updateProfileSchema } from "@/app/(dashboard)/types";
import { useState } from "react";
import { updateProfile } from "../_actions/profile.action";
import toast from "react-hot-toast";

type FormUpdateProfileTypes = {
  id: string;
  username: string;
  email: string;
}

export default function FormUpdateProfile({
  id,
  username,
  email,
}: FormUpdateProfileTypes) {

  const [error, setError] = useState<string>()

  const form = useForm<TupdateProfileSchema>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      id,
      username,
      email,
    },
  });

  const onSubmit = async (data: TupdateProfileSchema) => {
    if (data.username === username && data.email === email) {
      setError("Nothing to update")
    } else {
      setError('')
      const result = await updateProfile(data);

      if (result?.exists) {
        setError(result?.exists)
      } else {
        toast.success('Profile Updated')
      }
    }


  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField form={form} name="id" type={'hidden'} />
        <FormField form={form} name="username" />
        <FormField form={form} name="email" />
        <Button type="submit">Update</Button>
        <FormMessage>{error}</FormMessage>
      </form>
    </Form>
  );
}
