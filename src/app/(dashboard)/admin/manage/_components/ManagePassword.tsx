import { TpasswordSchema } from "@/app/(dashboard)/types";
import { Button } from "@/components/ui/button";
import FormField from "@/components/ui/custom/FormField";
import { DialogFooter } from "@/components/ui/dialog";
import { Form, FormMessage } from "@/components/ui/form";
import { TbaseSchema } from "@/lib/types";
import { UseFormReturn } from "react-hook-form";

type ManageFormTypes = {
    operation: 'add' | 'edit',
    form: UseFormReturn<TpasswordSchema>,
    onSubmit: (data: TpasswordSchema) => Promise<void>;
    error: string | null;
}

export default function ManagePassword({
    operation,
    form,
    onSubmit,
    error,
}: ManageFormTypes) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField form={form} name="password" />
                <FormField form={form} name="confirmPassword" />
                {error && <FormMessage>{error}</FormMessage>}
                <DialogFooter className="pt-4">
                    <Button type="submit">Save changes</Button>
                </DialogFooter>
            </form>
        </Form>
    )
}