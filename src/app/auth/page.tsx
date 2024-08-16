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
import CheckCredential from "@/app/_components/CheckCredential";

export default function AuthPage() {
  const [creditExists, setCreditExists] = useState<boolean | null>(null);
  const [credential, setCredential] = useState<InsertedCredential | null>(null);

  const seedAction = async () => {
    await seed()
  };

  const destroyAction = async () => {
    await destroyDb()
  }

  return (
    <div className="w-screen h-screen flex  justify-center items-center">
      <>
        {!credential ? (
          <div className="flex flex-col gap-1">
            <CheckCredential setCreditExists={setCreditExists} setCredential={setCredential} />
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
        ) : (
          <>
            {creditExists && credential && <Login insertedCredential={credential} />}
            {creditExists === false && credential && <Register insertedCredential={credential} />}
          </>
        )}
      </>
    </div>
  );
}