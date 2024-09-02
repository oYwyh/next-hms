import Receipt from "@/app/_components/Receipt"
import { TReceipt } from "@/types/index.types"

export default function ReceiptsPage({ params: { id } }: { params: { id: TReceipt['id'] } }) {
    return (
        <Receipt key={id} />
    )
}