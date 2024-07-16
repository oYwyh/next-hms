import { DataTable } from "@/components/ui/table/data-table";
import { DoctorColumnsTypes, UserColumnsTypes, DoctorTableColumns, UserTableColumns, AdminTableColumns, DoctorTableColumnsWithPrivileges, UserTableColumnsWithPrivileges, AdminTableColumnsWithPrivileges } from "./columns";
import db from "@/lib/db";
import AddPage from "./add";
import { useGetUser } from "@/hooks/userHooks";

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

  return [];
}

export default async function ManagePage({ role }: { role: 'admin' | 'doctor' | 'user' }) {
  const user = await useGetUser();
  const isSuper = user && user?.admin.super
  const data = await getData(role)

  return (
    <div>
      {isSuper && (
        <AddPage role={role} data={data} />
      )}
      {role == 'doctor' && (
        <>
          {isSuper ? (
            <DataTable columns={DoctorTableColumnsWithPrivileges} data={data} hiddenColumns={['id']} />
          ) : (
            <DataTable columns={DoctorTableColumns} data={data} hiddenColumns={['id']} />
          )}
        </>
      )}
      {role == 'user' && (
        <>
          {isSuper ? (
            <DataTable columns={UserTableColumnsWithPrivileges} data={data} hiddenColumns={['id']} />
          ) : (
            <DataTable columns={UserTableColumns} data={data} hiddenColumns={['id']} />
          )}
        </>
      )}
      {role == 'admin' && (
        <>
          {isSuper ? (
            <DataTable columns={AdminTableColumnsWithPrivileges} data={data} hiddenColumns={['id']} />
          ) : (
            <DataTable columns={AdminTableColumns} data={data} hiddenColumns={['id']} />
          )}
        </>
      )}
    </div>
  )
}
