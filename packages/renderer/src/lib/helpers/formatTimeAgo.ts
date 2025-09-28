const formatter = new Intl.RelativeTimeFormat("en-US", { style: "long" });

export function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();

    const seconds = Math.floor(diffInMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
        return formatter.format(-years, "year");
    } else if (months > 0) {
        return formatter.format(-months, "month");
    } else if (weeks > 0) {
        return formatter.format(-weeks, "week");
    } else if (days > 0) {
        return formatter.format(-days, "day");
    } else if (hours > 0) {
        return formatter.format(-hours, "hour");
    } else if (minutes > 0) {
        return formatter.format(-minutes, "minute");
    } else {
        return formatter.format(-seconds, "second");
    }
}
