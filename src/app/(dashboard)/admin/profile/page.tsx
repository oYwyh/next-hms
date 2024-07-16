import FormUpdateProfile from "@/app/(dashboard)/_components/FormUpdateProfile";
import FormUpdatePassword from "@/app/(dashboard)/_components/FormUpdatePassword";
import { useGetUser } from "@/hooks/userHooks";
import { AdminUser } from "@/lib/types";
import FormUpdatePersonal from "../../_components/FormUpdatePersonal";
import { useEffect } from "react";
import { validateRequest } from "@/lib/auth";
import { UpdateProfilePicture } from "../../_components/UpdateProfilePicture";

export default async function ProfilePage() {
  const { user } = await validateRequest();

  return (
    <>
      {user && user.id && user.firstname && user.lastname && user.phone && user.nationalId && user.age && user.gender ? (
        <div className="flex flex-col gap-4 justify-center items-center h-[100vh]">
          <UpdateProfilePicture
            user={user}
          />
          <FormUpdateProfile
            id={user.id}
            username={user.username}
            email={user.email}
          />
          <FormUpdatePersonal
            id={user.id}
            firstname={user.firstname}
            lastname={user.lastname}
            phone={user.phone}
            nationalId={user.nationalId}
            age={user.age}
            gender={user.gender}
          />
          <FormUpdatePassword
            id={user.id}
          />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );

}