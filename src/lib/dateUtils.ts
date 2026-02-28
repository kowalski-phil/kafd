/** Get Monday of the week containing the given date */
export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  // Sunday = 0, so offset is day === 0 ? 6 : day - 1
  const diff = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Get array of 7 dates (Mon–Sun) for the week containing the given date */
export function getWeekDates(date: Date): Date[] {
  const start = getWeekStart(date)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return d
  })
}

/** Format date as YYYY-MM-DD for Supabase */
export function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Format date in German short form: "Mo 27.01." */
export function formatDateShort(date: Date): string {
  const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
  const day = days[date.getDay()]
  const d = date.getDate()
  const m = date.getMonth() + 1
  return `${day} ${d}.${m}.`
}

/** Format date range: "27.01. – 02.02.2025" */
export function formatDateRange(start: Date, end: Date): string {
  const s = `${start.getDate()}.${start.getMonth() + 1}.`
  const e = `${end.getDate()}.${end.getMonth() + 1}.${end.getFullYear()}`
  return `${s} – ${e}`
}

/** Check if two dates are the same day */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Navigate weeks: offset can be -1 (prev) or +1 (next) */
export function offsetWeek(date: Date, offset: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + offset * 7)
  return d
}

/** Subtract N days from a date */
export function subDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Format date as "DD.MM." (short German, no day name) */
export function formatDayMonth(date: Date): string {
  return `${date.getDate()}.${date.getMonth() + 1}.`
}
