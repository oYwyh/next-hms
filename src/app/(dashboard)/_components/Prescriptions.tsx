'use client'

import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Printer, RefreshCw, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image"
import { useRef } from "react";
import { PhotoProvider, PhotoView } from "react-photo-view"
import 'react-photo-view/dist/react-photo-view.css';
import { useReactToPrint } from 'react-to-print';

export default function Prescriptions({ reservation, prescriptions }: { reservation: any, prescriptions: any }) {
    const imageRef = useRef<HTMLImageElement | null>(null);

    const handlePrint = useReactToPrint({
        content: () => imageRef.current,
    });

    return (
        <Tabs defaultValue="laboratory" className="w-[100%]">
            <TabsList className="w-[100%]">
                <TabsTrigger value="laboratory" className="w-[100%]">Laboratory</TabsTrigger>
                <TabsTrigger value="radiology" className="w-[100%]">Radiology</TabsTrigger>
                <TabsTrigger value="medicine" className="w-[100%]">Medicine</TabsTrigger>
            </TabsList>
            <TabsContent value="laboratory">
                {prescriptions.laboratory ? (
                    <div className="flex flex-col items-center justify-center gap-3 pt-10">
                        <div className="flex flex-col gap-2">
                            <PhotoProvider
                                toolbarRender={({ onScale, scale, onRotate, rotate, index, visible }) => {
                                    return (
                                        <div className="flex flex-row gap-5">
                                            <Printer className="cursor-pointer" onClick={handlePrint} />
                                            <ZoomIn className="cursor-pointer" onClick={() => onScale(scale + 1)} />
                                            <ZoomOut className="cursor-pointer" onClick={() => onScale(scale - 1)} />
                                            <RefreshCw className="cursor-pointer" onClick={() => onRotate(rotate + 90)} />
                                        </div>
                                    );
                                }}
                            >
                                <PhotoView src={`${process.env.NEXT_PUBLIC_R2_FILES_URL}/${prescriptions.laboratory}`}>
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_R2_FILES_URL}/${prescriptions.laboratory}`}
                                        ref={imageRef}
                                        alt="Prescription"
                                        className="cursor-zoom-in"
                                        width={1000}
                                        height={1000}
                                    />
                                </PhotoView>
                            </PhotoProvider>
                            <Button className="w-[100%] text-xl" onClick={handlePrint}>Print this out!</Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-5xl text-red-500 text-center">No prescribed laboratory</p>
                )}
            </TabsContent>
            <TabsContent value="radiology">
                {prescriptions.radiology ? (
                    <div className="flex flex-col items-center justify-center gap-3 pt-10">
                        <div className="flex flex-col gap-2">
                            <PhotoProvider
                                toolbarRender={({ onScale, scale, onRotate, rotate, index, visible }) => {
                                    return (
                                        <div className="flex flex-row gap-5">
                                            <Printer className="cursor-pointer" onClick={handlePrint} />
                                            <ZoomIn className="cursor-pointer" onClick={() => onScale(scale + 1)} />
                                            <ZoomOut className="cursor-pointer" onClick={() => onScale(scale - 1)} />
                                            <RefreshCw className="cursor-pointer" onClick={() => onRotate(rotate + 90)} />
                                        </div>
                                    );
                                }}
                            >
                                <PhotoView src={`${process.env.NEXT_PUBLIC_R2_FILES_URL}/${prescriptions.radiology}`}>
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_R2_FILES_URL}/${prescriptions.radiology}`}
                                        ref={imageRef}
                                        alt="Prescription"
                                        className="cursor-zoom-in"
                                        width={1000}
                                        height={1000}
                                    />
                                </PhotoView>
                            </PhotoProvider>
                            <Button className="w-[100%] text-xl" onClick={handlePrint}>Print this out!</Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-5xl text-red-500 text-center">No prescribed radiology</p>
                )}
            </TabsContent>
            <TabsContent value="medicine">
                {prescriptions.medicine ? (
                    <div className="flex flex-col items-center justify-center gap-3 pt-10">
                        <div className="flex flex-col gap-2">
                            <PhotoProvider
                                toolbarRender={({ onScale, scale, onRotate, rotate, index, visible }) => {
                                    return (
                                        <div className="flex flex-row gap-5">
                                            <Printer className="cursor-pointer" onClick={handlePrint} />
                                            <ZoomIn className="cursor-pointer" onClick={() => onScale(scale + 1)} />
                                            <ZoomOut className="cursor-pointer" onClick={() => onScale(scale - 1)} />
                                            <RefreshCw className="cursor-pointer" onClick={() => onRotate(rotate + 90)} />
                                        </div>
                                    );
                                }}
                            >
                                <PhotoView src={`${process.env.NEXT_PUBLIC_R2_FILES_URL}/${prescriptions.medicine}`}>
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_R2_FILES_URL}/${prescriptions.medicine}`}
                                        ref={imageRef}
                                        alt="Prescription"
                                        className="cursor-zoom-in"
                                        width={1000}
                                        height={1000}
                                    />
                                </PhotoView>
                            </PhotoProvider>
                            <Button className="w-[100%] text-xl" onClick={handlePrint}>Print this out!</Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-5xl text-red-500 text-center pt-10">No prescribed medicine</p>
                )}
            </TabsContent>
        </Tabs>
    )
}