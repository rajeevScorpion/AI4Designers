import { Card } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConceptCardProps {
  icon: LucideIcon
  title: string
  description: string
  className?: string
}

export function ConceptCard({
  icon: Icon,
  title,
  description,
  className
}: ConceptCardProps) {
  return (
    <Card className={cn(
      "p-4 hover-elevate transition-all duration-200",
      className
    )}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-sm leading-tight">{title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </Card>
  )
}