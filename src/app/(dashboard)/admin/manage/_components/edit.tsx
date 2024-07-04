'use client'

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
import { TeditSchema, editSchema } from "@/app/(dashboard)/types";

import { edit } from "@/app/(dashboard)/_actions/operations.action";
import ManageForm from "./ManageForm";

type THours = { day: string; value: string };

type TEdit = {
  role: 'admin' | 'doctor' | 'user'
  userId: string
  userData: TeditSchema
  workTime: any
}


export default function Edit({ role, userId, userData, workTime }: TEdit) {
  const [open, setOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedHours, setSelectedHours] = useState<THours[]>([]);
  const [error, setError] = useState<string | null>(null);
  const hoursList: THours[] = [];

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    return `${parseInt(hour)}:${minute}`;
  };

  useEffect(() => {
    if (workTime) {
      const days = workTime.map((entry: { day: string }) => entry.day);
      const uniqueDays: string[] = Array.from(new Set(days));
      setSelectedDays(uniqueDays);

      const hours = workTime.map((entry: { day: string, workHour: { startAt: string, endAt: string } }) => ({
        day: entry.day,
        value: `${formatTime(entry.workHour.startAt)} - ${formatTime(entry.workHour.endAt)}`
      }));
      setSelectedHours(hours);
    }

  }, [userData]);

  const form = useForm<TeditSchema>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      username: userData?.username || "",
      firstname: userData?.firstname || "",
      lastname: userData?.lastname || "",
      email: userData?.email || "",
      phone: userData?.phone || "",
      nationalId: userData?.nationalId || "",
      age: userData?.age || "",
      gender: userData?.gender || "",
      specialty: userData?.specialty || ""
    }
  });

  const onSubmit = async (data: TeditSchema) => {

    // Compare form data with userData and log any matching fields
    const userFields = Object.keys(userData).filter(key => key !== 'workTime' && key !== 'id' && key !== 'role');
    const fieldsNotToCompare: string[] = [];
    const fieldsToCompare: string[] = [];

    userFields.forEach((field) => {
      if (data[field]?.toLowerCase() !== userData[field]?.toLowerCase()) {
        fieldsToCompare.push(field);
      } else {
        fieldsNotToCompare.push(field);
      }
    });

    for (const field of fieldsNotToCompare) (
      delete data[field]
    )

    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        data[key] = value.toLowerCase();
      }
    });

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

      // Compare selectedDays and selectedHours with userData
      const originalDays = Array.from(new Set(workTime.map((entry: { day: string }) => entry.day)));
      const originalHours = workTime.map((entry: { day: string, workHour: { startAt: string, endAt: string } }) => ({
        day: entry.day,
        value: `${formatTime(entry.workHour.startAt)} - ${formatTime(entry.workHour.endAt)}`,
      }));

      const daysChanged = !(selectedDays.length === originalDays.length && selectedDays.every((day) => originalDays.includes(day)));
      const hoursChanged = !(selectedHours.length === originalHours.length && selectedHours.every((hour) => {
        return originalHours.some(originalHour => originalHour.day === hour.day && originalHour.value === hour.value);
      }));

      if (fieldsToCompare.length === 0 && !daysChanged && !hoursChanged) {
        setError("No changes detected");
        return;
      }
    }
    if (fieldsToCompare.length === 0) {
      setError("No changes detected");
      return;
    }

    let result;
    result = await edit(data, role, userId, 'edit', selectedDays, selectedHours, fieldsToCompare);
    if (role == 'doctor') {
    } else {
      result = await edit(data, role, userId, 'edit');
    }

    if (result?.done) {
      form.reset();
      setSelectedDays([]);
      setSelectedHours([]);
      setOpen(false);
    } else if (result?.error) {
      for (const [field, message] of Object.entries(result.error)) {
        form.setError(field as keyof TeditSchema, {
          type: "server",
          message: message
        });
      }
    }
  };
  return (
    <div>
      <ManageForm
        open={open}
        setOpen={setOpen}
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
        operation={'edit'}
      />
    </div>
  );
}