import { Input } from "@/components/ui/Input";
import {
  FormControl,
  FormField as CFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Check, ChevronsUpDown } from "lucide-react"
import { Control, useController } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/Command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover"
import { toast } from "@/components/ui/useToast"
import { Switch } from "@/components/ui/Switch";
import { Dispatch, SetStateAction } from "react";
import { Textarea } from "@/components/ui/Textarea";
import { Rating } from "react-simple-star-rating";


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
  doctors?: any,
  setState?: any,
  isTextarea?: boolean,
  placeholder?: string,
  rating?: boolean,
  handleRating?: (rate: number) => void
}

const specialties = [
  { label: "All Specialties", value: "all" },
  { label: "General Surgery", value: "general_surgery" },
  { label: "Podo", value: "podo" },
  { label: "Orthopedics", value: "orthopedics" },
]


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
  doctors,
  setState,
  isTextarea,
  placeholder,
  rating,
  handleRating
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
        render={({ field: { onChange } }) => (
          <FormItem
            className="w-full"
          >
            {type != 'hidden' && !isTextarea && !select && !switchValue && !rating && (
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
                  />
                </FormControl>
                <FormMessage>{fieldError?.message}</FormMessage>
              </>
            )}
            {type != 'hidden' && isTextarea && (
              <>
                <FormLabel>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={placeholder ? placeholder : name.charAt(0).toUpperCase() + name.slice(1)}
                    className="resize-none"
                    {...field}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage>{fieldError?.message}</FormMessage>
              </>
            )}
            {select == 'gender' && (
              <>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
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
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-[200px] justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? specialties.find(
                            (specialty) => specialty.value === field.value
                          )?.label
                          : "Select specialty"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search specialty..." />
                      <CommandEmpty>No specialty found.</CommandEmpty>
                      <CommandGroup>
                        {specialties.map((specialty) => (
                          <CommandItem
                            value={specialty.value}
                            key={specialty.value}
                            onSelect={() => {
                              if (setState) {
                                setState(specialty.value)
                              }
                              form?.setValue("specialty", specialty.value)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                specialty.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {specialty.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage>{fieldError?.message}</FormMessage>
              </>
            )}
            {select == 'doctors' && (

              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-[200px] justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? doctors?.find(

                            (doctor: any) => doctor?.value === field.value
                          )?.label
                          : "Select doctor"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search doctor..." />
                      <CommandEmpty>No doctor found.</CommandEmpty>
                      <CommandGroup>
                        {doctors?.map((doctor: any) => {
                          return (
                            <CommandItem
                              value={doctor.value}
                              key={doctor.value}
                              onSelect={() => {
                                form?.setValue("doctor", doctor.value)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  doctor.value === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {doctor.label}
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage>{fieldError?.message}</FormMessage>
              </>
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
            {rating == true && (
              <div className="flex flex-row justify-center">
                <Rating
                  onClick={onChange}
                  SVGclassName='inline-block'
                  allowFraction
                  transition
                />
                <FormMessage>{fieldError?.message}</FormMessage>
              </div>
            )}
          </FormItem>
        )}
      />
      {error && <FormMessage>{error}</FormMessage>}
    </>
  );
}
