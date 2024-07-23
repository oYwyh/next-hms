import { useForm } from "react-hook-form";
import FormField from "@/components/ui/custom/FormField";
import { Button } from "@/components/ui/Button";
import { Form } from "@/components/ui/Form";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/AlertDialog";
import { toggleSuper } from "@/actions/operations.actions";
import { useState, useEffect } from "react";

export default function SwitchInput({ id, value }: { id: string | number | any, value: string | boolean }) {
    const form = useForm({
        defaultValues: {
            super: value,
        },
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentSwitchValue, setCurrentSwitchValue] = useState(value);
    const [previousSwitchValue, setPreviousSwitchValue] = useState(value);

    const onSubmit = async (data: any) => {
        if (data.super === undefined) {
            data.super = false;
        }
        const superValue = data.super;
        const result = await toggleSuper(id, superValue);
        setIsDialogOpen(false);

        console.log(result);
    };

    const handleSwitchChange = (checked: boolean) => {
        setPreviousSwitchValue(currentSwitchValue); // Store the current value before changing it
        setCurrentSwitchValue(checked);
        setIsDialogOpen(true);
    };

    const handleSwitchCancel = () => {
        setIsDialogOpen(false);
        setCurrentSwitchValue(previousSwitchValue); // Revert to the previous value
        form.setValue("super", previousSwitchValue); // Update the form value as well
    };

    const handleSwitchConfirm = () => {
        form.setValue("super", currentSwitchValue); // Confirm the new value
        form.handleSubmit(onSubmit)();
    };

    useEffect(() => {
        form.setValue("super", currentSwitchValue); // Sync form value with switch state
    }, [currentSwitchValue, form]);

    return (
        <Form {...form}>
            <form>
                <FormField
                    form={form}
                    name="super"
                    switch="super"
                    onSwitchChange={handleSwitchChange}
                />
                <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                account and remove your data from our servers.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={handleSwitchCancel}>Cancel</AlertDialogCancel>
                            <AlertDialogAction asChild>
                                <Button type="button" onClick={handleSwitchConfirm}>Continue</Button>
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </form>
        </Form>
    );
}
