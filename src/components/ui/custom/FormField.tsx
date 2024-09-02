import { Input } from "@/components/ui/Input";
import {
  FormControl,
  FormField as CFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { Control, useController } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/Command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { toast } from "@/components/ui/useToast";
import { Switch } from "@/components/ui/Switch";
import { Dispatch, SetStateAction } from "react";
import { Textarea } from "@/components/ui/Textarea";
import { Rating } from "react-simple-star-rating";
import { departments, receiptTypes, specialties as specialtyOpts } from "@/constants";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import CurrencyInput from "react-currency-input-field";

interface FormFieldProps {
  form: {
    control: Control<any>;
  };
  name: string;
  label?: string;
  error?: string;
  defaultValue?: string | number;
  disabled?: boolean;
  type?: string;
  select?: string;
  switch?: string;
  onSwitchChange?: (checked: boolean) => void;
  doctors?: any;
  specialties?: {
    label: string;
    value: string;
  }[];
  setState?: any;
  isTextarea?: boolean;
  placeholder?: string;
  rating?: boolean;
  currency?: boolean;
}

export default function FormField({
  form,
  name,
  label,
  error,
  defaultValue = "",
  disabled,
  type,
  select,
  switch: switchValue,
  onSwitchChange,
  doctors,
  specialties = specialtyOpts,
  setState,
  isTextarea,
  placeholder,
  rating,
  currency,
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
        render={({ field: { onChange, value = "" } }) => (
          <FormItem className="w-full">
            {!isTextarea && !select && !switchValue && !rating && name != 'dob' && !currency && (
              <>
                {type != 'hidden' && label != '' && (
                  <FormLabel className="capitalize">{label ? label : name}</FormLabel>
                )}
                <FormControl>
                  <Input
                    placeholder={label ? label : name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    type={type}
                  />
                </FormControl>
                <FormMessage>{fieldError?.message}</FormMessage>
              </>
            )}
            {isTextarea && (
              <>
                {type != 'hidden' && label != '' && (
                  <FormLabel className="capitalize">{label ? label : name}</FormLabel>
                )}
                <FormControl>
                  <Textarea
                    placeholder={placeholder ? placeholder : name}
                    value={value}
                    onChange={onChange}
                    className="capitalize resize-none"
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage>{fieldError?.message}</FormMessage>
              </>
            )}
            {name == 'dob' && (
              <div className="flex flex-col gap-2 py-2">
                {type != 'hidden' && label != '' && (
                  <FormLabel className="capitalize">{label ? label : name}</FormLabel>
                )}
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          disabled={disabled}
                          variant={"outline"}
                          className={`${disabled && "cursor-not-allowed"}`}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="w-4 h-4 ml-auto opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        fromYear={1900}
                        toYear={2030}
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage>{fieldError?.message}</FormMessage>
              </div>
            )}
            {select == "gender" && (
              <>
                <FormLabel>Gender</FormLabel>
                <Select
                  onValueChange={onChange}
                  defaultValue={value}
                  disabled={disabled}
                >
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
            {select == "specialty" && (
              <div className="flex flex-col gap-2">
                {label != '' && (
                  <FormLabel className="capitalize">{label ? label : name}</FormLabel>
                )}
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn("w-[200px] justify-between", !value && "text-muted-foreground")}
                      >
                        {value
                          ? specialties.find((specialty) => specialty.value === value)?.label
                          : "Select specialty"}
                        <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
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
                                specialty.value === value ? "opacity-100" : "opacity-0"
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
              </div>
            )}
            {select == "department" && (
              <div className="flex flex-col gap-2">
                {label != '' && (
                  <FormLabel className="capitalize">{label ? label : name}</FormLabel>
                )}
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn("w-full justify-between", !value && "text-muted-foreground")}
                      >
                        {value
                          ? departments.find((department) => department.value === value)?.label
                          : "Select Department"}
                        <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search Departments..." />
                      <CommandEmpty>No department found.</CommandEmpty>
                      <CommandGroup>
                        {departments.map((department) => (
                          <CommandItem
                            value={department.value}
                            key={department.value}
                            onSelect={onChange}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                department.value === value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {department.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage>{fieldError?.message}</FormMessage>
              </div>
            )}
            {select == "doctors" && (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn("w-[200px] justify-between", !value && "text-muted-foreground")}
                      >
                        {value
                          ? doctors?.find((doctor: any) => doctor?.value === value)?.label
                          : "Select doctor"}
                        <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search doctor..." />
                      <CommandEmpty>No doctor found.</CommandEmpty>
                      <CommandGroup>
                        {doctors?.map((doctor: any) => (
                          <CommandItem
                            value={doctor.value}
                            key={doctor.value}
                            onSelect={onChange}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                doctor.value === value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {doctor.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage>{fieldError?.message}</FormMessage>
              </>
            )}
            {switchValue == "super" && (
              <Switch
                checked={value}
                onCheckedChange={(checked) => {
                  onChange(checked);
                  if (onSwitchChange) {
                    onSwitchChange(checked);
                  }
                }}
                aria-readonly
              />
            )}
            {rating && (
              <div className="flex flex-row justify-center">
                <Rating
                  onClick={onChange}
                  SVGclassName="inline-block"
                  allowFraction
                  transition
                />
                <FormMessage>{fieldError?.message}</FormMessage>
              </div>
            )}
            {select == "receiptType" && (
              <div className="flex flex-col gap-2">
                {label != '' && (
                  <FormLabel className="capitalize">{label ? label : name}</FormLabel>
                )}
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn("w-full justify-between", !value && "text-muted-foreground")}
                      >
                        {value
                          ? receiptTypes.find((type) => type.value === value)?.label
                          : "Select Type"}
                        <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search Types..." />
                      <CommandEmpty>No type found.</CommandEmpty>
                      <CommandGroup>
                        {receiptTypes.map((type) => (
                          <CommandItem
                            value={type.value}
                            key={type.value}
                            onSelect={onChange}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                type.value === value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {type.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage>{fieldError?.message}</FormMessage>
              </div>
            )}
            {currency && setState && (
              <div className="flex flex-col gap-2">
                {label != '' && (
                  <FormLabel className="capitalize">{label ? label : name}</FormLabel>
                )}
                <CurrencyInput
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  id="input-example"
                  name="input-name"
                  placeholder="Amount"
                  decimalsLimit={2}
                  onValueChange={(value) => setState(value)}
                />
                <FormMessage>{fieldError?.message}</FormMessage>
              </div>
            )}
          </FormItem>
        )
        }
      />
      {error && <FormMessage>{error}</FormMessage>}
    </>
  );
}