import { DataTable } from "@/components/ui/table/DataTable";
import db from "@/lib/db";
import { useGetUser } from "@/hooks/useGetUser";
import { ReceiptTableColumns } from "./columns";

async function getData() {
    const user = await useGetUser();

    const recepits = await db.query.receiptTable.findMany({
        with: {
            appointment: true,
            receptionist: {
                with: {
                    user: true
                }
            },
            doctor: {
                with: {
                    user: true
                }
            },
            user: true            
        }
    })

    const mergedReceipts = recepits.map((recepit) => {
        const mergedReceipt = {
            id: recepit?.id,
            doctor: recepit.doctor.user.firstname + " " + recepit.doctor.user.lastname,
            patient: recepit.user.firstname + " " + recepit.user.lastname,
            receptionist: recepit.receptionist.user.firstname + " " + recepit.receptionist.user.lastname,
            service: recepit.service.replace("_", ' '),
            amount: recepit.amount,
            date: recepit.date.toLocaleString(),
            type: recepit.type,
        };
        return mergedReceipt;
    });

    return mergedReceipts;
}

export default async function ManageReceipts() {
    const data = await getData()

    return (
        <div>
            <DataTable
                columns={ReceiptTableColumns}
                data={data}
                search="patient"
            />
        </div>
    )
}