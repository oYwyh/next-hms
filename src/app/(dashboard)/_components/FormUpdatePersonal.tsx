"use client";

import FormField from "@/components/ui/custom/FormField";
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Form, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { TupdatePersonalSchema, updatePersonalSchema } from "@/app/(dashboard)/types";
import { useState } from "react";
import { updatePersonal, updateProfile } from "../_actions/profile.action";
import toast from "react-hot-toast";

type FormUpdatePersonalTypes = {
  id: string;
  firstname: string,
  lastname: string,
  phone: string,
  nationalId: string,
  age: string,
  gender: 'male' | 'female',
}

export default function FormUpdatePersonal({
  id,
  firstname,
  lastname,
  phone,
  nationalId,
  age,
  gender,
}: FormUpdatePersonalTypes) {

  const [error, setError] = useState<string>()

  const form = useForm<TupdatePersonalSchema>({
    resolver: zodResolver(updatePersonalSchema),
    defaultValues: {
      id,
      firstname,
      lastname,
      phone,
      nationalId,
      age,
      gender,
    },
  });

  const onSubmit = async (data: TupdatePersonalSchema) => {
    if(
      data.firstname === firstname 
      && data.lastname === lastname
      && data.phone === phone
      && data.nationalId === nationalId
      && data.age === age
      && data.gender === gender
    ) {
      setError("Nothing to update")
    }else {
      setError('')
      const result = await updatePersonal(data);

      if(result?.error) {
        setError(result?.error)
      }else {
        toast.success('Personal Data Updated')
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField form={form} name="id" type={'hidden'} />
        <FormField form={form} name="firstname" />
        <FormField form={form} name="lastname" />
        <FormField form={form} name="phone" />
        <FormField form={form} name="nationalId" />
        <FormField form={form} name="age" />
        <FormField form={form} name="gender" />
        <Button type="submit">Update</Button>
        <FormMessage>{error}</FormMessage>
      </form>
    </Form>
  );
}
