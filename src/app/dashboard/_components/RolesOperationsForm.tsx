import { TAddSchema, TEditSchema } from "@/types/operations.types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import FormField from "@/components/ui/custom/FormField";
import Hours from "@/components/ui/custom/Hours";
import { DialogFooter } from "@/components/ui/Dialog";
import { Form, FormMessage, FormField as CFormField, FormItem, FormLabel, FormControl } from "@/components/ui/Form";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { InsertedCredential, THour, UserRoles } from "@/types/index.types";
import { Dispatch, SetStateAction } from "react";
import { UseFormReturn } from "react-hook-form";
import { specialties, uniqueColumns } from "@/constants";
import { generatePassword } from "@/lib/funcs";


type TRolesOperationsForm = {
  role: UserRoles,
  operation: 'add' | 'edit',
  form: UseFormReturn<TAddSchema | TEditSchema | any>,
  onSubmit: (data: TEditSchema | TAddSchema | any) => void;
  daysList?: { value: string; label: string; }[],
  selectedDays?: string[],
  setSelectedDays?: Dispatch<SetStateAction<string[]>>;
  selectedHours?: THour[],
  setSelectedHours?: Dispatch<SetStateAction<THour[]>>;
  pwd?: boolean;
  credential?: InsertedCredential;
  error?: string | null;
}

export default function RolesOperationsForm({
  role,
  operation,
  form,
  onSubmit,
  daysList,
  setSelectedDays,
  selectedDays,
  selectedHours,
  setSelectedHours,
  pwd,
  credential,
  error,
}: TRolesOperationsForm) {
  const generatedPwd = generatePassword()

  const renderUniqueFormFields = () => {
    const chunkedColumns = [];

    for (let i = 0; i < uniqueColumns.length; i += 2) {
      chunkedColumns.push(uniqueColumns.slice(i, i + 2));
    }

    return chunkedColumns.map((columnsChunk, index) => (
      <div key={index} className="flex flex-row gap-10">
        {columnsChunk.map((column) => (
          credential?.column === column ? (
            <FormField
              key={column}
              form={form}
              name={column}
              disabled={true}
              defaultValue={credential.credential}
            />
          ) : (
            <FormField key={column} form={form} name={column} />
          )
        ))}
      </div>
    ));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField form={form} name="role" type="hidden" defaultValue={role} />
        <div className="flex flex-row gap-10">
          <FormField form={form} name="firstname" />
          <FormField form={form} name="lastname" />
        </div>
        {renderUniqueFormFields()}
        <div className="flex flex-row gap-10">
          <FormField form={form} name="dob" />
          <FormField form={form} name="gender" select='gender' />
        </div>
        {role == 'receptionist' && (
          <div className="mt-2">
            <FormField form={form} name="department" select='receptionistDepartment' />
          </div>
        )}
        {operation == 'add' && (
          <div className="flex flex-row gap-10">
            <FormField form={form} name="password" defaultValue={!pwd ? generatedPwd : ''} type={!pwd ? 'hidden' : ''} />
            <FormField form={form} name="confirmPassword" defaultValue={!pwd ? generatedPwd : ''} type={!pwd ? 'hidden' : ''} />
          </div>
        )}
        {role == 'doctor' && (
          <FormField form={form} name="fee" />
        )}
        {role == 'doctor' && daysList && setSelectedDays && selectedDays && selectedHours && setSelectedHours && (
          <>
            <div className="mt-2">
              <FormField form={form} name="specialty" select='specialty' />
            </div>
            <div className="pt-4">
              <CFormField
                control={form.control}
                name='days'
                render={({ field: { onChange, value } }) => (
                  <FormItem>
                    <FormLabel className="capitalize">Work Days</FormLabel>
                    <FormControl>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>
            <div className="flex flex-row flex-wrap gap-2 pt-4">
              {selectedDays && selectedHours && setSelectedHours &&
                selectedDays.map((day) => {
                  return (
                    <Popover key={day}>
                      <PopoverTrigger><Badge className="cursor-pointer">{day}</Badge></PopoverTrigger>
                      <PopoverContent>
                        <Hours
                          selectedHours={selectedHours}
                          setSelectedHours={setSelectedHours}
                          day={day}
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
          <Button type="submit" className="w-full">Save changes</Button>
        </DialogFooter>
      </form>
    </Form >
  )
}