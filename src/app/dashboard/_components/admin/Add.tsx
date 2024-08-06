"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCallback, useState } from "react";

import { addSchema, TAddSchema } from "@/types/operations.types";
import { TbaseSchema, THour, TIndex, TTables, UserRoles } from "@/types/index.types";
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
import { Button } from "@/components/ui/Button";
import { daysList } from "@/constants";
import RolesOperationsForm from "@/app/dashboard/_components/admin/RolesOperationsForm";
import { handleError, normalizeDataFields } from "@/lib/funcs";

export default function Add({ role }: { role: TTables }) {
  const [open, setOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedHours, setSelectedHours] = useState<THour[]>([]);

  const form = useForm<TAddSchema>({
    resolver: zodResolver(addSchema),
  });

  const validateDoctorInputs = useCallback((): boolean => {
    if (!selectedDays.length || !selectedHours.length) {
      form.setError('days', { type: 'custom', message: 'Please select days and hours' });
      return false;
    }

    // Ensure each selected day has at least one time range
    const daysWithHours = new Set(selectedHours.map((hour: THour) => hour.day));
    const allDaysHaveHours = selectedDays.every((day) => daysWithHours.has(day));

    if (!allDaysHaveHours) {
      form.setError('days', { type: 'custom', message: "Each selected day must have at least one time range." });
      return false;
    }

    return true;
  }, [selectedDays, selectedHours]);

  const onSubmit = async (data: TIndex<string> & TAddSchema) => {
    if (role === 'doctor' && !validateDoctorInputs()) return;

    // Convert string inputs to lowercase
    normalizeDataFields(data);

    const result = role === 'doctor'
      ? await add({ data, role, selectedDays, selectedHours, })
      : await add({ data, role });

    if (result?.success) {
      form.reset();
      setSelectedDays([]);
      setSelectedHours([]);
      setOpen(false);
    } else if (result?.error) {
      handleError(form, result.error);
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
          <RolesOperationsForm
            role={role}
            form={form}
            onSubmit={onSubmit}
            daysList={daysList}
            selectedDays={selectedDays}
            setSelectedDays={setSelectedDays}
            selectedHours={selectedHours}
            setSelectedHours={setSelectedHours}
            operation={'add'}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}