import { DataTable } from "@/components/ui/custom/DataTable";
import { DoctorColumnsType, columns } from "@/components/ui/custom/Columns";
import db from "@/lib/db";
import AddPage from "./add";

async function getData(): Promise<DoctorColumnsType[]> {
  // Fetch data from your API here.
  const users = await db.query.userTable.findMany({
    columns: {
      id: true,
      username: true,
      email: true,
      phone: true,
      age: true,
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

  const mergedUsers = users.map((user) => {
    const mergedUser = {
      id: user.doctor.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      age: user.age,
      specialty: user.doctor.specialty,
      workDays: user.doctor.workDays.flatMap((workDay) => workDay.day),
      workHours: user.doctor.workDays.flatMap((workDay) => workDay.workHours.flatMap((workHour) => `${workHour.startAt}-${workHour.endAt}`)),
    };
    return mergedUser;
  });

  return mergedUsers;
}

export default async function ManagePage() {
    const data = await getData()
    
    return (
        <div>
          <AddPage />
          <DataTable columns={columns} data={data} />
        </div>
    )
}