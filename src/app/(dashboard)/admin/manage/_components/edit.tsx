'use client'

import { TbaseSchema, daysList } from "@/lib/types";
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

import { add, edit } from "@/app/(dashboard)/_actions/operations.action";
import { log } from "console";

type HourTypes = { day: string; value: string };



export default function Edit({ operation, userId, userData }: { operation: "add" | "edit", userId: string, userData: TbaseSchema }) {
  const [open, setOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedHours, setSelectedHours] = useState<HourTypes[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [differentFields, setDifferentFields] = useState<string[]>([]);
  const hoursList: HourTypes[] = [];

  useEffect(() => {
    console.log(differentFields)
  }, [differentFields])


  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    return `${parseInt(hour)}:${minute}`;
  };

  useEffect(() => {
    if (userData?.workTime) {
      const days = userData.workTime.map((entry: { day: string }) => entry.day);
      const uniqueDays = Array.from(new Set(days));
      setSelectedDays(uniqueDays);

      const hours = userData.workTime.map((entry: { day: string, workHour: { startAt: string, endAt: string } }) => ({
        day: entry.day,
        value: `${formatTime(entry.workHour.startAt)} - ${formatTime(entry.workHour.endAt)}`
      }));
      setSelectedHours(hours);
    }
  }, [userData]);


  const form = useForm<TaddSchema>({
    resolver: zodResolver(addSchema),
    defaultValues: {
      username: userData?.username || "",
      firstname: userData?.firstname || "",
      lastname: userData?.lastname || "",
      phone: userData?.phone || "",
      nationalId: userData?.nationalId || "",
      age: userData?.age || "",
      gender: userData?.gender || "",
      email: userData?.email || "",
      password: "",
    }
  });

  const onSubmit = async (data: TaddSchema) => {
    if (!selectedDays?.length || !selectedHours?.length) {
      setError("Please select days and hours");
      return;
    }

    const daysWithHours = new Set(selectedHours.map(hour => hour.day));
    const allDaysHaveHours = selectedDays.every(day => daysWithHours.has(day));

    if (!allDaysHaveHours) {
      setError("Each selected day must have at least one time range.");
      return;
    }

    setError(null);

    const fieldsToCompare = ['username', 'firstname', 'lastname', 'phone', 'nationalId', 'age', 'gender', 'email'];
    const differentFieldsArray: string[] = [];

    fieldsToCompare.forEach((field) => {
      if (data[field] !== userData[field]) {
        differentFieldsArray.push(field);
      }
    });

    setDifferentFields(differentFieldsArray);

    if (differentFieldsArray.length === 0) {
      setError("No changes detected");
      return;
    }

    const result = await edit(data, selectedDays, selectedHours, "doctor", userId, operation, differentFieldsArray);

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