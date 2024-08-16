'use server'

import db from "@/lib/db"
import { receiptTable } from "@/lib/db/schema"
import { TDepartments, TReceipt, TReceiptTypes } from "@/types/index.types"
import { TCreateSchema } from "@/types/receipt.types"


export async function createReceipt(data: Partial<TReceipt>) {
    const {
        service,
        amount,
        userId,
        doctorId,
        appointmentId,
        receptionistId,
        type,
    } = data

    const date = new Date()

    /*
        console.log(data)
        {
            service: 'general_surgery',
            amount: '500',
            userId: 'mdvpp3df53qdirq3',
            doctorId: 1,
            appointmentId: 6,
            receptionistId: 'sowbh25nkbpouqxw',
            date: '2024-08-12',
            type: 'cash'
        }
    */

    // Ensure all required fields are present
    if (!service || !amount || !userId || !doctorId || !appointmentId || !receptionistId || !type) {
        throw new Error("Missing required fields to create a receipt");
    }

    const [receipt] = await db.insert(receiptTable).values({
        service,
        amount,
        userId,
        doctorId,
        appointmentId,
        receptionistId,
        date: date,
        type,
    }).returning();

    return receipt; // Return the inserted receipt if needed
}