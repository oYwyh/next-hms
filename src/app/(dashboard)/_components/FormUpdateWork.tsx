'use client'

import { Button } from "@/components/ui/button";
import { Form, FormMessage } from "@/components/ui/form";
import FormField from "@/components/ui/custom/FormField";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { TupdateWorkSchema, updateWorkSchema } from "../types";
import { updateWork } from "../_actions/profile.action";
import { useState } from "react";
import toast from "react-hot-toast";
import { MultiSelect } from "@/components/ui/multi-select";
import { Cat, Dog, Fish, Rabbit, Turtle } from "lucide-react";
import { Label } from "@radix-ui/react-label";




type FormUpdateWorkTypes = {
  id: string;
  doctorId: number;
  specialty: string;
}

export default function FormUpdateWork({ id, specialty, doctorId }: FormUpdateWorkTypes) {
  const [error, setError] = useState<string>()
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const form = useForm<TupdateWorkSchema>({
    resolver: zodResolver(updateWorkSchema),
    defaultValues: {
      id,
      specialty,
      doctorId
    },
  });

  const onSubmit = async (data: TupdateWorkSchema) => {
    
    
    if(selectedDays.length === 0) {
      setError("Please select at least one day")
    }else {
      const result = await updateWork(data, selectedDays);

      setError('')
      // if(result?.error) {
      //   setError(result?.error)
      // }else {
      //   toast.success('Work Data Updated')
      // }
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="pt-5 pb-5 flex flex-col gap-2">
          <FormField form={form} name="id" type={'hidden'} />
          <FormField form={form} name="doctorId" type={'hidden'} />
          <FormField form={form} name="specialty" />
          <Label>Work Days</Label>
          <MultiSelect
            options={frameworksList}
            onValueChange={setSelectedDays}
            defaultValue={selectedDays}
            placeholder="Select frameworks"
            variant="inverted"
            animation={2}
            maxCount={3}
          />
          {/* {/* <FormField form={form} name="workHours" /> */}
          <Button type="submit">Update</Button>
          <FormMessage>{error}</FormMessage>
        </form>
      </Form>
    </>
  );
}