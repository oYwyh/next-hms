"use client";

import { daysList } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormMessage } from "@/components/ui/form";
import FormField from "@/components/ui/custom/FormField";
import { useEffect, useState } from "react";
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
import Hours from "@/components/ui/custom/Hours";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { add } from "@/app/(dashboard)/_actions/operations.action";

type HourTypes = { day: string; value: string };


export default function Add() {
  const [open, setOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedHours, setSelectedHours] = useState<HourTypes[]>([]);
  const [error, setError] = useState<string | null>(null);
  const hoursList: HourTypes[] = [];

  useEffect(() => {
    console.log(selectedHours)
  }, [selectedHours])

  const form = useForm<TaddSchema>({
    resolver: zodResolver(addSchema),
  });

  const onSubmit = async (data: TaddSchema) => {
    if (!selectedDays?.length || !selectedHours?.length) {
      setError("Please select days and hours");
      return;
    }

    // Check if each selected day has at least one hour range
    const daysWithHours = new Set(selectedHours.map(hour => hour.day));
    const allDaysHaveHours = selectedDays.every(day => daysWithHours.has(day));

    if (!allDaysHaveHours) {
      setError("Each selected day must have at least one time range.");
      return;
    }

    setError(null); // Clear previous error if any

    const result = await add(data, selectedDays, selectedHours, "doctor");

    if (result?.done) {
      form.reset();
      setSelectedDays([]);
      setSelectedHours([]);
      setOpen(false);
    } else if (result?.error) {
      for (const [field, message] of Object.entries(result.error)) {
        form.setError(field as keyof TaddSchema, {
          type: "server",
          message: message,
        });
      }
    }
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className='capitalize'>Add Doctor</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className='capitalize'>Add Doctor</DialogTitle>
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
                  setSelectedHours([]);
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
                    selectedDays.map((day) => {
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
    </div>
  );
}