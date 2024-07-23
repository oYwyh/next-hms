"use client";

import FormField from "@/components/ui/custom/FormField";
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/Button";
import { Form, FormMessage } from "@/components/ui/Form";
import { useForm } from "react-hook-form";
import { TupdatePersonalSchema, updatePersonalSchema } from "@/types/dashboard.types";
import { useEffect, useState } from "react";
import { updatePersonal, updateProfile } from "@/actions/profile.actions";
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

  const [userData, setUserData] = useState<TupdatePersonalSchema>({
    firstname,
    lastname,
    phone,
    nationalId,
    age,
    gender,
  })

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

  useEffect(() => {
    Object.entries(userData).forEach(([key, value]) => {
      form.setValue(key as keyof TupdatePersonalSchema, value);
    });
  }, [userData])

  const onSubmit = async (data: { [key: string]: string } & TupdatePersonalSchema) => {
    let userFields = Object.keys(userData).filter(key => key !== 'id' && key !== 'role') as (keyof TupdatePersonalSchema)[];
    let fieldsNotToCompare: string[] = [];
    let fieldsToCompare: string[] = [];

    userFields.forEach((field) => {
      if (data[field]?.toLowerCase() !== userData[field]?.toLowerCase()) {
        fieldsToCompare.push(field);
      } else {
        fieldsNotToCompare.push(field);
      }
    });

    for (const field of fieldsNotToCompare) {
      delete data[field];
    }

    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        data[key] = value.toLowerCase();
      }
    });

    if (fieldsToCompare.length === 0) {
      setError("No changes detected");
      return;
    }
    setError('')
    const result = await updatePersonal(data);

    if (result?.error) {
      for (const [field, message] of Object.entries(result.error)) {
        form.setError(field as keyof TupdatePersonalSchema, {
          type: "server",
          message: message
        });
      }
    } else {
      toast.success('Personal Data Updated')
      // Reset the form
      form.reset();
      // Manually update the default values of the form fields
      setUserData({
        firstname: data.firstname ? data.firstname : userData.firstname,
        lastname: data.lastname ? data.lastname : userData.lastname,
        phone: data.phone ? data.phone : userData.phone,
        nationalId: data.nationalId ? data.nationalId : userData.nationalId,
        age: data.age ? data.age : userData.age,
        gender: data.gender ? data.gender : userData.gender,
      })
      fieldsNotToCompare = []
      fieldsToCompare = []
      Object.keys(data).forEach(key => {
        delete data[key];
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField form={form} name="id" type={'hidden'} />
        <div className="flex flex-row gap-3">
          <FormField form={form} name="firstname" />
          <FormField form={form} name="lastname" />
        </div>
        <div className="flex flex-row gap-3">
          <FormField form={form} name="phone" />
          <FormField form={form} name="nationalId" />
        </div>
        <div className="flex flex-row gap-3 pb-2">
          <FormField form={form} name="age" />
          <FormField form={form} name="gender" />
        </div>
        <Button className="w-[100%]" type="submit">Update</Button>
        <FormMessage>{error}</FormMessage>
      </form>
    </Form>
  );
}