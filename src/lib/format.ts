export function formatRuntime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours <= 0) return `${rest} min`;
  return `${hours}h ${rest.toString().padStart(2, "0")}min`;
}

export function formatHours(minutes: number) {
  const hours = Math.round(minutes / 60);
  return `${hours}h`;
}

export function percent(watched: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((watched / total) * 100);
}
