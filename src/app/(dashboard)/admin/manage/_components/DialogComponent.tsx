'use client'

import { Button } from "@/components/ui/button";
import FormField from "@/components/ui/custom/FormField";
import Hours from "@/components/ui/custom/Hours";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter,
    DialogHeader,
} from "@/components/ui/dialog";
import { FormMessage } from "@/components/ui/form";
import { MultiSelect } from "@/components/ui/multi-select";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Badge } from "lucide-react";
import { Form } from "react-hook-form";

export default function DialogComponent({
    form,
    selectedDays,
    selectedHours,
    setSelectedDays,
    setSelectedHours,
    daysList,
    hoursList,
    error,
    operation,
    open,
    setOpen,
    onSubmit,
}: any) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className='capitalize'>{operation} Doctor</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className='capitalize'>{operation} Doctor</DialogTitle>
                    <DialogDescription>
                        Anyone who has this link will be able to view this.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="flex flex-row gap-10">
                                <FormField form={form} name="firstname" />
                                <FormField form={form} name="lastname" />
                            </div>
                            <div className="flex flex-row gap-10">
                                <FormField form={form} name="username" />
                                <FormField form={form} name="email" />
                            </div>
                            <div className="flex flex-row gap-10">
                                <FormField form={form} name="phone" />
                                <FormField form={form} name="nationalId" />
                            </div>
                            <div className="flex flex-row gap-10">
                                <FormField form={form} name="age" />
                                <FormField form={form} name="gender" />
                            </div>
                            <div className="flex flex-row gap-10">
                                <FormField form={form} name="password" />
                                <FormField form={form} name="confirmPassword" />
                            </div>
                            <div className="pt-4">
                                <MultiSelect
                                    options={daysList}
                                    onValueChange={setSelectedDays}
                                    defaultValue={selectedDays}
                                    selectedHours={selectedHours}
                                    setSelectedHours={setSelectedHours}
                                    placeholder="Select Days"
                                    variant="inverted"
                                    animation={2}
                                    maxCount={3}
                                    clearAble={false}
                                />
                            </div>
                            <div className="pt-4 flex flex-row gap-2 flex-wrap">
                                {selectedDays &&
                                    selectedDays.map((day: any) => {
                                        return (
                                            <Popover key={day}>
                                                <PopoverTrigger><Badge className="cursor-pointer">{day}</Badge></PopoverTrigger>
                                                <PopoverContent>
                                                    <Hours
                                                        selectedHours={selectedHours}
                                                        setSelectedHours={setSelectedHours}
                                                        day={day}
                                                        hoursList={hoursList}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        )
                                    })
                                }
                            </div>
                            {error && <FormMessage>{error}</FormMessage>}
                            <DialogFooter className="pt-4">
                                <Button type="submit">Save changes</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}