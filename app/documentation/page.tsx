// app/(routes)/documentation/page.tsx
import { DashboardHeader } from '../(dashboard)/dashboard/dashboard-components/dashboard-hearder'
import { DashboardShell } from '../(dashboard)/dashboard/dashboard-components/shell'
import { DocumentationContent } from './documentation-components/documentation-content'

export const metadata = {
  title: 'API Documentation - oKLocation',
  description: 'Documentation and guides for using the oKLocation API'
}

export default function DocumentationPage() {
  return (
    <DashboardShell>
      <DashboardHeader 
        heading="API Documentation"
        text="Learn how to use the oKLocation API."
      />
      <DocumentationContent />
    </DashboardShell>
  )
}