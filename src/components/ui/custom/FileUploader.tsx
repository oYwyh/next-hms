'use client'

import { deleteFile, getSignUrl } from "@/lib/r2";
import { Dispatch, SetStateAction, useRef } from "react";
import Uppy, { UppyFile } from "@uppy/core";
import Webcam from "@uppy/webcam";
import { Dashboard, DashboardModal } from "@uppy/react";
import ImageEditor from "@uppy/image-editor";
import AwsS3 from '@uppy/aws-s3';

import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import "@uppy/webcam/dist/style.min.css";
import "@uppy/image-editor/dist/style.min.css";
import '@uppy/informer/dist/style.min.css';
import { useQueryClient } from "@tanstack/react-query";
import { revalidatePathAction } from "@/actions/index.actions";
import { computeSHA256, invalidateQueries } from "@/lib/funcs";
import { tablesMap } from "@/constants";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { DialogTitle } from "@radix-ui/react-dialog";

export default function FileUploader(
    {
        open,
        setOpen,
        userId,
        pfp = false,
        table,
        imgsToDelete,
        limit,
    }
        : {
            open: boolean,
            setOpen: Dispatch<SetStateAction<boolean>>
            userId?: string,
            pfp?: boolean,
            table?: {
                table?: keyof typeof tablesMap,
                values?: any,
                queryKey?: any[],
                paths?: string[]
            },
            imgsToDelete?: {
                name: string,
                table?: keyof typeof tablesMap
                id?: number,
                s3?: boolean
            }[],
            limit?: number
        }) {
    const preparedFilesRef = useRef<string[]>([]);
    const queryClient = useQueryClient()

    const uppy = new Uppy({
        autoProceed: false,
    }).use(Webcam, {
        modes: ['picture'],
        mirror: false,
        preferredImageMimeType: 'image/jpg',
    }).use(ImageEditor);

    uppy.use(AwsS3, {
        getUploadParameters: async (file: any) => {
            if (!file || !file.data) throw new Error('No file found');
            try {
                const checkSum = await computeSHA256(file.data);
                const signedUrlResult = await getSignUrl({
                    key: file.source == 'Webcam' ? file.name : file.data.name,
                    type: file.data.type,
                    size: file.data.size,
                    checkSum,
                    userId: userId ? userId : undefined,
                    pfp: pfp ? true : undefined,
                    table: table ? table : undefined,
                    imgsToDelete: imgsToDelete,
                });

                if (!signedUrlResult || !signedUrlResult.success) throw new Error('Failed to get sign url');

                const { url, fileName } = signedUrlResult.success;

                preparedFilesRef.current.push(fileName);

                return {
                    method: 'PUT',
                    url: url,
                    fields: {},
                    headers: {
                        'Content-Type': file.type,
                    }
                }
            } catch (error) {
                console.error("Error in getUploadParameters:", error);
                throw error;
            }
        }
    }).on('complete', async (result) => {
        if (table && table.queryKey) {
            invalidateQueries({ queryClient, key: table.queryKey });
        }
        if (table && table.paths && table.paths.length > 0) {
            for (const path of table.paths) {
                await revalidatePathAction(path)
            }
        }
        if (pfp) {
            await revalidatePathAction('/profile')
        }
        setOpen(false)
    }).on('cancel-all', async () => {
        preparedFilesRef.current.map(async (fileName) => {
            await deleteFile({ name: fileName, s3: true })
        })
        if (table && table.queryKey) {
            invalidateQueries({ queryClient, key: table.queryKey });
        }
        if (table && table.paths && table.paths.length > 0) {
            for (const path of table.paths) {
                await revalidatePathAction(path)
            }
        }
        if (pfp) {
            await revalidatePathAction('/profile')
        }
    }).on('file-added', (file) => {
        if (limit) {
            if (uppy.getFiles().length > limit) {
                uppy.removeFile(file.id);
            }
        }
    });

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-fit p-0 m-0 border-0 text-white">
                    <DialogTitle className="absolute h-0 w-0 p-0 m-0 space-x-0 space-y-0"></DialogTitle>
                    <Dashboard
                        id="dashboard"
                        uppy={uppy}
                        proudlyDisplayPoweredByUppy={false}
                        showProgressDetails={true}
                        theme="dark"
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}