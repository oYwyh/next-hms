import { DataTable } from "@/components/ui/table/DataTable";
import { DoctorColumnsTypes, UserColumnsTypes, DoctorTableColumns, UserTableColumns, AdminTableColumns, DoctorTableColumnsWithPrivileges, UserTableColumnsWithPrivileges, AdminTableColumnsWithPrivileges, ReceptionistTableColumnsWithPrivileges, ReceptionistTableColumns } from "./columns";
import db from "@/lib/db";
import AddPage from "./Add";
import { useGetUser } from "@/hooks/useGetUser";
import { UserRoles } from "@/types/index.types";

async function getData(role: string) {
  if (role == 'doctor') {
    const doctors = await db.query.userTable.findMany({
      columns: {
        password: false
      },
      with: {
        doctor: {
          with: {
            workDays: {
              with: {
                workHours: true
              }
            }
          }
        }
      },
      where: (userTable, { eq }) => eq(userTable.role, 'doctor'),
    });
    const mergedDoctors = doctors.map((doctor) => {
      const mergedDoctor = {
        id: doctor.id,
        firstname: doctor.firstname,
        lastname: doctor.lastname,
        username: doctor.username,
        email: doctor.email,
        phone: doctor.phone,
        nationalId: doctor.nationalId,
        age: doctor.age,
        gender: doctor.gender,
        role: doctor.role,
        specialty: doctor.doctor.specialty,
        // workTime: doctor.doctor.workDays.flatMap((workDay) => workDay.day),
        workTime: doctor.doctor.workDays.flatMap((workDay) => workDay.workHours.flatMap((workHour) => { return { workHour: workHour, day: workDay.day } })),
      };
      return mergedDoctor;
    });
    return mergedDoctors;
  }

  if (role == 'user') {
    const users = await db.query.userTable.findMany({
      columns: {
        password: false
      },
      where: (userTable, { eq }) => eq(userTable.role, 'user'),
    });
    return users;
  }

  if (role == 'admin') {
    const admins = await db.query.userTable.findMany({
      columns: {
        password: false
      },
      with: {
        admin: {
          columns: {
            super: true
          }
        }
      },
      where: (userTable, { eq }) => eq(userTable.role, 'admin'),
    });
    const mergedAdmins = admins.map((admin) => {
      const mergedAdmin = {
        id: admin?.id,
        firstname: admin?.firstname,
        lastname: admin?.lastname,
        username: admin?.username,
        email: admin?.email,
        phone: admin?.phone,
        nationalId: admin?.nationalId,
        age: admin?.age,
        gender: admin?.gender,
        role: admin?.role,
        super: admin.admin.super,
      };
      return mergedAdmin;
    })
    return mergedAdmins;
  }

  if (role == 'receptionist') {
    const receptionists = await db.query.userTable.findMany({
      columns: {
        password: false
      },
      with: {
        receptionist: true
      },
      where: (userTable, { eq }) => eq(userTable.role, 'receptionist'),
    });
    const mergedReceptionists = receptionists.map((receptionist) => {
      const mergedReceptionist = {
        id: receptionist.id,
        firstname: receptionist.firstname,
        lastname: receptionist.lastname,
        username: receptionist.username,
        email: receptionist.email,
        phone: receptionist.phone,
        nationalId: receptionist.nationalId,
        age: receptionist.age,
        gender: receptionist.gender,
        role: receptionist.role,
        department: receptionist.receptionist.department
      };
      return mergedReceptionist;
    });
    return mergedReceptionists;
  }
  return [];
}

export default async function ManagePage({ role }: { role: UserRoles }) {
  const user = await useGetUser()
  if (!user) throw new Error('Unauthorized')
  const isSuper = user && 'admin' in user && user.admin?.super
  const data = await getData(role) as []
  console.log(data)

  return (
    <div>
      {isSuper && (
        <AddPage role={role} />
      )}
      {role == 'doctor' && (
        <>
          {isSuper ? (
            <DataTable columns={DoctorTableColumnsWithPrivileges} data={data} hiddenColumns={['id', 'role']} />
          ) : (
            <DataTable columns={DoctorTableColumns} data={data} hiddenColumns={['id', 'role']} />
          )}
        </>
      )}
      {role == 'user' && (
        <>
          {isSuper ? (
            <DataTable columns={UserTableColumnsWithPrivileges} data={data} hiddenColumns={['id', 'role']} />
          ) : (
            <DataTable columns={UserTableColumns} data={data} hiddenColumns={['id', 'role']} />
          )}
        </>
      )}
      {role == 'admin' && (
        <>
          {isSuper ? (
            <DataTable columns={AdminTableColumnsWithPrivileges} data={data} hiddenColumns={['id', 'role']} />
          ) : (
            <DataTable columns={AdminTableColumns} data={data} hiddenColumns={['id', 'role']} />
          )}
        </>
      )}
      {role == 'receptionist' && (
        <>
          {isSuper ? (
            <DataTable columns={ReceptionistTableColumnsWithPrivileges} data={data} hiddenColumns={['id', 'role']} />
          ) : (
            <DataTable columns={ReceptionistTableColumns} data={data} hiddenColumns={['id', 'role']} />
          )}
        </>
      )}
    </div>
  )
}
