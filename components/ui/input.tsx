'use client'

import * as React from 'react'
import { CalendarDays, X } from 'lucide-react'

import { cn } from '@/lib/utils'

const clearableTypes = new Set([
  undefined,
  '',
  'text',
  'search',
  'email',
  'tel',
  'url',
  'number',
  'password',
  'date',
  'datetime-local',
  'month',
  'time',
  'week',
])

function Input({
  className,
  type,
  value,
  defaultValue,
  disabled,
  readOnly,
  onChange,
  ...props
}: React.ComponentProps<'input'>) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue ?? '')
  const nativePickerTypes = ['date', 'datetime-local', 'month', 'time', 'week']
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : uncontrolledValue
  const hasNativePicker = nativePickerTypes.includes(type ?? '')
  const isClearable =
    clearableTypes.has(type) &&
    !disabled &&
    !readOnly &&
    String(currentValue ?? '').length > 0

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setUncontrolledValue(event.target.value)
    }

    onChange?.(event)
  }

  const handleClear = () => {
    const input = inputRef.current

    if (!input) {
      return
    }

    const nativeValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set

    nativeValueSetter?.call(input, '')
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.focus()

    if (!isControlled) {
      setUncontrolledValue('')
    }
  }

  return (
    <div className="relative w-full">
      {hasNativePicker && (
        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      )}
      <input
        ref={inputRef}
        type={type}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        readOnly={readOnly}
        onChange={handleChange}
        data-slot="input"
        className={cn(
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          hasNativePicker && 'pl-9 bg-secondary/20 font-medium text-foreground',
          isClearable && (hasNativePicker ? 'pr-16' : 'pr-9'),
          hasNativePicker &&
            '[&::-webkit-calendar-picker-indicator]:mr-1 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100',
          className,
        )}
        {...props}
      />
      {isClearable && (
        <button
          type="button"
          aria-label="清除输入"
          className={cn(
            'text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-sm transition-colors focus-visible:ring-[3px] focus-visible:outline-none',
            hasNativePicker ? 'right-9' : 'right-2'
          )}
          onClick={handleClear}
          tabIndex={-1}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

export { Input }
