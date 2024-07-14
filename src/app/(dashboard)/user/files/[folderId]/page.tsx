'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FileUploader from "@/app/(dashboard)/_components/FileUploader";
import { Button } from "@/components/ui/button";
import Pdf from "@/components/ui/custom/Pdf";
import { deleteFile } from "@/lib/r2";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { useEffect, useState } from "react";
import { PhotoProvider, PhotoView } from 'react-photo-view';


import 'react-photo-view/dist/react-photo-view.css';

export default function FilesPage({ params: { folderId } }: { params: { folderId: number } }) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: files, isLoading } = useQuery({
        queryKey: ['files', folderId],
        queryFn: async () => {
            const response = await fetch(`/api/user/files/${folderId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        },
    })
    return (
        <>
            {isLoading ? <p>Loading...</p> : (
                <div className='p-4'>
                    <div className="flex flex-row justify-between">
                        <h1 className="text-3xl font-bold">Files</h1>
                        <FileUploader folderId={folderId} open={open} setOpen={setOpen} />
                        <Button className="block" onClick={() => setOpen(open == true ? false : true)}>Add files</Button>
                    </div>
                    <div>
                        <Tabs defaultValue="images" className="w-[100%] pt-3">
                            <TabsList className="w-[100%]">
                                <TabsTrigger className="w-[100%]" value="images">Images</TabsTrigger>
                                <TabsTrigger className="w-[100%]" value="pdfs">PDFs</TabsTrigger>
                            </TabsList>
                            <TabsContent value="images">
                                <div className="grid grid-cols-6 gap-5 w-fit">
                                    <PhotoProvider
                                        toolbarRender={({ onScale, scale, onRotate, rotate, index }) => {
                                            const activeFile = files[index]
                                            return (
                                                <div className="flex flex-row gap-5">
                                                    <Trash2 className="cursor-pointer" color='red' onClick={async () => {
                                                        await deleteFile(activeFile.name, true)
                                                        queryClient.invalidateQueries({ queryKey: ['files', folderId] })
                                                    }} />
                                                    <ZoomIn className="cursor-pointer" onClick={() => onScale(scale + 1)} />
                                                    <ZoomOut className="cursor-pointer" onClick={() => onScale(scale - 1)} />
                                                    <RefreshCw className="cursor-pointer" onClick={() => onRotate(rotate + 90)} />
                                                </div>
                                            );
                                        }}
                                    >
                                        {files.length === 0 ? <p className="text-red-500 text-2xl pt-2">No files</p> : null}
                                        {files?.map((file: any, index: number) => {
                                            const fileExtension = file.name.split('.').pop().toLowerCase();
                                            if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
                                                return (
                                                    <div key={file.id} className="shadow-2xl w-fit h-fit">
                                                        <PhotoView src={`${process.env.NEXT_PUBLIC_R2_FILES_URL}/${file.name}`}>
                                                            <Image
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
                            </TabsContent>
                            <TabsContent value="pdfs">
                                <div className="grid grid-cols-2 ">
                                    {files.map((file: any, index: number) => {
                                        console.log(index)
                                        const fileExtension = file.name.split('.').pop().toLowerCase();
                                        if (['pdf'].includes(fileExtension)) {
                                            return (
                                                <div key={index}>
                                                    <Pdf name={file.name} />
                                                </div>
                                            )
                                        }
                                    })}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div >
            )
            }
        </>
    )
}

