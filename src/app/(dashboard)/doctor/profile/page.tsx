import FormUpdateProfile from "@/app/(dashboard)/_components/FormUpdateProfile";
import FormUpdatePassword from "@/app/(dashboard)/_components/FormUpdatePassword";
import { useGetUser } from "@/hooks/userHooks";
import { DoctorUser } from "@/lib/types";
import FormUpdatePersonal from "../../_components/FormUpdatePersonal";

export default async function ProfilePage() {
  const doctorUser = await useGetUser();

  const user = doctorUser as DoctorUser

  return (
    <>
      {user && user.id && user.firstname && user.lastname && user.phone && user.nationalId && user.age && user.gender ? (
        <>
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
        </>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
}