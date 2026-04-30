import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type DayPickerProps } from "react-day-picker"
import { zhCN } from "date-fns/locale"

import { cn } from "@/lib/utils"

export type CalendarProps = DayPickerProps

type View = "day" | "month" | "year"

const MONTH_LABELS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]

function getInitialMonth(props: CalendarProps): Date {
  if (props.month) return props.month
  if (props.defaultMonth) return props.defaultMonth
  if (props.mode === "single" && props.selected instanceof Date) return props.selected
  return new Date()
}

function NavButton({
  onClick,
  ariaLabel,
  children,
}: {
  onClick: () => void
  ariaLabel: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  )
}

function HeaderBar({
  left,
  right,
  center,
}: {
  left?: React.ReactNode
  right?: React.ReactNode
  center: React.ReactNode
}) {
  return (
    <div className="relative flex h-8 items-center justify-center">
      <div className="absolute left-0">{left}</div>
      <div className="flex items-center gap-1.5 text-sm font-medium">{center}</div>
      <div className="absolute right-0">{right}</div>
    </div>
  )
}

function CaptionButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center rounded-md px-2 py-0.5 text-sm font-medium transition-colors hover:bg-muted"
    >
      {children}
    </button>
  )
}

function MonthGrid({
  selectedMonth,
  onPick,
}: {
  selectedMonth?: number
  onPick: (m: number) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-2 px-1 py-2">
      {MONTH_LABELS.map((label, i) => {
        const isSelected = selectedMonth === i
        return (
          <button
            key={label}
            type="button"
            onClick={() => onPick(i)}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-md text-sm transition-colors",
              isSelected
                ? "bg-primary text-primary-foreground hover:bg-primary"
                : "hover:bg-muted",
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

function YearGrid({
  centerYear,
  selectedYear,
  onPick,
}: {
  centerYear: number
  selectedYear?: number
  onPick: (y: number) => void
}) {
  const start = centerYear - (centerYear % 12)
  const years = Array.from({ length: 12 }, (_, i) => start + i)
  return (
    <div className="grid grid-cols-3 gap-2 px-1 py-2">
      {years.map((y) => {
        const isSelected = selectedYear === y
        return (
          <button
            key={y}
            type="button"
            onClick={() => onPick(y)}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-md text-sm tabular-nums transition-colors",
              isSelected
                ? "bg-primary text-primary-foreground hover:bg-primary"
                : "hover:bg-muted",
            )}
          >
            {y}
          </button>
        )
      })}
    </div>
  )
}

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  const [view, setView] = React.useState<View>("day")
  const [month, setMonth] = React.useState<Date>(() => getInitialMonth(props))

  const selectedDate =
    props.mode === "single" && props.selected instanceof Date ? (props.selected as Date) : undefined

  const goPrevYearPage = () => {
    setMonth(new Date(month.getFullYear() - 12, month.getMonth(), 1))
  }
  const goNextYearPage = () => {
    setMonth(new Date(month.getFullYear() + 12, month.getMonth(), 1))
  }

  if (view === "year") {
    const start = month.getFullYear() - (month.getFullYear() % 12)
    return (
      <div className={cn("p-1 text-sm w-[16rem]", className)}>
        <HeaderBar
          left={
            <NavButton onClick={goPrevYearPage} ariaLabel="上一组年份">
              <ChevronLeft className="size-4" />
            </NavButton>
          }
          right={
            <NavButton onClick={goNextYearPage} ariaLabel="下一组年份">
              <ChevronRight className="size-4" />
            </NavButton>
          }
          center={
            <button
              type="button"
              onClick={() => setView("day")}
              className="inline-flex items-center rounded-md px-2 py-0.5 transition-colors hover:bg-muted"
            >
              {start}–{start + 11}
            </button>
          }
        />
        <YearGrid
          centerYear={month.getFullYear()}
          selectedYear={selectedDate?.getFullYear()}
          onPick={(y) => {
            setMonth(new Date(y, month.getMonth(), 1))
            setView("month")
          }}
        />
      </div>
    )
  }

  if (view === "month") {
    const goPrevYear = () => setMonth(new Date(month.getFullYear() - 1, month.getMonth(), 1))
    const goNextYear = () => setMonth(new Date(month.getFullYear() + 1, month.getMonth(), 1))
    return (
      <div className={cn("p-1 text-sm w-[16rem]", className)}>
        <HeaderBar
          left={
            <NavButton onClick={goPrevYear} ariaLabel="上一年">
              <ChevronLeft className="size-4" />
            </NavButton>
          }
          right={
            <NavButton onClick={goNextYear} ariaLabel="下一年">
              <ChevronRight className="size-4" />
            </NavButton>
          }
          center={
            <button
              type="button"
              onClick={() => setView("year")}
              className="inline-flex items-center rounded-md px-2 py-0.5 transition-colors hover:bg-muted"
            >
              {month.getFullYear()}年
            </button>
          }
        />
        <MonthGrid
          selectedMonth={selectedDate?.getFullYear() === month.getFullYear() ? selectedDate?.getMonth() : undefined}
          onPick={(m) => {
            setMonth(new Date(month.getFullYear(), m, 1))
            setView("day")
          }}
        />
      </div>
    )
  }

  return (
    <DayPicker
      locale={zhCN}
      showOutsideDays={showOutsideDays}
      month={month}
      onMonthChange={setMonth}
      className={cn("p-1 text-sm", className)}
      classNames={{
        months: "relative flex flex-col gap-3",
        month: "flex flex-col gap-3",
        month_caption: "flex h-8 items-center justify-center gap-1 px-10",
        caption_label: "hidden",
        nav: "absolute inset-x-1 top-0 flex h-8 items-center justify-between pointer-events-none",
        button_previous:
          "pointer-events-auto inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40",
        button_next:
          "pointer-events-auto inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "flex-1 text-center text-[11px] font-medium text-muted-foreground",
        week: "flex w-full mt-1",
        day: "flex-1 p-0 text-center",
        day_button:
          "inline-flex size-9 items-center justify-center rounded-md text-sm font-normal transition-colors hover:bg-muted aria-selected:opacity-100",
        range_start: "rounded-l-md",
        range_end: "rounded-r-md",
        selected:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground",
        today: "[&>button]:font-semibold [&>button]:text-primary",
        outside: "[&>button]:text-muted-foreground/50",
        disabled: "[&>button]:opacity-40 [&>button]:pointer-events-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...rest }) => {
          if (orientation === "right") return <ChevronRight className="size-4" {...rest} />
          return <ChevronLeft className="size-4" {...rest} />
        },
        MonthCaption: () => (
          <div className="flex h-8 w-full items-center justify-center gap-1.5">
            <CaptionButton onClick={() => setView("year")}>
              {month.getFullYear()}年
            </CaptionButton>
            <CaptionButton onClick={() => setView("month")}>
              {MONTH_LABELS[month.getMonth()]}
            </CaptionButton>
          </div>
        ),
      }}
      {...props}
    />
  )
}

export { Calendar }
