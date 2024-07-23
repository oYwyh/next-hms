"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";

import { addSchema, TaddSchema, TeditSchema } from "@/types/dashboard.types";
import { TbaseSchema, THours, UserRoles } from "@/types/index.types";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/Dialog";
import { add } from "@/actions/operations.actions";
import ManageForm from "./ManageForm";
import { Button } from "@/components/ui/Button";
import { daysList } from "@/constants";

export default function Add({ role, withAppointment }: { role: UserRoles, withAppointment?: { doctorId: string, date: string, from: string, to: string } }) {
  const [open, setOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedHours, setSelectedHours] = useState<THours>([]);
  const [error, setError] = useState<string | null>(null);
  const hoursList: THours = [];

  const form = useForm<TaddSchema>({
    resolver: zodResolver(addSchema),
  });

  const onSubmit = async (data: TaddSchema) => {
    console.log('lol')

    if (role == 'doctor') {
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
    }

    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        data[key] = value.toLowerCase();
      }
    });

    let result
    if (role == 'doctor') {
      result = await add(data, role, withAppointment, selectedDays, selectedHours);
    } else {
      result = await add(data, role, withAppointment);
    }

    if (result?.done) {
      form.reset();
      setSelectedDays([]);
      setSelectedHours([]);
      setOpen(false);
    } else if (result?.error) {
      for (const [field, message] of Object.entries(result.error)) {
        form.setError(field as keyof TbaseSchema, {
          type: "server",
          message: message,
        });
      }
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className='capitalize'>Add {role}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className='capitalize'>Add {role}</DialogTitle>
            <DialogDescription>
              Anyone who has this link will be able to view this.
            </DialogDescription>
          </DialogHeader>
          <ManageForm
            role={role}
            form={form}
            onSubmit={onSubmit}
            daysList={daysList}
            selectedDays={selectedDays}
            setSelectedDays={setSelectedDays}
            selectedHours={selectedHours}
            setSelectedHours={setSelectedHours}
            hoursList={hoursList}
            error={error}
            operation={'add'}
            withAppointment={withAppointment ? true : false}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}