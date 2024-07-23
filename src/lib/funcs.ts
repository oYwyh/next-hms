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