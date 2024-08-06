import { TIndex } from "@/types/index.types";
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

export function generateRandomPassword() {
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
    const userFields = Object.keys(userData).filter(field => !ignoredFields?.includes(field));
    const unChangedFields: string[] = [];
    const changedFields: string[] = [];

    userFields.forEach(field => {
        if (typeof data[field] == 'string' && typeof userData[field] == 'string') {
            if (data[field]?.toLowerCase() !== userData[field]?.toLowerCase()) {
                changedFields.push(field);
            } else {
                unChangedFields.push(field);
            }
        }
    });

    return { changedFields, unChangedFields };
};