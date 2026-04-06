import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, ArrowDownRight, Users, Activity } from 'lucide-react';

export function Dashboard() {

  // Fetch summary stats, useQuery handles caching and deduping
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: async () => {
      // Stubbing API call response based on the backend stats pattern
      return {
        activeParties: 124,
        todayTxnCount: 42,
        todayVolume: 2450000.00,
        todayVatav: 6125.00
      };
    }
  });

  const cards = [
    { name: 'Active Parties', value: stats?.activeParties ?? '-', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Today Transactions', value: stats?.todayTxnCount ?? '-', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Today Volume', value: `₹ ${stats?.todayVolume?.toLocaleString() ?? '-'}`, icon: ArrowUpRight, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Today Vatav Earned', value: `₹ ${stats?.todayVatav?.toLocaleString() ?? '-'}`, icon: ArrowDownRight, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="p-6 bg-white rounded-xl border border-surface-200 shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-lg ${card.bg}`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-surface-500">{card.name}</p>
                <p className="text-2xl font-bold text-surface-900 mt-1">
                  {isLoading ? '...' : card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-8 mt-8 bg-primary-50 rounded-xl border border-primary-100 text-center">
        <h2 className="text-xl font-semibold text-primary-800">Welcome to Angadia Pedhi</h2>
        <p className="text-primary-600 mt-2">The frontend foundation is complete. Next, we will connect the real API endpoints to the tables.</p>
      </div>
    </div>
  );
}
