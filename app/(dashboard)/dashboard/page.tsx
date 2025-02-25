// app/(dashboard)/dashboard/page.tsx
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { DashboardShell } from './dashboard-components/shell'
import { DashboardHeader } from './dashboard-components/dashboard-hearder'
import { LoadingPage } from '@/components/ui/global/loading'
import { ApiUsageChart } from './dashboard-components/api-usage-chart'
import ApiKeysManager from './dashboard-components/api-management'


export const metadata = {
  title: 'Dashboard',
  description: 'Manage your API keys and monitor usage',
}

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <DashboardShell>
      <DashboardHeader 
        heading="Dashboard"
        text="Manage your API keys and monitor usage."
      />
      
      <div className="grid gap-8">
        <Suspense fallback={<LoadingPage />}>
          <ApiUsageChart />
        </Suspense>

        <Suspense fallback={<LoadingPage />}>
          <ApiKeysManager />
        </Suspense>
      </div>
    </DashboardShell>
  )
}







// // /app/(dashboard)/dashboard/page.tsx
// import { Suspense } from 'react'
// import { redirect } from 'next/navigation'

// import { auth } from '@clerk/nextjs/server'
// import { ApiKeyList } from './dashboard-components/api-key-list'
// import { DashboardShell } from './dashboard-components/shell'
// import { DashboardHeader } from './dashboard-components/dashboard-hearder'
// import { LoadingPage } from '@/components/ui/global/loading'
// import { ApiUsageChart } from './dashboard-components/api-usage-chart'
// import ApiKeysManager from './dashboard-components/api-management'

// export const metadata = {
//   title: 'Dashboard',
//   description: 'Manage your API keys and monitor usage',
// }

// export default async function DashboardPage() {
//   const { userId } = await auth()

//   if (!userId) {
//     redirect('/sign-in')
//   }

//   return (
//     <DashboardShell>
//       <DashboardHeader 
//         heading="Dashboard"
//         text="Manage your API keys and monitor usage."
//       />
      
//       <div className="grid gap-8">
//         <Suspense fallback={<LoadingPage />}>
//           <ApiUsageChart />
//           <ApiKeysManager />
//         </Suspense>

//         <div className="grid gap-4">
//           <h2 className="text-2xl font-bold tracking-tight">API Keys</h2>
//           <Suspense fallback={<LoadingPage />}>
//             <ApiKeyList />
//           </Suspense>
//         </div>
//       </div>
//     </DashboardShell>
//   )
// }
