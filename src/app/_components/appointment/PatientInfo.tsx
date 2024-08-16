'use client'

import FormField from "@/components/ui/custom/FormField";
import { Form } from "@/components/ui/Form";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/Sheet";
import { PhotoProvider, PhotoView } from "react-photo-view";
import Image from "next/image";
import Pdf from "@/components/ui/custom/Pdf";
import { RefreshCw, ZoomIn, ZoomOut } from "lucide-react";
import 'react-photo-view/dist/react-photo-view.css';
import { TUserMedicalFolder } from "@/types/index.types";
import Folders from "@/app/_components/Files/Folders";
import Files from "@/app/_components/Files/Files";

export default function PatientInfo({ patient, folders }: { patient: any /* User */, folders: any }) {
    if (!patient) throw new Error('Failed to get patient info');
    const { firstname, lastname, username, email, phone, nationalId, dob, gender } = patient

    const [openFolderId, setOpenFolderId] = useState<number | null>(null);
    const [sheetOpen, setSheetOpen] = useState<boolean>(false);
    const [photoViewOpen, setPhotoViewOpen] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<string>('');

    const form = useForm();

    const handleFolderClick = (folderId: number) => {
        setOpenFolderId(folderId);
        setSheetOpen(true);
    };

    useEffect(() => {
        if (selectedImage) {
            setPhotoViewOpen(!photoViewOpen);
        }
    }, [selectedImage])

    return (
        <>
            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                    <p className="text-2xl font-bold">Patient Info</p>
                    <Form {...form}>
                        <form>
                            <div className="flex flex-col gap-3 w-[100%]">
                                <div className="flex flex-row justify-between gap-5">
                                    <FormField form={form} name="fullname" defaultValue={firstname + ' ' + lastname} disabled />
                                    <FormField form={form} name="email" defaultValue={email} disabled />
                                </div>
                                <div className="flex flex-row justify-between gap-5">
                                    <FormField form={form} name="phone" defaultValue={phone} disabled />
                                    <FormField form={form} name="nationalId" defaultValue={nationalId} disabled />
                                </div>
                                <div className="flex flex-row justify-between gap-5">
                                    <FormField form={form} name="dob" defaultValue={dob} label="Date of Birth" disabled />
                                    <FormField form={form} name="gender" select="gender" defaultValue={gender} disabled />
                                </div>
                            </div>
                        </form>
                    </Form>
                </div>
                <Folders folders={folders} userId={patient.id} handleSheet={handleFolderClick} />
                {openFolderId && !selectedImage && (
                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                        <SheetContent className="w-screen h-screen" side={'bottom'}>
                            <SheetHeader>
                                <SheetTitle>Folder</SheetTitle>
                                <SheetDescription>
                                    View files in folder
                                </SheetDescription>
                            </SheetHeader>
                            <Files
                                folderId={openFolderId}
                                userId={patient.id}
                                setSheetOpen={setSheetOpen}
                                setSelectedImage={setSelectedImage}
                            />
                        </SheetContent>
                    </Sheet>
                )}
                {photoViewOpen && selectedImage && (
                    <PhotoProvider
                        visible={photoViewOpen}
                        index={0}
                        onClose={() => {
                            setSelectedImage('');
                            setPhotoViewOpen(false);
                        }}
                        toolbarRender={({ onScale, scale, onRotate, rotate }) => {
                            return (
                                <div className="flex flex-row gap-5">
                                    <ZoomIn className="cursor-pointer" onClick={() => onScale(scale + 1)} />
                                    <ZoomOut className="cursor-pointer" onClick={() => onScale(scale - 1)} />
                                    <RefreshCw className="cursor-pointer" onClick={() => onRotate(rotate + 90)} />
                                </div>
                            );
                        }}
                    >
                        <PhotoView key={0} src={selectedImage} />
                    </PhotoProvider>
                )}
            </div>
        </>
    );
}
