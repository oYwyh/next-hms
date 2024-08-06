import FormUpdateProfile from "@/app/profile/_components/FormUpdateProfile";
import FormUpdatePassword from "@/app/profile/_components/FormUpdatePassword";
import FormUpdatePersonal from "@/app/profile/_components/FormUpdatePersonal";
import { validateRequest } from "@/lib/auth";
import UpdateProfilePicture from "@/app/profile/_components/UpdateProfilePicture";

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
            user={user}
          // id={user.id}
          // username={user.username}
          // email={user.email}
          />
          <FormUpdatePersonal
            user={user}
          // id={user.id}
          // firstname={user.firstname}
          // lastname={user.lastname}
          // phone={user.phone}
          // nationalId={user.nationalId}
          // age={user.age}
          // gender={user.gender}
          />
          <FormUpdatePassword
            user={user}
          />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );

}