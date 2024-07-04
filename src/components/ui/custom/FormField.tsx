import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField as CFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useController, Control } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "../button";
import { MutableRefObject, useRef } from "react";

interface FormFieldProps {
  form: {
    control: Control<any>;
  };
  name: string;
  error?: string;
  defaultValue?: string;
  disabled?: boolean;
  type?: string;
  select?: string;
  switch?: string;
  onSwitchChange?: (checked: boolean) => void;
}

export default function FormField({
  form,
  name,
  error,
  defaultValue,
  disabled,
  type,
  select,
  switch: switchValue,
  onSwitchChange,
}: FormFieldProps) {
  const {
    field,
    fieldState: { error: fieldError },
  } = useController({
    name,
    control: form.control,
    defaultValue,
  });

  return (
    <>
      <CFormField
        control={form.control}
        name={name}
        render={() => (
          <FormItem>
            {type != 'hidden' && !select && !switchValue && (
              <>
                <FormLabel>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={name.charAt(0).toUpperCase() + name.slice(1)}
                    {...field}
                    disabled={disabled}
                    type={type}
                  // value={value}
                  />
                </FormControl>
                <FormMessage>{fieldError?.message}</FormMessage>
              </>
            )}
            {select == 'gender' && (
              <>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage>{fieldError?.message}</FormMessage>
              </>
            )}
            {select == 'specialty' && (
              <div className={'pt-3'}>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="w-[100%]">
                    <SelectValue placeholder="Select a specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Surgery </SelectLabel>
                      <SelectItem value="general_surgery">General Surgery</SelectItem>
                      <SelectItem value="vascoular_surgery">Vascoular Surgery</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Dental</SelectLabel>
                      <SelectItem value="orthodonticts">Orthodonticts</SelectItem>
                      <SelectItem value="podo">Podo</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage>{fieldError?.message}</FormMessage>
              </div>
            )}
            {switchValue == 'super' && (
              <Switch
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  if (onSwitchChange) {
                    onSwitchChange(checked);
                  }
                }}
                aria-readonly
              />
            )}
          </FormItem>
        )}
      />
      {error && <FormMessage>{error}</FormMessage>}
    </>
  );
}
