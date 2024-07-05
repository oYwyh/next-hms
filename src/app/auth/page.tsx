"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { InsertedCredit, TcheckSchema, checkSchema } from "@/app/auth/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkCredit } from "@/actions/auth/auth.action";
import { useState } from "react";
import Login from "./_components/login";
import Register from "./_components/register";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import FormField from "@/components/ui/custom/FormField";

import {
  Form,
  FormMessage,
} from "@/components/ui/form";

export default function AuthPage() {
  const [error, setError] = useState<string>('');
  const [creditExist, setCreditExist] = useState<boolean>();
  const [credit, setCredit] = useState<InsertedCredit | null>();

  const form = useForm<TcheckSchema>({
    resolver: zodResolver(checkSchema),
  });

  const onCheck = async (data: TcheckSchema) => {
    const result = await checkCredit(data);


    if (result?.column != 'unknown') {
      setCredit({
        column: result?.column as 'email' | 'phone' | 'nationalId' | 'username',
        credit: data.credit,
      });
      if (result?.exist === false) {
        setCreditExist(false);
      } else {
        setCreditExist(true);
      }
    } else {
      setError('Invalid credential')
    }

  };

  return (
    <div className="w-screen h-screen flex  justify-center items-center">
      <>
        {form.formState.isSubmitting ? (
          <>
            <div className="flex flex-col space-y-3">
              <Skeleton className="h-[40px] w-[210px] rounded-md" />
              <Skeleton className="h-[40px] w-[210px] rounded-md" />
              <Skeleton className="h-[40px] w-[210px] bg-[#0F172A] rounded-md" />
            </div>
          </>
        ) : (
          <>
            {creditExist !== true && creditExist !== false && (
              <>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onCheck)}>
                    <FormField form={form} name="credit" />
                    <Button type="submit">Submit</Button>
                    {error && <FormMessage>{error}</FormMessage>}
                  </form>
                </Form>
              </>
            )}
            {creditExist && credit && <Login insertedCredit={credit} />}
            {creditExist === false && credit && <Register insertedCredit={credit} />}
          </>
        )}
      </>
    </div>
  );
}