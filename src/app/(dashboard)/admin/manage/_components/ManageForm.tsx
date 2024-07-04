import { Button } from "@/components/ui/button"
import FormField from "@/components/ui/custom/FormField"
import Hours from "@/components/ui/custom/Hours"
import { Form, FormItem, FormMessage } from "@/components/ui/form"
import { MultiSelect } from "@/components/ui/multi-select"
import { TbaseSchema } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"


import { Dispatch, SetStateAction } from "react"
import { UseFormReturn } from "react-hook-form"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

type ManageFormTypes = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  role: 'admin' | 'user' | 'doctor',
  operation: 'add' | 'edit',
  form: UseFormReturn<{}>,
  onSubmit: (data: TbaseSchema) => Promise<void>;
  daysList: { value: string; label: string; }[],
  selectedDays: string[],
  setSelectedDays: Dispatch<SetStateAction<string[]>>;
  selectedHours: { day: string; value: string }[],
  setSelectedHours: Dispatch<SetStateAction<{ day: string; value: string }[]>>;
  hoursList: { day: string; value: string }[],
  error: string | null;
}

export default function ManageForm({
  open,
  setOpen,
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
}: ManageFormTypes) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className='capitalize'>{operation} {role}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className='capitalize'>{operation} {role}</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view this.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
              <div className="flex flex-row gap-10">
                <FormField form={form} name="password" />
                <FormField form={form} name="confirmPassword" />
              </div>
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
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}