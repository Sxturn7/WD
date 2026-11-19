import { getAllClaims } from '@/actions/treasury'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { EmptyState } from '@/components/empty-state'
import { FilterTabs } from './filter-tabs'
import { ClaimRow } from './claim-row'
import { ExportButton } from './export-button'

interface PageProps {
  searchParams: Promise<{ filter?: string }>
}

export default async function QueuePage({ searchParams }: PageProps) {
  const { filter } = await searchParams
  const validFilter = ['pending', 'processing', 'completed'].includes(filter ?? '')
    ? (filter as 'pending' | 'processing' | 'completed')
    : undefined

  const claims = await getAllClaims(validFilter)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#171717]">Payment Queue</h1>
        <p className="text-base md:text-lg text-[#77716c] mt-2">
          Review, update, and process student prize payments
        </p>
      </div>

      <FilterTabs current={filter ?? 'all'} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Claims</CardTitle>
              <CardDescription className="text-base">{claims.length} result(s) — click any row to expand bank details</CardDescription>
            </div>
            <ExportButton claims={claims} />
          </div>
        </CardHeader>
        <CardContent>
          {claims.length === 0 ? (
            <EmptyState
              title="No claims found"
              description="No claims match the current filter"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e5e5e5]">
                    {['Student', 'Event', 'Position', 'Amount', 'Account No', 'IFSC', 'Status', ''].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-[#918b85] uppercase tracking-wider pb-3 pr-4 last:pr-0 pl-0 first:pl-2">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim) => (
                    <ClaimRow key={claim.id} claim={claim} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
