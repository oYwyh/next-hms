import { TpasswordSchema } from "@/types/dashboard.types";
import { Button } from "@/components/ui/Button";
import FormField from "@/components/ui/custom/FormField";
import { DialogFooter } from "@/components/ui/Dialog";
import { Form, FormMessage } from "@/components/ui/Form";
import { TbaseSchema } from "@/types/index.types";
import { UseFormReturn } from "react-hook-form";

type TManagaPassword = {
    form: UseFormReturn<TpasswordSchema>,
    onSubmit: (data: TpasswordSchema) => Promise<void>;
}

export default function ManagePassword({
    form,
    onSubmit,
}: TManagaPassword) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField form={form} name="password" />
                <FormField form={form} name="confirmPassword" />
                <DialogFooter className="pt-4">
                    <Button type="submit">Save changes</Button>
                </DialogFooter>
            </form>
        </Form>
    )
}