import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default function Prescriptions({ reservation, prescriptions }: { reservation: any, prescriptions: any }) {
    console.log(prescriptions)
    return (
        <Tabs defaultValue="laboratory" className="w-[100%]">
            <TabsList className="w-[100%]">
                <TabsTrigger value="laboratory" className="w-[100%]">Laboratory</TabsTrigger>
                <TabsTrigger value="radiology" className="w-[100%]">Radiology</TabsTrigger>
                <TabsTrigger value="medicine" className="w-[100%]">Medicine</TabsTrigger>
            </TabsList>
            <TabsContent value="laboratory">
                {prescriptions.laboratory ? (
                    <div className="flex flex-row flex-wrap justify-center gap-3 pt-10">
                        {prescriptions.laboratory.split(',').map((item: string) => <p className="text-5xl text-red-500 text-center">{item}</p>)}
                    </div>
                ) : (
                    <p className="text-5xl text-red-500 text-center">No prescribed laboratory</p>
                )}
            </TabsContent>
            <TabsContent value="radiology">
                {prescriptions.radiology ? (
                    <div className="flex flex-row flex-wrap justify-center gap-3 pt-10">
                        {prescriptions.radiology.split(',').map((item: string) => <p className="text-5xl text-red-500 text-center">{item}</p>)}
                    </div>
                ) : (
                    <p className="text-5xl text-red-500 text-center">No prescribed radiology</p>
                )}
            </TabsContent>
            <TabsContent value="medicine">
                {prescriptions.medicine ? (
                    <div className="flex flex-row flex-wrap justify-center gap-3 pt-10">
                        {prescriptions.medicine.split(',').map((item: string) => <p className="text-5xl text-red-500 text-center">{item}</p>)}
                    </div>
                ) : (
                    <p className="text-5xl text-red-500 text-center pt-10">No prescribed medicine</p>
                )}
            </TabsContent>
        </Tabs>
    )
}