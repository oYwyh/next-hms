import { DataTable } from "@/components/ui/custom/DataTable";
import { DoctorColumnsType, columns } from "@/components/ui/custom/Columns";
import db from "@/lib/db";
import AddPage from "./add";

async function getData(): Promise<DoctorColumnsType[]> {
  // Fetch data from your API here.
  const users = await db.query.userTable.findMany({
    columns: {
      id: true,
      firstname: true,
      lastname: true,
      username: true,
      email: true,
      phone: true,
      nationalId: true,
      age: true,
      gender: true,
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

  // // Group hours by day
  // const groupedHours = selectedHours.reduce((acc, hour) => {
  //   // Check if the accumulator already has an entry for the current hour's day
  //   if (!acc[hour.day]) {
  //     // If not, create an empty array for this day
  //     acc[hour.day] = [];
  //   }

  //   // Push the current hour's value to the array for this day
  //   acc[hour.day].push(hour.value);

  //   // Return the updated accumulator to be used in the next iteration
  //   return acc;
  // }, {} as Record<string, string[]>); // Initial value of the accumulator is an empty object


  const mergedUsers = users.map((user) => {
    const mergedUser = {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      email: user.email,
      phone: user.phone,
      nationalId: user.nationalId,
      age: user.age,
      gender: user.gender,
      specialty: user.doctor.specialty,
      // workTime: user.doctor.workDays.flatMap((workDay) => workDay.day),
      workTime: user.doctor.workDays.flatMap((workDay) => workDay.workHours.flatMap((workHour) => { return { workHour: workHour, day: workDay.day } })),
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
