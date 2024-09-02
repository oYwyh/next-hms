'use client'

import CurrencyInput from 'react-currency-input-field';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/DropdownMenu";
import { useState, ChangeEvent, useEffect, Dispatch, SetStateAction, useContext } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { useQuery } from "@tanstack/react-query";
import { debounce } from "lodash";
import { handleRequiredFields, normalizeDataFields } from "@/lib/funcs";
import { DataTable } from "@/components/ui/table/DataTable";
import { UserTableColumns } from "@/app/dashboard/_components/receptionist/columns";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table"
import { TReceptionist, TUser } from "@/types/index.types";
import Actions from "@/app/_components/receipt/Actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/Button";
import { MoreHorizontal } from "lucide-react";
import { Form } from "@/components/ui/Form";
import FormField from "@/components/ui/custom/FormField";
import { useForm } from "react-hook-form";
import { createSchema, TCreateSchema } from "@/types/receipt.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { createReceipt } from '@/actions/receipt.actions';
import { useRouter } from 'next/navigation';
import { ReservationContext } from '@/context/reservation.context';



function UserSelection({ setSelectedUserId }: { setSelectedUserId: Dispatch<SetStateAction<TUser['id'] | null>> }) {

    const [searchQuery, setSearchQuery] = useState("");

    // Debounced search function
    const debouncedSearchQuery = debounce((query: string) => {
        setSearchQuery(query);
    }, 1000);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        normalizeDataFields(e.target);
        debouncedSearchQuery(e.target.value);
    };

    // Fetching data using React Query
    const { data: users, isLoading, isError } = useQuery({
        queryKey: ["user", searchQuery],
        queryFn: async () => {
            if (!searchQuery) return []; // Skip querying if the input is empty
            const response = await fetch(`/api/users/${searchQuery}`);
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        },
        enabled: !!searchQuery,
    });


    return (
        <div>
            <div className="pt-2">
                <Input
                    placeholder="Search Patient By Any Field"
                    onChange={handleChange}
                />
            </div>
            {isLoading && <p>Loading...</p>}
            {isError && <p>Error loading data</p>}
            <div>
                {users?.length > 0 ? (
                    <ScrollArea className="mt-3 max-h-[500px]">
                        <Table>
                            <TableCaption>List of matched patients</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fullname</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone Number</TableHead>
                                    <TableHead>National Id</TableHead>
                                    <TableHead>Date Of Birth</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users?.map((user: TUser) => (
                                    <TableRow>
                                        <TableCell className="capitalize">{user.firstname} {user.lastname}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.phone}</TableCell>
                                        <TableCell>{user.nationalId}</TableCell>
                                        <TableCell>{user.dob}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <div className="flex flex-col gap-2">
                                                        <Button variant={'outline'} onClick={() => setSelectedUserId(user.id)}>Take Receipt</Button>
                                                    </div>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                ) : (
                    !isLoading && (
                        <>
                            <Table>
                                <TableCaption>List of matched patients</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fullname</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone Number</TableHead>
                                        <TableHead>National Id</TableHead>
                                        <TableHead>Date Of Birth</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </>
                    )
                )}
            </div>
        </div>
    )
}

function TakeReceipt({ receptionistId, userId }: { receptionistId: TReceptionist['id'], userId: TUser['id'] }) {
    const router = useRouter();

    const [amount, setAmount] = useState<string>('')

    const form = useForm<TCreateSchema>({
        resolver: zodResolver(createSchema),
    })

    const onSubmit = async (data: TCreateSchema) => {
        if (!amount) {
            handleRequiredFields({ form, fields: ['amount'] })
            return;
        }
        data['amount'] = amount
        data['userId'] = userId
        data['receptionistId'] = receptionistId

        const receipt = await createReceipt(data)

        if(receipt) {
            router.push(`/dashboard/receipts/${receipt.id}`)
        }
        
    }

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField form={form} name="service" />
                    <FormField form={form} name="amount" currency label='Amount' setState={setAmount} />
                    <FormField form={form} name='type' select='receiptType' label="Receipt Type" />
                    <Button>Submit</Button>
                </form>
            </Form>
        </div>
    )
}

export default function CreateReceipt() {
    const [open, setOpen] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState<TUser['id'] | null>(null)

    const { data: receptionist, isLoading } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await fetch('/api/user/info');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        },
    })

    if (isLoading) return;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
                border border-input bg-background hover:bg-accent hover:text-accent-foreground p-2"
            >
                Create Receipt
            </DialogTrigger>
            <DialogContent className="w-[80%] max-w-screen flex flex-col">
                <DialogHeader>
                    <DialogTitle>Take Receipt</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                    </DialogDescription>
                    {selectedUserId ? (
                        <>
                            <TakeReceipt receptionistId={receptionist.id} userId={selectedUserId} />
                        </>
                    ) : (
                        <UserSelection setSelectedUserId={setSelectedUserId} />
                    )}
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
