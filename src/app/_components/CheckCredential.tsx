"use client";

import { useForm } from "react-hook-form";
import { InsertedCredential, TCheckSchema, checkSchema } from "@/types/index.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkCredit } from "@/actions/index.actions";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import FormField from "@/components/ui/custom/FormField";
import {
    Form,
    FormMessage,
} from "@/components/ui/Form";
import { UniqueColumns } from "@/types/index.types";
import { destroyDb, seed } from "@/lib/db/seed";
import { Bean, Trash2 } from "lucide-react";
import { normalizeDataFields } from "@/lib/funcs";

export default function CheckCredential({
    setCreditExists,
    setCredential
}: {
    setCreditExists: React.Dispatch<React.SetStateAction<boolean | null>>,
    setCredential: React.Dispatch<React.SetStateAction<InsertedCredential | null>>
}) {
    const form = useForm<TCheckSchema>({
        resolver: zodResolver(checkSchema),
    });

    const onSubmit = async (data: TCheckSchema) => {

        normalizeDataFields(data);

        const result = await checkCredit(data);

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

    return (
        <div className="flex  justify-center items-center">
            <>
                <>
                    <div className="flex flex-col gap-3">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <FormField form={form} name="credential" />
                                <Button className="mt-3 w-full" type="submit">Submit</Button>
                            </form>
                        </Form>
                    </div>
                </>
            </>
        </div>
    );
}