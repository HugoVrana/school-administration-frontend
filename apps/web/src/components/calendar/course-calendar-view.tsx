import { useMemo, useState } from "react"
import {
  CalendarBlankIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react"
import { Button } from "@workspace/ui/components/base/button"
import { cn } from "@workspace/ui/lib/utils"

type CalendarRole = "admin" | "teacher" | "student"

type CourseTemplate = {
  id: string
  title: string
  teacher: string
  room: string
  weekday: number
  start: string
  end: string
  enrolled: number
  capacity: number
  tone: "blue" | "green" | "amber" | "rose" | "slate"
}

type CourseEvent = CourseTemplate & {
  date: Date
}

type CourseCalendarViewProps = {
  role: CalendarRole
}

const dayFormatter = new Intl.DateTimeFormat(undefined, { weekday: "short" })
const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
})
const fullDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
})

const calendarStart = 8 * 60
const calendarEnd = 18 * 60
const slotMinutes = 30
const slotCount = (calendarEnd - calendarStart) / slotMinutes

const roleLabels: Record<CalendarRole, string> = {
  admin: "Administration",
  teacher: "Teacher",
  student: "Student",
}

const courseTemplates: CourseTemplate[] = [
  {
    id: "math-101",
    title: "Algebra I",
    teacher: "M. Keller",
    room: "Room 204",
    weekday: 1,
    start: "08:30",
    end: "10:00",
    enrolled: 16,
    capacity: 20,
    tone: "blue",
  },
  {
    id: "bio-201",
    title: "Biology Lab",
    teacher: "S. Novak",
    room: "Lab 2",
    weekday: 1,
    start: "13:00",
    end: "15:00",
    enrolled: 14,
    capacity: 16,
    tone: "green",
  },
  {
    id: "hist-120",
    title: "Modern History",
    teacher: "A. Rossi",
    room: "Room 118",
    weekday: 2,
    start: "10:30",
    end: "12:00",
    enrolled: 22,
    capacity: 26,
    tone: "amber",
  },
  {
    id: "lit-140",
    title: "Literature Seminar",
    teacher: "L. Morgan",
    room: "Room 311",
    weekday: 3,
    start: "09:00",
    end: "10:30",
    enrolled: 12,
    capacity: 18,
    tone: "rose",
  },
  {
    id: "chem-210",
    title: "Chemistry",
    teacher: "N. Dubois",
    room: "Lab 1",
    weekday: 4,
    start: "14:00",
    end: "16:00",
    enrolled: 18,
    capacity: 18,
    tone: "slate",
  },
  {
    id: "art-090",
    title: "Studio Art",
    teacher: "I. Meyer",
    room: "Studio",
    weekday: 5,
    start: "11:00",
    end: "12:30",
    enrolled: 10,
    capacity: 14,
    tone: "green",
  },
]

const toneClasses: Record<CourseTemplate["tone"], string> = {
  blue: "border-blue-300 bg-blue-50 text-blue-950 dark:border-blue-400/30 dark:bg-blue-400/15 dark:text-blue-50",
  green:
    "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-400/30 dark:bg-emerald-400/15 dark:text-emerald-50",
  amber:
    "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-400/30 dark:bg-amber-400/15 dark:text-amber-50",
  rose: "border-rose-300 bg-rose-50 text-rose-950 dark:border-rose-400/30 dark:bg-rose-400/15 dark:text-rose-50",
  slate:
    "border-slate-300 bg-slate-50 text-slate-950 dark:border-slate-400/30 dark:bg-slate-400/15 dark:text-slate-50",
}

export function CourseCalendarView({ role }: CourseCalendarViewProps) {
  const [weekStart, setWeekStart] = useState(() => getStartOfWeek(new Date()))
  const days = useMemo(() => getWeekDays(weekStart), [weekStart])
  const events = useMemo(() => getCourseEvents(days), [days])

  return (
    <main className="min-h-svh bg-background px-4 pt-16 pb-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarBlankIcon className="size-4" aria-hidden="true" />
              <span>{roleLabels[role]}</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-normal">
              Course calendar
            </h1>
            <p className="text-sm text-muted-foreground">
              {formatWeekRange(days)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setWeekStart(getStartOfWeek(new Date()))}
            >
              Today
            </Button>
            <div className="flex overflow-hidden rounded-4xl border border-border bg-background">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-none"
                aria-label="Previous week"
                onClick={() => setWeekStart((date) => addDays(date, -7))}
              >
                <CaretLeftIcon aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-none border-l border-border"
                aria-label="Next week"
                onClick={() => setWeekStart((date) => addDays(date, 7))}
              >
                <CaretRightIcon aria-hidden="true" />
              </Button>
            </div>
          </div>
        </header>

        <DesktopWeekCalendar days={days} events={events} />
        <MobileWeekCalendar days={days} events={events} />
      </div>
    </main>
  )
}

function DesktopWeekCalendar({
  days,
  events,
}: {
  days: Date[]
  events: CourseEvent[]
}) {
  return (
    <section className="hidden overflow-hidden rounded-lg border border-border bg-background lg:block">
      <div className="grid grid-cols-[4.5rem_repeat(7,minmax(0,1fr))] border-b border-border bg-muted/40">
        <div className="h-16 border-r border-border" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="flex h-16 min-w-0 flex-col justify-center border-r border-border px-3 last:border-r-0"
          >
            <span className="text-xs font-medium uppercase text-muted-foreground">
              {dayFormatter.format(day)}
            </span>
            <span className="truncate text-sm font-semibold">
              {dateFormatter.format(day)}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[4.5rem_repeat(7,minmax(0,1fr))]">
        <TimeColumn />
        {days.map((day) => (
          <DayColumn
            key={day.toISOString()}
            day={day}
            events={events.filter((event) => isSameDate(event.date, day))}
          />
        ))}
      </div>
    </section>
  )
}

function TimeColumn() {
  return (
    <div
      className="grid min-h-[720px] border-r border-border bg-muted/20"
      style={{ gridTemplateRows: `repeat(${slotCount}, minmax(36px, 1fr))` }}
    >
      {Array.from({ length: slotCount }).map((_, index) => (
        <div
          key={index}
          className="border-b border-border/70 pr-2 text-right text-[11px] leading-none text-muted-foreground last:border-b-0"
        >
          {index % 2 === 0 && (
            <span className="relative top-[-0.35rem]">
              {formatTime(calendarStart + index * slotMinutes)}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function DayColumn({ events }: { day: Date; events: CourseEvent[] }) {
  return (
    <div
      className="grid min-h-[720px] border-r border-border last:border-r-0"
      style={{ gridTemplateRows: `repeat(${slotCount}, minmax(36px, 1fr))` }}
    >
      {Array.from({ length: slotCount }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "col-start-1 border-b last:border-b-0",
            index % 2 === 0 ? "border-border/70" : "border-border/40"
          )}
        />
      ))}

      {events.map((event) => (
        <CourseEventBlock key={event.id} event={event} />
      ))}
    </div>
  )
}

function CourseEventBlock({ event }: { event: CourseEvent }) {
  return (
    <article
      className={cn(
        "z-10 col-start-1 m-1 overflow-hidden rounded-md border p-2 text-xs shadow-sm",
        toneClasses[event.tone]
      )}
      style={{
        gridRow: `${getSlotLine(event.start)} / ${getSlotLine(event.end)}`,
      }}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h2 className="truncate font-semibold">{event.title}</h2>
          <span className="shrink-0 font-medium">
            {event.enrolled}/{event.capacity}
          </span>
        </div>
        <p className="truncate opacity-80">
          {event.start}-{event.end}
        </p>
        <p className="truncate opacity-80">
          {event.teacher} · {event.room}
        </p>
      </div>
    </article>
  )
}

function MobileWeekCalendar({
  days,
  events,
}: {
  days: Date[]
  events: CourseEvent[]
}) {
  return (
    <div className="grid gap-3 lg:hidden">
      {days.map((day) => {
        const dayEvents = events.filter((event) => isSameDate(event.date, day))

        return (
          <section
            key={day.toISOString()}
            className="overflow-hidden rounded-lg border border-border bg-background"
          >
            <header className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold">
                  {dayFormatter.format(day)}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {fullDateFormatter.format(day)}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {dayEvents.length} courses
              </span>
            </header>

            <div className="grid gap-2 p-3">
              {dayEvents.length > 0 ? (
                dayEvents.map((event) => (
                  <CourseEventCard key={event.id} event={event} />
                ))
              ) : (
                <p className="px-1 py-4 text-sm text-muted-foreground">
                  No courses
                </p>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function CourseEventCard({ event }: { event: CourseEvent }) {
  return (
    <article
      className={cn("rounded-md border p-3 text-sm", toneClasses[event.tone])}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{event.title}</h3>
          <p className="truncate text-xs opacity-80">
            {event.start}-{event.end} · {event.room}
          </p>
          <p className="truncate text-xs opacity-80">{event.teacher}</p>
        </div>
        <span className="shrink-0 rounded-full bg-background/70 px-2 py-1 text-xs font-medium">
          {event.enrolled}/{event.capacity}
        </span>
      </div>
    </article>
  )
}

function getCourseEvents(days: Date[]): CourseEvent[] {
  return courseTemplates.map((template) => ({
    ...template,
    date: days[template.weekday - 1],
  }))
}

function getStartOfWeek(date: Date) {
  const nextDate = new Date(date)
  nextDate.setHours(0, 0, 0, 0)

  const day = nextDate.getDay()
  const diff = day === 0 ? -6 : 1 - day
  nextDate.setDate(nextDate.getDate() + diff)

  return nextDate
}

function getWeekDays(start: Date) {
  return Array.from({ length: 7 }, (_, index) => addDays(start, index))
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function isSameDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function formatWeekRange(days: Date[]) {
  const first = days[0]
  const last = days[days.length - 1]

  if (first.getFullYear() === last.getFullYear()) {
    return `${dateFormatter.format(first)}-${fullDateFormatter.format(last)}`
  }

  return `${fullDateFormatter.format(first)}-${fullDateFormatter.format(last)}`
}

function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60)
  return `${String(hours).padStart(2, "0")}:00`
}

function getSlotLine(time: string) {
  const minutes = timeToMinutes(time)
  const line = Math.round((minutes - calendarStart) / slotMinutes) + 1
  return Math.min(Math.max(line, 1), slotCount + 1)
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}
