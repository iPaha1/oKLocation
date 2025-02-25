// /app/blog/layout.tsx

import { Footer } from "@/components/ui/global/footer"
import Navbar from "../(home)/home-page-components/navbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}