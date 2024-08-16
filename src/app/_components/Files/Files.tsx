'use client'

import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import FileUploader from "@/components/ui/custom/FileUploader";
import { Button } from "@/components/ui/Button";
import Pdf from "@/components/ui/custom/Pdf";
import { deleteFile } from "@/lib/r2";
import { RefreshCw, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import { PhotoProvider, PhotoView } from 'react-photo-view';

import 'react-photo-view/dist/react-photo-view.css';
import { TUserMedicalFile } from "@/types/index.types";
import { fileTypes, imageTypes } from "@/constants";
import { invalidateQueries } from "@/lib/funcs";

export function FilesList(
    {
        files,
        folderId,
        queryClient,
        setSheetOpen,
        setSelectedImage
    }: {
        files: TUserMedicalFile[],
        folderId: number,
        queryClient: QueryClient,
        setSheetOpen?: Dispatch<SetStateAction<boolean>>
        setSelectedImage?: Dispatch<SetStateAction<string>>
    }) {
    return (
        <div className="grid grid-cols-6 gap-5 w-fit">
            <PhotoProvider
                toolbarRender={({ onScale, scale, onRotate, rotate, index }) => {
                    const filteredFiles = files.filter((file) => imageTypes.includes(file.type))
                    const activeFile = filteredFiles[index];
                    console.log(activeFile)
                    if (!activeFile) return null;
                    return (
                        <div className="flex flex-row gap-5">
                            <Trash2 className="cursor-pointer" color='red' onClick={async () => {
                                await deleteFile({ name: activeFile.name, s3: true, table: 'userFiles', id: activeFile.id });
                                invalidateQueries({ queryClient, key: ['files', String(folderId)] });
                            }} />
                            <ZoomIn className="cursor-pointer" onClick={() => onScale(scale + 1)} />
                            <ZoomOut className="cursor-pointer" onClick={() => onScale(scale - 1)} />
                            <RefreshCw className="cursor-pointer" onClick={() => onRotate(rotate + 90)} />
                        </div>
                    );
                }}
            >
                {files.length === 0 ? <p className="text-red-500 text-2xl pt-2">No files</p> : null}
                {files.map((file) => {
                    if (imageTypes.includes(file.type)) {
                        return (
                            <div key={file.id} className="shadow-2xl w-fit h-fit">
                                <PhotoView
                                    src={`${process.env.NEXT_PUBLIC_R2_FILES_URL}/${file.name}`}
                                >
                                    <Image
                                        onClick={() => {
                                            setSheetOpen && setSheetOpen(false)
                                            setSelectedImage && setSelectedImage(`${process.env.NEXT_PUBLIC_R2_FILES_URL}/${file.name}`)
                                        }}
                                        className="cursor-pointer rounded-sm object-cover h-60 w-60"
                                        src={`${process.env.NEXT_PUBLIC_R2_FILES_URL}/${file.name}`}
                                        alt={file.name}
                                        width={500}
                                        height={500}
                                    />
                                </PhotoView>
                            </div>
                        );
                    }
                })}
            </PhotoProvider>
        </div>
    );
}

export function PdfList({ files }: { files: TUserMedicalFile[] }) {
    return (
        <div className="grid grid-cols-2 gap-4">
            {files.length === 0 ? <p className="text-red-500 text-2xl pt-2">No files</p> : null}
            {files.map((file, index) => {
                if (fileTypes.includes(file.type)) {
                    return (
                        <Pdf file={file} ownerId={file.userId} s3={true} />
                    );
                }
            })}
        </div>
    );
}

export default function Files(
    {
        folderId,
        userId,
        setSheetOpen,
        setSelectedImage
    }: {
        folderId: number,
        userId: string,
        setSheetOpen?: Dispatch<SetStateAction<boolean>>,
        setSelectedImage?: Dispatch<SetStateAction<string>>
    }) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: files, isLoading, error } = useQuery({
        queryKey: ['files', folderId],
        queryFn: async () => {
            const response = await fetch(`/api/user/files/${folderId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        },
    });

    const { data: user, error: userError } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await fetch('/api/user/info');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        },
    });

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading files: {error.message}</p>;
    if (userError) return <p>Error loading user data: {userError.message}</p>;

    return (
        <div className='p-4'>
            <div className="flex flex-row justify-between">
                <h1 className="text-3xl font-bold">Files</h1>
                {user && user.id === userId && (
                    <>
                        <FileUploader
                            table={{
                                table: 'userFiles',
                                values: { folderId, userId: user.id },
                                queryKey: ['files', folderId],
                            }}
                            open={open}
                            setOpen={setOpen}
                        />
                        <Button className="block" onClick={() => setOpen(!open)}>Add files</Button>
                    </>
                )}
            </div>
            <div>
                <Tabs defaultValue="images" className="w-[100%] pt-3">
                    <TabsList className="w-[100%]">
                        <TabsTrigger className="w-[100%]" value="images">Images</TabsTrigger>
                        <TabsTrigger className="w-[100%]" value="pdfs">PDFs</TabsTrigger>
                    </TabsList>
                    <TabsContent value="images">
                        <FilesList
                            files={files}
                            folderId={folderId}
                            queryClient={queryClient}
                            setSheetOpen={setSheetOpen}
                            setSelectedImage={setSelectedImage}
                        />
                    </TabsContent>
                    <TabsContent value="pdfs">
                        <PdfList files={files} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
