import About from "@/app/dr/[username]/_components/About";
import Card from "@/app/dr/[username]/_components/Card";
import Reviews from "@/app/dr/[username]/_components/Reviews";
import Time from "@/app/dr/[username]/_components/Time";
import { validateRequest } from "@/lib/auth";
import db from "@/lib/db";
import { doctorTable, reviewTable, userTable, workDaysTable, workHoursTable } from "@/lib/db/schema";
import { TDoctor, TUser } from "@/types/index.types";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

type DoctorInfo = {
    appointmentInfo: any[];
    doctorUser: TUser;
    doctor: TDoctor;
    reviews: any[];
};

const getInfo = async (username: string): Promise<DoctorInfo> => {
    const [data] = await db.select().from(userTable)
        .where(eq(userTable.username, username))
        .leftJoin(doctorTable, eq(doctorTable.userId, userTable.id));

    if (!data) throw new Error('Doctor not found');

    const reviews = await db.select().from(reviewTable)
        .where(sql`"doctorId" = ${data.doctor?.id}`)
        .leftJoin(userTable, eq(userTable.id, reviewTable.userId));

    const doctors = await db.select().from(userTable)
        .where(eq(userTable.username, username))
        .leftJoin(doctorTable, eq(doctorTable.userId, userTable.id))
        .leftJoin(workDaysTable, eq(workDaysTable.doctorId, doctorTable.id))
        .leftJoin(workHoursTable, eq(workHoursTable.workDayId, workDaysTable.id));

    const formattedDoctors = doctors.reduce((acc: Record<string, any>, record: any) => {
        const userId = record.user.id;

        if (!acc[userId]) {
            acc[userId] = {
                user: record.user,
                doctor: record.doctor,
                workDays: [],
            };
        }

        const workDayIndex = acc[userId].workDays.findIndex((day: any) => day.id === record.workDays.id);
        if (workDayIndex === -1) {
            acc[userId].workDays.push({
                ...record.workDays,
                workHours: [{ ...record.workHours }],
            });
        } else {
            acc[userId].workDays[workDayIndex].workHours.push({ ...record.workHours });
        }

        return acc;
    }, {});

    // Convert the aggregated doctors object to an array
    const result = Object.values(formattedDoctors);

    return {
        appointmentInfo: result,
        doctorUser: data.user,
        doctor: data.doctor,
        reviews,
    };
};

export default async function DrPage({ params: { username } }: { params: { username: string } }) {
    let doctorUser: TUser | null = null;
    let doctor: TDoctor | null = null;
    let reviews: any[] = [];
    let appointmentInfo: any[] = [];

    try {
        const data = await getInfo(username);
        doctorUser = data.doctorUser;
        doctor = data.doctor;
        reviews = data.reviews;
        appointmentInfo = data.appointmentInfo;
    } catch (error) {
        console.error("Error fetching doctor information:", error);
        return redirect('/404');
    }

    if (!doctorUser || !doctor) return redirect('/404');

    const { user } = await validateRequest();
    if (!user) return redirect('/auth');

    return (
        <div className="grid grid-cols-2 gap-10 py-5 px-10">
            <div className="flex flex-col gap-3">
                <Card user={doctorUser} doctor={doctor} reviews={reviews} />
                <About doctor={doctor} />
                <Reviews doctor={doctor} reviews={reviews} />
            </div>
            <Time appointmentInfo={appointmentInfo} userId={user.id} role={user.role} />
        </div>
    );
}
