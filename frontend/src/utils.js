export function formatHours(decimalHours) {
  if (decimalHours === null || decimalHours === undefined) return '--';
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}
