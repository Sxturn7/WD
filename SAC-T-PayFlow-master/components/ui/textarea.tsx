import * as React from 'react'
import { cn } from '@/lib/utils'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-lg border border-[#d8d6d2] bg-[#f1efec] px-3 py-2 text-sm text-[#171717] placeholder:text-[#77716c] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-colors',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
