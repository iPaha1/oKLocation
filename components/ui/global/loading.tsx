
// src/components/loading.tsx
export function LoadingPage() {
    return (
      <div className="flex h-[450px] shrink-0 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted-foreground border-t-primary"></div>
      </div>
    )
  }