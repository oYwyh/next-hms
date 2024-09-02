import { DataTable } from "@/components/ui/table/DataTable";
import { DoctorColumnsTypes, UserColumnsTypes, DoctorTableColumns, UserTableColumns, AdminTableColumns, DoctorTableColumnsWithPrivileges, UserTableColumnsWithPrivileges, AdminTableColumnsWithPrivileges, ReceptionistTableColumnsWithPrivileges, ReceptionistTableColumns } from "../columns";
import db from "@/lib/db";
import AddPage from "../Add";
import { useGetUser } from "@/hooks/useGetUser";
import { TTables, UserRoles } from "@/types/index.types";
import { specialties } from "@/constants";

async function getDoctors() {
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
      dob: doctor.dob,
      gender: doctor.gender,
      role: doctor.role,
      fee: doctor.doctor.fee,
      specialty: doctor.doctor.specialty,
      workTime: doctor.doctor.workDays.flatMap((workDay) => workDay.workHours.flatMap((workHour) => { return { workHour: workHour, day: workDay.day } })),
      table: 'doctor'
    };
    return mergedDoctor;
  });
  return mergedDoctors;
}

async function getUsers() {
  const users = await db.query.userTable.findMany({
    columns: {
      password: false
    },
    where: (userTable, { eq }) => eq(userTable.role, 'user'),
  });
  const mergedUsers = users.map((user) => {
    const mergedUser = {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      email: user.email,
      phone: user.phone,
      nationalId: user.nationalId,
      dob: user.dob,
      gender: user.gender,
      role: user.role,
      table: 'user'
    }
    return mergedUser
  })
  return mergedUsers
}

async function getAdmins() {
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
      dob: admin?.dob,
      gender: admin?.gender,
      role: admin?.role,
      super: admin.admin.super,
      table: 'admin'
    };
    return mergedAdmin;
  })
  return mergedAdmins;
}


async function getReceptionists() {
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
      dob: receptionist.dob,
      gender: receptionist.gender,
      role: receptionist.role,
      department: receptionist.receptionist.department,
      table: 'receptionist'
    };
    return mergedReceptionist;
  });
  return mergedReceptionists;
}

async function getData(table: TTables) {
  switch (table) {
    case 'doctor':
      return await getDoctors();
    case 'user':
      return await getUsers();
    case 'admin':
      return await getAdmins();
    case 'receptionist':
      return await getReceptionists();
    default:
      return [];
  }
}

export default async function ManagePage({ table }: { table: UserRoles }) {
  const user = await useGetUser()
  if (!user) throw new Error('Unauthorized')
  const isSuper = user && 'admin' in user && user.admin?.super
  const data = await getData(table) as []

  const tableConfig: Record<any/* TTables */, { columns: any }> = {
    doctor: {
      columns: isSuper ? DoctorTableColumnsWithPrivileges : DoctorTableColumns,
    },
    user: {
      columns: isSuper ? UserTableColumnsWithPrivileges : UserTableColumns,
    },
    admin: {
      columns: isSuper ? AdminTableColumnsWithPrivileges : AdminTableColumns,
    },
    receptionist: {
      columns: isSuper ? ReceptionistTableColumnsWithPrivileges : ReceptionistTableColumns,
    },
  };

  const { columns } = tableConfig[table];

  const doctorFilters = [
    {
      column: 'specialty',
      options: specialties
    },
  ]

  const filters = table === 'doctor' ? doctorFilters : [];

  return (
    <div>
      {isSuper && <AddPage role={table} />}
      <DataTable
        columns={columns}
        data={data}
        hiddenColumns={['id', 'role', 'table']}
        restrictedColumns={['table']}
        search='email'
        filters={filters}
      />
    </div>
  );
}