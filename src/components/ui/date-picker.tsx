import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format, isValid, parseISO } from "date-fns"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface DatePickerProps {
  value?: string
  onChange?: (value: string) => void
  className?: string
  disabled?: boolean
  id?: string
}

type Segments = { year: string; month: string; day: string }

const EMPTY: Segments = { year: "", month: "", day: "" }

function fromIso(value?: string): Date | undefined {
  if (!value) return undefined
  const d = parseISO(value)
  return isValid(d) ? d : undefined
}

function isoToSegments(value?: string): Segments {
  const d = fromIso(value)
  if (!d) return EMPTY
  return {
    year: format(d, "yyyy"),
    month: format(d, "MM"),
    day: format(d, "dd"),
  }
}

function segmentsToIso(segs: Segments): string | undefined {
  const { year, month, day } = segs
  if (year.length !== 4 || month.length === 0 || day.length === 0) return undefined
  const y = Number(year)
  const m = Number(month)
  const d = Number(day)
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return undefined
  if (m < 1 || m > 12 || d < 1 || d > 31) return undefined
  const date = new Date(y, m - 1, d)
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return undefined
  return format(date, "yyyy-MM-dd")
}

type Field = "year" | "month" | "day"

export function DatePicker({ value, onChange, className, disabled, id }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [segs, setSegsState] = React.useState<Segments>(() => isoToSegments(value))
  const segsRef = React.useRef<Segments>(segs)
  const lastEmittedRef = React.useRef<string | undefined>(value)

  const setSegs = React.useCallback((next: Segments) => {
    segsRef.current = next
    setSegsState(next)
  }, [])

  const yearRef = React.useRef<HTMLInputElement>(null)
  const monthRef = React.useRef<HTMLInputElement>(null)
  const dayRef = React.useRef<HTMLInputElement>(null)

  const refs: Record<Field, React.RefObject<HTMLInputElement | null>> = {
    year: yearRef,
    month: monthRef,
    day: dayRef,
  }
  const order: Field[] = ["year", "month", "day"]
  const maxLen: Record<Field, number> = { year: 4, month: 2, day: 2 }

  React.useEffect(() => {
    if (value === lastEmittedRef.current) return
    lastEmittedRef.current = value
    setSegs(isoToSegments(value))
  }, [value, setSegs])

  const emit = React.useCallback(
    (next: Segments) => {
      const iso = segmentsToIso(next)
      if (iso) {
        lastEmittedRef.current = iso
        onChange?.(iso)
      } else if (!next.year && !next.month && !next.day) {
        lastEmittedRef.current = ""
        onChange?.("")
      }
    },
    [onChange],
  )

  const shouldAdvance = (field: Field, cleaned: string): boolean => {
    if (cleaned.length >= maxLen[field]) return true
    if (cleaned.length === 1) {
      const d = cleaned.charCodeAt(0) - 48
      if (field === "month") return d >= 2
      if (field === "day") return d >= 4
    }
    return false
  }

  const maxDayInContext = (): number => {
    const { year, month } = segsRef.current
    if (year.length === 4 && month.length === 2) {
      const y = Number(year)
      const m = Number(month)
      if (m >= 1 && m <= 12) {
        return new Date(y, m, 0).getDate()
      }
    }
    return 31
  }

  const isValidPartial = (field: Field, draft: string): boolean => {
    if (field === "year") return /^\d{0,4}$/.test(draft)
    if (draft.length === 0) return true
    if (draft.length === 1) return /^[0-9]$/.test(draft)
    if (draft.length === 2) {
      const n = Number(draft)
      if (field === "month") return n >= 1 && n <= 12
      if (field === "day") return n >= 1 && n <= maxDayInContext()
    }
    return false
  }

  const setFieldValue = (field: Field, value: string) => {
    const next = { ...segsRef.current, [field]: value }
    if (field === "year" || field === "month") {
      if (next.year.length === 4 && next.month.length === 2 && next.day.length === 2) {
        const y = Number(next.year)
        const m = Number(next.month)
        if (m >= 1 && m <= 12) {
          const max = new Date(y, m, 0).getDate()
          const dn = Number(next.day)
          if (dn > max) next.day = String(max).padStart(2, "0")
        }
      }
    }
    setSegs(next)
    emit(next)
    return next
  }

  const advance = (field: Field) => {
    const idx = order.indexOf(field)
    if (idx < order.length - 1) refs[order[idx + 1]].current?.focus()
  }

  const goPrev = (field: Field) => {
    const idx = order.indexOf(field)
    if (idx > 0) refs[order[idx - 1]].current?.focus()
  }

  const padOnBlur = (field: Field) => {
    if (field === "year") return
    const cur = segsRef.current[field]
    if (cur.length === 1) {
      const padded = cur === "0" ? "01" : cur.padStart(2, "0")
      setFieldValue(field, padded)
    }
  }

  const handleKeyDown = (field: Field) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.currentTarget

    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault()
      const cur = segsRef.current[field]
      const isAllSelected =
        target.selectionStart === 0 && target.selectionEnd === target.value.length && target.value.length > 0
      const startFresh = cur.length >= maxLen[field] || isAllSelected
      const draft = startFresh ? e.key : cur + e.key
      const cleaned = draft.slice(0, maxLen[field])
      if (!isValidPartial(field, cleaned)) return
      setFieldValue(field, cleaned)
      if (shouldAdvance(field, cleaned)) advance(field)
      return
    }

    if (e.key === "Backspace") {
      e.preventDefault()
      const cur = segsRef.current[field]
      if (cur.length > 0) {
        const isAllSelected =
          target.selectionStart === 0 && target.selectionEnd === target.value.length
        setFieldValue(field, isAllSelected ? "" : cur.slice(0, -1))
      } else {
        goPrev(field)
      }
      return
    }

    if (e.key === "ArrowLeft" && target.selectionStart === 0) {
      e.preventDefault()
      goPrev(field)
    } else if (
      e.key === "ArrowRight" &&
      target.selectionEnd === target.value.length
    ) {
      e.preventDefault()
      advance(field)
    } else if (e.key === "/" || e.key === "-" || e.key === "." || e.key === " ") {
      e.preventDefault()
      advance(field)
    }
  }

  const noopChange = () => {}

  const selected = fromIso(value)

  const segInputClass =
    "bg-transparent text-center tabular-nums outline-none placeholder:text-muted-foreground/70 disabled:cursor-not-allowed"

  const selectOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const el = e.currentTarget
    requestAnimationFrame(() => el.select())
  }

  const focusFirstEmptyOrLast = () => {
    for (const f of order) {
      if (segsRef.current[f].length < maxLen[f]) {
        refs[f].current?.focus()
        return
      }
    }
    refs[order[order.length - 1]].current?.focus()
  }

  const handleContainerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (target.tagName === "INPUT" || target.tagName === "BUTTON" || target.closest("button")) return
    e.preventDefault()
    focusFirstEmptyOrLast()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div
        onMouseDown={handleContainerMouseDown}
        className={cn(
          "flex h-9 w-full cursor-text items-center gap-1 rounded-lg border border-[#86868b] bg-background pl-3 pr-1 text-sm shadow-none transition-[color,box-shadow]",
          "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
          disabled && "cursor-not-allowed opacity-50",
          "dark:bg-transparent",
          className,
        )}
      >
        <div className="flex flex-1 items-center">
          <input
            id={id}
            ref={yearRef}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            disabled={disabled}
            placeholder="YYYY"
            value={segs.year}
            onChange={noopChange}
            onKeyDown={handleKeyDown("year")}
            onFocus={selectOnFocus}
            className={cn(segInputClass, "w-12")}
            aria-label="年"
          />
          <span className="mx-0.5 text-muted-foreground/70">/</span>
          <input
            ref={monthRef}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            disabled={disabled}
            placeholder="MM"
            value={segs.month}
            onChange={noopChange}
            onKeyDown={handleKeyDown("month")}
            onBlur={() => padOnBlur("month")}
            onFocus={selectOnFocus}
            className={cn(segInputClass, "w-7")}
            aria-label="月"
          />
          <span className="mx-0.5 text-muted-foreground/70">/</span>
          <input
            ref={dayRef}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            disabled={disabled}
            placeholder="DD"
            value={segs.day}
            onChange={noopChange}
            onKeyDown={handleKeyDown("day")}
            onBlur={() => padOnBlur("day")}
            onFocus={selectOnFocus}
            className={cn(segInputClass, "w-7")}
            aria-label="日"
          />
        </div>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label="打开日历"
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none"
          >
            <CalendarIcon className="size-4" aria-hidden />
          </button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-auto p-2" align="end">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            if (!date) return
            const next = {
              year: format(date, "yyyy"),
              month: format(date, "MM"),
              day: format(date, "dd"),
            }
            setSegs(next)
            onChange?.(format(date, "yyyy-MM-dd"))
            setOpen(false)
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
