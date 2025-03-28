"use client"

export default function Chart() {
  // This is a simplified chart component that doesn't use SVG stop tags directly
  return (
    <div className="w-full h-full flex items-end">
      {Array.from({ length: 24 }).map((_, i) => {
        const height = 20 + Math.random() * 60
        return (
          <div
            key={i}
            className="flex-1 bg-primary/20 mx-0.5 rounded-t-sm transition-all duration-500"
            style={{ height: `${height}%` }}
          />
        )
      })}
    </div>
  )
}

