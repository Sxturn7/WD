import { FileX } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#f1efec] border border-[#d8d6d2] flex items-center justify-center mb-5">
        <FileX className="h-8 w-8 text-[#77716c]" />
      </div>
      <h3 className="text-xl font-semibold text-[#404040]">{title}</h3>
      {description && (
        <p className="text-base text-[#77716c] mt-2 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
