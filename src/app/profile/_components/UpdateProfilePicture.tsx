'use client'

import { useState } from "react";
import FileUploader from "@/app/_components/FileUploader";
import { User } from "lucia";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";

export default function UpdateProfilePicture({ user }: { user: User }) {
    if (!user) throw new Error('User not found')
    const [open, setOpen] = useState(false);

    return (
        <div>
            <Avatar onClick={() => setOpen(open == true ? false : true)} className="w-[100px] h-[100px] cursor-pointer">
                <AvatarImage alt="Avatar" src={`${process.env.NEXT_PUBLIC_R2_FILES_URL}/${user.picture}`} />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            {user.role != 'user' && (
                <FileUploader open={open} lastPic={user.picture} setOpen={setOpen} userId={user.id} />
            )}
        </div>
    )
}