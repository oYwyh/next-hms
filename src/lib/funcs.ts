import { TIndex } from "@/types/index.types";
import { QueryClient, QueryKey } from "@tanstack/react-query";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import { UseFormReturn } from "react-hook-form";

export function getDateByDayName(dayName: string) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'faturday'];
    const today = new Date();
    const currentDay = today.getDay();
    const targetDay = days.indexOf(dayName);
    let diff = targetDay - currentDay;

    if (diff <= 0) {
        diff += 7;
    }

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function getDayByDate(dateString: string) {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const date = new Date(dateString);
    const dayName = daysOfWeek[date.getDay()];
    return dayName;
}

export function generatePassword() {
    const prefix = "HMS@";
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 6;
    let randomString = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters[randomIndex];
    }

    return prefix + randomString;
}

export const normalizeDataFields = (data: any) => {
    Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'string') {
            data[key] = value.toLowerCase();
        }
    });
};

export const handleError = (form: UseFormReturn<any>, error: Record<string, string>) => {
    for (const [field, message] of Object.entries(error)) {
        form.setError(field, {
            type: "server",
            message: message,
        });
    }
};

export const compareFields = (data: TIndex<string> & any, userData: TIndex<string> & any, ignoredFields: string[] = []) => {
    const dobString = format(data.dob, 'yyyy-MM-dd');
    data['dob'] = dobString;
    const userFields = Object.keys(userData).filter(field => !ignoredFields?.includes(field));
    const unChangedFields: string[] = [];
    const changedFields: string[] = [];

    userFields.forEach(field => {
        if (typeof data[field] == 'string' && typeof userData[field] == 'string' && isNaN(Number(data[field])) && isNaN(Number(userData[field]))) {
            if (data[field]?.toLowerCase() !== userData[field]?.toLowerCase()) {
                changedFields.push(field);
            } else {
                unChangedFields.push(field);
            }
        } else if (!isNaN(data[field]) && !isNaN(userData[field])) {
            if (Number(data[field]) != Number(userData[field])) {
                changedFields.push(field);
            } else {
                unChangedFields.push(field);
            }
        }
    });

    data['dob'] = data.dob;
    return { changedFields, unChangedFields };
};

export const getAverageRating = (reviews: any[]) => {
    const totalRating = reviews.reduce((sum: any, { review }: { review: any }) => {
        return sum + parseFloat(review.rating);
    }, 0);
    return totalRating / reviews.length;
}

export const computeSHA256 = async (file: any) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export function invalidateQueries({ queryClient, key }: { queryClient: QueryClient, key: QueryKey }) {
    queryClient.invalidateQueries({
        queryKey: key,
        type: 'all',
    });
}