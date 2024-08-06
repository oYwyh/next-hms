"use client";

import FormField from "@/components/ui/custom/FormField";
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/Button";
import { Form, FormMessage } from "@/components/ui/Form";
import { useForm } from "react-hook-form";
import { TupdateProfileSchema, updateProfileSchema } from "@/types/profile.types";
import { useEffect, useState } from "react";
import { updateProfile } from "@/actions/profile.actions";
import toast from "react-hot-toast";
import { TUser } from "@/types/index.types";


export default function FormUpdateProfile({ user }: { user: TUser }) {

  const [error, setError] = useState<string>()
  const [userData, setUserData] = useState<TupdateProfileSchema>({
    username: user.username,
    email: user.email,
  })

  const form = useForm<TupdateProfileSchema>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: userData.username ? userData.username : '',
      email: userData.email ? userData.email : '',
    },
  });

  const onSubmit = async (data: TupdateProfileSchema) => {
    if (data.username === user.username && data.email === user.email) {
      setError("Nothing to update")
    } else {
      setError('')

      data['id'] = user.id
      const result = await updateProfile(data);

      if (result?.error) {
        if (result?.field === 'username') {
          form.setError('username', {
            type: 'server',
            message: result?.error
          })
        } else if (result?.field === 'email') {
          form.setError('email', {
            type: 'server',
            message: result?.error
          })
        }
      }
      // setUserData({
      //   username: data.username,
      //   email: data.email
      // })
      // form.reset()
      // form.setValue('username', data.username ? data.username : '');
      // form.setValue('email', data.email ? data.email : '');
      // delete data.username;
      // delete data.email;
      toast.success('Profile Updated')
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-row gap-3 pb-2">
            <FormField form={form} name="username" />
            <FormField form={form} name="email" />
          </div>
          <Button className="w-[100%]" type="submit">Update</Button>
          <FormMessage>{error}</FormMessage>
        </form>
      </Form>
    </div>
  );
}
