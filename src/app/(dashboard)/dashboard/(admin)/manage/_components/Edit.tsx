'use client'

import { daysList } from "@/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/Dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { TeditSchema, TpasswordSchema, editSchema, passwordSchema } from "@/app/(dashboard)/types";
import { edit, editPassword } from "@/app/(dashboard)/_actions/operations.actions";
import ManageForm from "./ManageForm";
import ManagePassword from "./ManagePassword";
import { Button } from "@/components/ui/Button";
import { THours, TWorkHours } from "@/lib/types";

type TEdit = {
  role: 'admin' | 'doctor' | 'user'
  userId: string
  userData: { [key: string]: string } & TeditSchema
  workTime: any
  setPopOpen: Dispatch<SetStateAction<boolean | undefined>>;
}

export default function Edit({ role, userId, userData, workTime, setPopOpen }: TEdit) {
  const [open, setOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedHours, setSelectedHours] = useState<THours>([]);
  const [error, setError] = useState<string | null>(null);
  const hoursList: THours = [];

  useEffect(() => {
    if (workTime) {
      const days = workTime.map((entry: { day: string }) => entry.day);
      const uniqueDays: string[] = Array.from(new Set(days));
      setSelectedDays(uniqueDays);

      const hours = workTime.map((entry: { day: string, workHour: TWorkHours }) => ({
        day: entry.day,
        value: `${entry.workHour.from} - ${entry.workHour.to}`
      }));
      setSelectedHours(hours);
    }
  }, [userData]);

  const accountForm = useForm<TeditSchema>({
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

  const passwordForm = useForm<TpasswordSchema>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });


  const onEditAccount = async (data: TeditSchema) => {
    // Compare form data with userData and log any matching fields
    const userFields = Object.keys(userData).filter(key => key !== 'workTime' && key !== 'id' && key !== 'role')
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
      const originalHours = workTime.map((entry: { day: string, workHour: TWorkHours }) => ({
        day: entry.day,
        value: `${entry.workHour.from} - ${entry.workHour.to}`,
      }));

      const daysChanged = !(selectedDays.length === originalDays.length && selectedDays.every((day) => originalDays.includes(day)));
      const hoursChanged = !(selectedHours.length === originalHours.length && selectedHours.every((hour) => {
        return originalHours.some((originalHour: { day: string, value: string }) => originalHour.day === hour.day && originalHour.value === hour.value);
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
    if (role == 'doctor') {
      result = await edit(data, role, userId, 'edit', selectedDays, selectedHours);
    } else {
      result = await edit(data, role, userId, 'edit');
    }

    if (result?.done) {
      accountForm.reset();
      setSelectedDays([]);
      setSelectedHours([]);
      setOpen(false);
      setPopOpen(false);

    } else if (result?.error) {
      console.log(result?.error)
      for (const [field, message] of Object.entries(result.error)) {
        accountForm.setError(field, {
          type: "server",
          message: message
        });
      }
    }
  };

  const onEditPassword = async (data: TpasswordSchema) => {

    const result = await editPassword(data, userId);

    if (result?.done) {
      passwordForm.reset();
      setSelectedDays([]);
      setSelectedHours([]);
      setOpen(false);
      setPopOpen(false);
    }
  }

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className='capitalize'>Edit {role}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className='capitalize'>Edit {role}</DialogTitle>
            <DialogDescription>
              Anyone who has this link will be able to view this.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="account" className="w-[100%]">
            <TabsList className="w-[100%]">
              <TabsTrigger className="w-[100%]" value="account">Account</TabsTrigger>
              <TabsTrigger className="w-[100%]" value="password">Password</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <ManageForm
                role={role}
                form={accountForm}
                onSubmit={onEditAccount}
                daysList={daysList}
                selectedDays={selectedDays}
                setSelectedDays={setSelectedDays}
                selectedHours={selectedHours}
                setSelectedHours={setSelectedHours}
                hoursList={hoursList}
                error={error}
                operation={'edit'}
              />
            </TabsContent>
            <TabsContent value="password">
              <ManagePassword
                form={passwordForm}
                onSubmit={onEditPassword}
                error={error}
                operation={'edit'}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}