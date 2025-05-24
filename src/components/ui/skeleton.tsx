import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-md bg-foreground/5 dark:bg-card", className)}
      {...props}
    />
  )
}

export { Skeleton }
