'use client'


import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import Name, { TnameSchema } from "@/components/ui/custom/Name";
import { ChangeEvent, useState } from "react";
import { createFolder, deleteFolder } from "../user.actions";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation";
import { Delete, Trash, Trash2 } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

type Ttest = {
    folders: { id: number; name: string; userId: string; files: { id: number; name: string; folderId: number; }[]; }[]
    userId: string
}

export default function Test({ folders, userId }: Ttest) {
    const [error, setError] = useState<string | undefined>();

    const router = useRouter()

    const handleClick = async (data: TnameSchema) => {
        setError(undefined)
        const result = await createFolder(data, userId);

        if (result.error) setError(result.error)
    }

    const handleRedirect = (folderId: number) => {
        router.push(`/user/files/${folderId}`)
    }

    const hadnleDelete = async (folderId: number) => {
        setError(undefined)
        await deleteFolder(folderId);
    }

    return (
        <div className='p-4'>
            <div className="w-full h-full flex flex-row justify-between">
                <h1 className="text-3xl font-bold">Folders</h1>
                <Name
                    handleClick={handleClick}
                    title={'New folder'}
                    name="folder"
                />
            </div>
            {error && <p className="text-red-500 font-bold py-2">{error}</p>}
            {folders.length === 0 ?
                <p className="text-l text-red-500 font-bold pt-4">No folders found, Start by adding a new folder</p>
                : (
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        {folders.map((folder) => {
                            console.log(folder)
                            return (
                                <>
                                    <div
                                        key={folder.id}
                                        className="
                                            flex
                                            flex-row
                                            justify-between
                                            items-center
                                            bg-white
                                            w-fill
                                            shadow-[0_3px_10px_rgb(0,0,0,0.2)]
                                        "
                                    >
                                        <div
                                            className="
                                                flex 
                                                w-full
                                                flex-col 
                                                gap-2
                                                cursor-pointer
                                                py-2
                                                px-3
                                                rounded-sm
                                                transition
                                                ease-in-out 
                                                hover:bg-[#E1E1E1]
                                            "
                                            onClick={() => handleRedirect(folder.id)}

                                        >
                                            <p className="text-2xl font-bold capitalize">{folder.name}</p>
                                            <p className="text-l">Files: {folder.files.length}</p>
                                        </div>
                                        <AlertDialog
                                        >
                                            <AlertDialogTrigger
                                                asChild
                                                className="h-[100%]"
                                            >
                                                <Toggle
                                                    className="h-[100%]"
                                                >
                                                    <Trash2 size={20} color={'red'} />
                                                </Toggle>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will delete the folder and all files associated with it.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => hadnleDelete(folder.id)} className="bg-red-500 hover:bg-[#F15656]">Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </>
                            )
                        })}
                    </div>
                )
            }
        </div>
    )
}