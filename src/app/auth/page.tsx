"use client";

import { useForm } from "react-hook-form";
import { InsertedCredential, TCheckSchema, checkSchema } from "@/types/auth.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkCredit } from "@/actions/auth.actions";
import { useEffect, useState } from "react";
import Login from "./_components/login";
import Register from "./_components/register";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import FormField from "@/components/ui/custom/FormField";

import {
  Form,
  FormMessage,
} from "@/components/ui/Form";
import { UniqueColumns } from "@/types/index.types";
import { destroyDb, seed } from "@/lib/db/seed";
import { Bean, Trash2 } from "lucide-react";

export default function AuthPage() {
  const [creditExists, setCreditExists] = useState<boolean>();
  const [credential, setCredential] = useState<InsertedCredential | null>();

  const form = useForm<TCheckSchema>({
    resolver: zodResolver(checkSchema),
  });

  const onSubmit = async (data: TCheckSchema) => {
    const result = await checkCredit(data);

    console.log(result)

    if (result?.column != 'unknown') {
      setCredential({
        column: result?.column as UniqueColumns,
        credential: data.credential,
      });
      if (result?.exists === false) {
        setCreditExists(false);
      } else {
        setCreditExists(true);
      }
    } else {
      form.setError('credential', { message: 'Invalid credential' });
    }
  };

  const seedAction = async () => {
    await seed()
  };

  const destroyAction = async () => {
    await destroyDb()
  }

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
            {creditExists !== true && creditExists !== false && (
              <div className="flex flex-col gap-3">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField form={form} name="credential" />
                    <Button className="mt-3 w-full" type="submit">Submit</Button>
                  </form>
                </Form>
                <div className="flex flex-col gap-1">
                  <Button className="flex flex-row-reverse gap-2 mt-5 w-screen" variant={'outline'} onClick={seedAction}>
                    <Bean size={18} />
                    Seed
                  </Button>
                  <Button className="flex flex-row-reverse gap-2 mt-5 w-screen" variant={'outline'} onClick={destroyAction}>
                    Destroy Db
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            )}
            {creditExists && credential && <Login insertedCredential={credential} />}
            {creditExists === false && credential && <Register insertedCredential={credential} />}
          </>
        )}
      </>
    </div>
  );
}