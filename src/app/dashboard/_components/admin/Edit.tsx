'use client'

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { daysList } from "@/constants";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/Dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { TEditSchema, TPasswordSchema, editSchema, passwordSchema } from "@/types/operations.types";
import { edit, editPassword } from "@/actions/operations.actions";
import RolesOperationsForm from "@/app/dashboard/_components/RolesOperationsForm";
import ManagePassword from "./ManagePassword";
import { Button } from "@/components/ui/Button";
import { THour, TIndex, TWorkHour, UserRoles } from "@/types/index.types";
import { compareFields, handleError, normalizeDataFields } from "@/lib/funcs";

type TEdit = {
  role: UserRoles;
  userId: string;
  userData: { [key: string]: string } & TEditSchema;
  workTime: any;
  setPopOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Edit({ role, userId, userData, workTime, setPopOpen }: TEdit) {
  const [open, setOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedHours, setSelectedHours] = useState<THour[]>([]);
  const [error, setError] = useState<string | null>(null);

  const initializeWorkTime = (workTime: any) => {
    const uniqueDays: string[] = Array.from(new Set(workTime.map((entry: { day: string }) => entry.day)));
    setSelectedDays(uniqueDays);

    const hours = workTime.map((entry: { day: string; workHour: TWorkHour }) => ({
      day: entry.day,
      value: {
        from: entry.workHour.from,
        to: entry.workHour.to
      },
    }));
    setSelectedHours(hours);
  };

  const getDefaultValues = (userData: TEditSchema) => ({
    username: userData.username || "",
    firstname: userData.firstname || "",
    lastname: userData.lastname || "",
    email: userData.email || "",
    phone: userData.phone || "",
    nationalId: userData.nationalId || "",
    dob: new Date(userData.dob) || new Date(),
    gender: userData.gender || "",
    fee: userData.fee || "",
    specialty: userData.specialty || "",
    department: userData.department || "",
  });


  useEffect(() => {
    if (workTime) {
      initializeWorkTime(workTime);
    }
  }, [userData]);

  const accountForm = useForm<TEditSchema>({
    resolver: zodResolver(editSchema),
    defaultValues: getDefaultValues(userData),
  });

  const passwordForm = useForm<TPasswordSchema>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });


  const onEditAccount = async (data: TIndex<string> & TEditSchema) => {
    const { changedFields, unChangedFields } = compareFields(data, userData, ['role', 'id', 'workTime', 'table']);

    unChangedFields.forEach(field => delete data[field]);

    normalizeDataFields(data);

    if (role === 'doctor') {
      if (!validateDoctorFields()) return;
      if (!detectChanges(changedFields)) return;
    } else {
      if (changedFields.length === 0) {
        setError("No changes detected");
        return;
      }
    }

    await handleEdit(data);
  };

  const validateDoctorFields = () => {
    if (!selectedDays.length || !selectedHours.length) {
      accountForm.setError('days', { type: 'custom', message: 'Please select days and hours' });
      return false;
    }

    const daysWithHours = new Set(selectedHours.map(hour => hour.day));
    const allDaysHaveHours = selectedDays.every(day => daysWithHours.has(day));

    if (!allDaysHaveHours) {
      accountForm.setError('days', { type: 'custom', message: "Each selected day must have at least one time range." });
      return false;
    }

    setError(null);
    return true;
  };

  const detectChanges = (changedFields: string[]) => {
    const originalDays = Array.from(new Set(workTime.map((entry: { day: string }) => entry.day)));
    const originalHours: THour[] = workTime.map((entry: { day: string; workHour: TWorkHour }) => ({
      day: entry.day,
      value: {
        from: entry.workHour.from,
        to: entry.workHour.to
      },
    }));

    const daysChanged = selectedDays.length !== originalDays.length || !selectedDays.every(day => originalDays.includes(day));
    const hoursChanged = selectedHours.length !== originalHours.length || !selectedHours.every(hour =>
      originalHours.some((originalHour: THour) => originalHour.day === hour.day && originalHour.value.to === hour.value.to && originalHour.value.from === hour.value.from)
    );

    if (changedFields.length === 0 && !daysChanged && !hoursChanged) {
      setError("No changes detected");
      return false;
    }

    return true;
  };

  const handleEdit = async (data: TEditSchema) => {
    const result = role === 'doctor'
      ? await edit({ data, role, userId, operation: 'edit', selectedDays, selectedHours })
      : await edit({ data, role, userId, operation: 'edit' });

    if (result?.success) {
      resetForms();
    } else if (result?.error) {
      handleError(accountForm, result.error);
    }
  };

  const resetForms = () => {
    accountForm.reset();
    passwordForm.reset();
    setSelectedDays([]);
    setSelectedHours([]);
    setOpen(false);
    setPopOpen(false);
  };

  const onEditPassword = async (data: TPasswordSchema) => {
    const result = await editPassword(data, userId);
    if (result?.success) {
      resetForms();
    }
  }

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full capitalize">Edit {role}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="capitalize">Edit {role}</DialogTitle>
            <DialogDescription>
              Anyone who has this link will be able to view this.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger className="w-full" value="account">Account</TabsTrigger>
              <TabsTrigger className="w-full" value="password">Password</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <RolesOperationsForm
                role={role}
                form={accountForm}
                onSubmit={onEditAccount}
                daysList={daysList}
                selectedDays={selectedDays}
                setSelectedDays={setSelectedDays}
                selectedHours={selectedHours}
                setSelectedHours={setSelectedHours}
                error={error}
                operation="edit"
              />
            </TabsContent>
            <TabsContent value="password">
              <ManagePassword
                form={passwordForm}
                onSubmit={onEditPassword}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
