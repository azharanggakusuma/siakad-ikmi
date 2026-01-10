import { cn } from "@/lib/utils"
import SkeletonLib, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f1f5f9">
      <div
        className={cn("overflow-hidden leading-none", className)}
        {...props}
      >
        <SkeletonLib 
          containerClassName="block h-full w-full" 
          className="block h-full w-full" 
          height="100%"
          duration={1.5}
        />
      </div>
    </SkeletonTheme>
  )
}

export { Skeleton }