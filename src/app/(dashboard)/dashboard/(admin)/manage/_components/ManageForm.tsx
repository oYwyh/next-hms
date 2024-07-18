import { TaddSchema, TeditSchema } from "@/app/(dashboard)/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import FormField from "@/components/ui/custom/FormField";
import Hours from "@/components/ui/custom/Hours";
import { DialogFooter } from "@/components/ui/Dialog";
import { Form, FormMessage } from "@/components/ui/Form";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { UserRoles } from "@/lib/types";
import { Dispatch, SetStateAction } from "react";
import { UseFormReturn } from "react-hook-form";


type TManageForm = {
  role: UserRoles,
  operation: 'add' | 'edit',
  form: UseFormReturn<TaddSchema | TeditSchema | any>,
  onSubmit: (data: TeditSchema | TaddSchema | any) => void;
  daysList: { value: string; label: string; }[],
  selectedDays: string[],
  setSelectedDays: Dispatch<SetStateAction<string[]>>;
  selectedHours: { day: string; value: string }[],
  setSelectedHours: Dispatch<SetStateAction<{ day: string; value: string }[]>>;
  hoursList: { day: string; value: string }[],
  error: string | null;
}

export default function ManageForm({
  role,
  operation,
  form,
  onSubmit,
  daysList,
  setSelectedDays,
  selectedDays,
  selectedHours,
  setSelectedHours,
  hoursList,
  error,
}: TManageForm) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField form={form} name="role" type="hidden" defaultValue={role} />
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
          <FormField form={form} name="gender" select='gender' />
        </div>
        {operation == 'add' && (
          <div className="flex flex-row gap-10">
            <FormField form={form} name="password" />
            <FormField form={form} name="confirmPassword" />
          </div>
        )}
        {role == 'doctor' && (
          <>
            <FormField form={form} name="specialty" select='specialty' />
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
          </>
        )}
        {error && <FormMessage>{error}</FormMessage>}
        <DialogFooter className="pt-4">
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </form>
    </Form >
  )
}