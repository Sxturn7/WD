'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-[#4338ca] text-white hover:bg-[#3730a3] shadow-sm',
        secondary:
          'border border-[#d8d6d2] bg-transparent text-[#262626] hover:bg-[#f1efec]',
        destructive: 'bg-red-600 text-white hover:bg-red-500 shadow-sm',
        ghost: 'hover:bg-[#f1efec] text-[#404040] hover:text-[#171717]',
        link: 'text-[#4338ca] underline-offset-4 hover:underline p-0 h-auto',
        outline:
          'border border-[#d8d6d2] bg-white text-[#262626] hover:bg-[#f1efec]',
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
