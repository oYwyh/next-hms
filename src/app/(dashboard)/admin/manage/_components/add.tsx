"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { InsertedCredit, daysList, hoursList } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signup } from "@/actions/auth/auth.action";
import { Form, FormMessage } from "@/components/ui/form";
import FormField from "@/components/ui/custom/FormField";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { TaddSchema, addSchema } from "@/app/(dashboard)/types";
import { TsignUpSchema } from "@/app/auth/types";
import { MultiSelect } from "@/components/ui/multi-select";
import { Badge } from "@/components/ui/badge";

export default function Add() {
  const [open, setOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedHours, setSelectedHours] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<TaddSchema>({
    resolver: zodResolver(addSchema),
  });

  const onSubmit = async (data: any) => {
    if (!selectedDays.length || !selectedHours.length) {
      setError("Please select days and hours");
    } else {
      const result = await signup(data, selectedDays, selectedHours, "doctor");
      if (result.done) {
        form.reset();
        setOpen(false);
      }
      if (result?.error) {
        // Assuming result.error is an object with field-specific errors
        for (const [field, message] of Object.entries(result.error)) {
          form.setError(field as keyof TaddSchema, {
            type: "server",
            message: message,
          });
        }
      }
    }
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Add Doctor</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Doctor</DialogTitle>
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
                    placeholder="Select Days"
                    variant="inverted"
                    animation={2}
                    maxCount={3}
                  />
                </div>
                <div className="pt-4 flex flex-row gap-2 flex-wrap">
                  {selectedDays &&
                    selectedDays.map((day) => {
                      return <Badge className='relative' key={day}>
                        {day}
                        <MultiSelect
                          className="opacity-0 absolute w-full left-0"
                          options={hoursList}
                          onValueChange={setSelectedHours}
                          defaultValue={selectedHours}
                          placeholder=''
                          variant="inverted"
                          animation={2}
                          maxCount={3}
                          editAble={true}
                        />
                      </Badge>;
                    })}
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
    </div>
  );
}
