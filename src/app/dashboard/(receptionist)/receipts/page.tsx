import CheckCredential from "@/app/_components/CheckCredential"
import CreateReceipt from "@/app/_components/receipt/Create"
import ManageReceipts from "@/app/_components/receipt/Manage"
import ExistingUser from "@/app/dashboard/_components/receptionist/ExistingUser"
import NewUser from "@/app/dashboard/_components/receptionist/NewUser"
import { InsertedCredential } from "@/types/index.types"
import { useState } from "react"

export default function ReceiptsPage() {
    return (
        <div>
            <CreateReceipt />
            <ManageReceipts />
        </div>
    )
}