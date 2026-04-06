import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import api from '../../lib/axios';

export function VatavReport() {
  const [from, setFrom] = useState('2024-04-01');
  const [to, setTo] = useState(new Date().toISOString().split('T')[0]);
  const [submittedArgs, setSubmittedArgs] = useState<{from: string, to: string} | null>(null);

  const { data: report, isLoading } = useQuery({
    queryKey: ['vatav-summary', submittedArgs],
    queryFn: async () => {
      const res = await api.get('/reports/vatav', { params: { from: submittedArgs?.from, to: submittedArgs?.to } });
      return res.data.data;
    },
    enabled: !!submittedArgs
  });

  const handleFetch = (e: React.FormEvent) => {
    e.preventDefault();
    if (from && to) setSubmittedArgs({ from, to });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-surface-900">Vatav Summary (Commission)</h1>

      <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-sm">
        <form onSubmit={handleFetch} className="flex flex-col sm:flex-row gap-4 items-end">
          <Input label="From Date" type="date" value={from} onChange={e => setFrom(e.target.value)} required />
          <Input label="To Date" type="date" value={to} onChange={e => setTo(e.target.value)} required />
          <Button type="submit" className="h-[42px] px-8" isLoading={isLoading}>Analyze</Button>
        </form>
      </div>

      {report && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-sm text-center">
            <h3 className="text-surface-500 font-medium">Txns Processed</h3>
            <p className="text-4xl font-bold text-surface-900 mt-4">{report.transactionCount}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-sm text-center">
            <h3 className="text-surface-500 font-medium">Total Volume Moved</h3>
            <p className="text-3xl font-black text-emerald-600 mt-4">₹ {report.totalVolume.toLocaleString()}</p>
          </div>

          <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 shadow-sm text-center">
            <h3 className="text-amber-800 font-bold">Total Vatav Earned</h3>
            <p className="text-4xl font-black text-amber-600 mt-4">₹ {report.totalVatavEarned.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
