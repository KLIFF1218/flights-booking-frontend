export function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(time: number) {
  const hours = Math.floor(time / 60);
  const minutes = time % 60;

  return `${hours}ч ${minutes}м`;
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date
    .toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      weekday: "short",
    })
    .replace(".", "");
};

export function formatDateRange(flight: any) {
  const from = formatDate(flight.outbound.departureTime);

  if (!flight.inbound) {
    return from;
  }

  const to = formatDate(flight.inbound.departureTime);
  return `${from} — ${to}`;
}

