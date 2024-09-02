'use client'

import CheckCredential from "@/app/_components/CheckCredential"
import ManageReceipts from "@/app/_components/receipt/Manage"
import ExistingUser from "@/app/dashboard/_components/receptionist/ExistingUser"
import NewUser from "@/app/dashboard/_components/receptionist/NewUser"
import { InsertedCredential } from "@/types/index.types"
import { useState } from "react"

export default function ReceiptsPage() {
    const [creditExists, setCreditExists] = useState<boolean | null>(null)
    const [credential, setCredential] = useState<InsertedCredential | null>(null)

    return (
        <div className="flex flex-col items-center justify-center">
            {!credential ? (
                <CheckCredential setCreditExists={setCreditExists} setCredential={setCredential} />
            ) : (
                <>
                    {!creditExists ? (
                        <NewUser credential={credential} />
                    ) : (
                        <>
                            <ExistingUser credential={credential} />
                        </>
                    )}
                </>
            )}
        </div>
    )
}