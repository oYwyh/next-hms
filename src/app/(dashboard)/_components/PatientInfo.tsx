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

export function PatientInfo({ patient, folders }: { patient: any /* User */, folders: any }) {
    if (!patient) throw new Error('Failed to get patient info');
    const { firstname, lastname, username, email, phone, nationalId, age, gender } = patient

    const [openFolderId, setOpenFolderId] = useState<number | null>(null);
    const [photoViewOpen, setPhotoViewOpen] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [lastOpenFolderId, setLastOpenFolderId] = useState<number | null>(null);

    const form = useForm();

    const handleImageClick = (image: string) => {
        setSelectedImage(image);
        setPhotoViewOpen(true);
    };

    const handleFolderClick = (folderId: number) => {
        setOpenFolderId(folderId);
        setLastOpenFolderId(folderId);
    };

    console.log(folders);

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
                                    <FormField form={form} name="age" defaultValue={age} disabled />
                                    <FormField form={form} name="gender" select="gender" defaultValue={gender} disabled />
                                </div>
                            </div>
                        </form>
                    </Form>
                </div>
                <div className="flex flex-col gap-1">
                    <p className="text-2xl font-bold">Patient Medical Files</p>
                    {folders.length === 0 ? (
                        <p className="text-l text-red-500 font-bold pt-4">No folders found, Start by adding a new folder</p>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            {folders.map((folder) => (
                                <div key={folder.id}>
                                    <div
                                        className="
                                            flex 
                                            w-full
                                            flex-col 
                                            gap-2
                                            cursor-pointer
                                            py-2
                                            px-3
                                            bg-white
                                            w-fill
                                            shadow-[0_3px_10px_rgb(0,0,0,0.2)]
                                            rounded-sm
                                            transition
                                            ease-in-out 
                                            hover:bg-[#E1E1E1]
                                        "
                                        onClick={() => handleFolderClick(folder.id)}
                                    >
                                        <p className="text-2xl font-bold capitalize">{folder.name}</p>
                                        <p className="text-l">Files: {folder.files.length}</p>
                                    </div>
                                    {openFolderId === folder.id && (
                                        <Sheet open={Boolean(openFolderId)} onOpenChange={() => setOpenFolderId(null)}>
                                            <SheetContent side={'bottom'} className="h-[90%] overflow-scroll">
                                                <SheetHeader>
                                                    <SheetTitle>Files</SheetTitle>
                                                    <div>
                                                        <Tabs defaultValue="images" className="w-[100%] pt-3">
                                                            <TabsList className="w-[100%]">
                                                                <TabsTrigger className="w-[100%]" value="images">Images</TabsTrigger>
                                                                <TabsTrigger className="w-[100%]" value="pdfs">PDFs</TabsTrigger>
                                                            </TabsList>
                                                            <TabsContent value="images">
                                                                <div className="grid grid-cols-6 gap-5 w-fit">
                                                                    {folder.files.length === 0 ? (
                                                                        <p className="text-red-500 text-2xl pt-2">No files</p>
                                                                    ) : null}
                                                                    {folder.files.map((file: any, index: any) => {
                                                                        const fileExtension = file.name.split('.').pop().toLowerCase();
                                                                        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
                                                                            return (
                                                                                <div key={index} className="shadow-2xl w-fit h-fit ">
                                                                                    <Image
                                                                                        className="cursor-pointer rounded-sm object-cover h-60 w-60"
                                                                                        src={`${process.env.NEXT_PUBLIC_R2_FILES_URL}/${file.name}`}
                                                                                        alt={file.name}
                                                                                        width={500}
                                                                                        height={500}
                                                                                        onClick={() => {
                                                                                            setOpenFolderId(null);
                                                                                            handleImageClick(`${process.env.NEXT_PUBLIC_R2_FILES_URL}/${file.name}`);
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            );
                                                                        }
                                                                    })}
                                                                </div>
                                                            </TabsContent>
                                                            <TabsContent value="pdfs">
                                                                <div className="grid grid-cols-2 ">
                                                                    {folder.files.length === 0 ? (
                                                                        <p className="text-red-500 text-2xl pt-2">No files</p>
                                                                    ) : null}
                                                                    {folder.files.map((file: any, index: number) => {
                                                                        const fileExtension = file.name.split('.').pop().toLowerCase();
                                                                        if (['pdf'].includes(fileExtension)) {
                                                                            return (
                                                                                <div key={index}>
                                                                                    <Pdf name={file.name} />
                                                                                </div>
                                                                            );
                                                                        }
                                                                    })}
                                                                </div>
                                                            </TabsContent>
                                                        </Tabs>
                                                    </div>
                                                </SheetHeader>
                                            </SheetContent>
                                        </Sheet>
                                    )}
                                    {photoViewOpen && selectedImage && (
                                        <PhotoProvider
                                            visible={photoViewOpen}
                                            index={0}
                                            onClose={() => {
                                                setOpenFolderId(lastOpenFolderId);
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
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
