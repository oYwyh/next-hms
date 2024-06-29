import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField as CFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useController, Control } from "react-hook-form";

interface FormFieldProps {
  form: {
    control: Control<any>;
  };
  name: string;
  error?: string;
  defaultValue?: string;
  disabled?: boolean;
  type?: string;
  value?: string;
}

export default function FormField({
  form,
  name,
  error,
  defaultValue,
  disabled,
  type,
  value,
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
            {type != 'hidden' && (
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
          </FormItem>
        )}
      />
      {error && <FormMessage>{error}</FormMessage>}
    </>
  );
}
