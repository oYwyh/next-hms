'use client'

import { deleteFiles, getSignUrl, removeFiles } from "@/lib/r2";
import { useEffect, useState, useCallback, Dispatch, SetStateAction, useRef } from "react";
import Uppy, { UppyFile } from "@uppy/core";
import Webcam from "@uppy/webcam";
import { Dashboard, DashboardModal, useUppyState } from "@uppy/react";
import ImageEditor from "@uppy/image-editor";
import Informer from '@uppy/informer';
import AwsS3 from '@uppy/aws-s3';

import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import "@uppy/webcam/dist/style.min.css";
import "@uppy/image-editor/dist/style.min.css";
import '@uppy/informer/dist/style.min.css';
import { revalidatePath } from "next/cache";
import { useQueryClient } from "@tanstack/react-query";

export default function FileUploader(
    {
        open,
        setOpen,
        folderId,
    }
        : {
            open: boolean,
            setOpen: Dispatch<SetStateAction<boolean>>
            folderId?: number,
        }) {

    const preparedFilesRef = useRef([]);

    const uppy = new Uppy({
        autoProceed: false,
    }).use(Webcam).use(ImageEditor);

    const computeSHA256 = async (file) => {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    const queryClient = useQueryClient()

    uppy.use(AwsS3, {
        getUploadParameters: async (file: any) => {
            if (!file || !file.data) throw new Error('No file found');
            try {
                const checkSum = await computeSHA256(file.data);
                const signedUrlResult = await getSignUrl(file.data.name, file.data.type, file.data.size, checkSum, folderId);

                if (!signedUrlResult || !signedUrlResult.success) throw new Error('Failed to get sign url');

                const { url, fileName, folderId: s3FolderId } = signedUrlResult.success;

                if (folderId != s3FolderId) throw new Error('Folder id does not match');


                preparedFilesRef.current.push({ name: fileName, folderId: folderId });

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
        if (folderId) {
            console.log(`folderId: ${folderId}`)
            await queryClient.invalidateQueries({ queryKey: ['files', folderId] })
        }
    }).on('cancel-all', async () => {
        await deleteFiles(preparedFilesRef.current, true);
        if (folderId) {
            await queryClient.invalidateQueries({ queryKey: ['files', folderId] })
        }
    })

    return (
        <>
            <DashboardModal
                id="dashboard"
                closeModalOnClickOutside={true}
                open={open}
                uppy={uppy}
                proudlyDisplayPoweredByUppy={false}
                showProgressDetails={true}
                theme="dark"
            />
        </>
    );
}