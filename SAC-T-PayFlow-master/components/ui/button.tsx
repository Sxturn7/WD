'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm',
        secondary:
          'border border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800',
        destructive: 'bg-red-600 text-white hover:bg-red-500 shadow-sm',
        ghost: 'hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100',
        link: 'text-emerald-400 underline-offset-4 hover:underline p-0 h-auto',
        outline:
          'border border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800',
      },
      size: {
        default: 'h-12 px-6 py-2 text-base',
        sm: 'h-10 rounded-lg px-4 text-sm',
        lg: 'h-13 rounded-xl px-10 text-lg',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
