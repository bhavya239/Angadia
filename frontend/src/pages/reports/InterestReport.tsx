/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import api from '../../lib/axios';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function InterestReport() {
  const [from, setFrom] = useState('2024-04-01');
  const [to, setTo] = useState(new Date().toISOString().split('T')[0]);
  const [submittedArgs, setSubmittedArgs] = useState<{from: string, to: string} | null>(null);

  const { data: report, isLoading } = useQuery({
    queryKey: ['interest-report', submittedArgs],
    queryFn: async () => {
      const res = await api.get('/reports/interest', { params: { from: submittedArgs?.from, to: submittedArgs?.to } });
      return res.data.data;
    },
    enabled: !!submittedArgs
  });

  const handleFetch = (e: React.FormEvent) => {
    e.preventDefault();
    if (from && to) setSubmittedArgs({ from, to });
  };

  const cols = [
    { header: 'Party Code', accessor: (p:any) => p.partyCode },
    { header: 'Name', accessor: (p:any) => <span className="font-medium text-surface-900">{p.partyName}</span> },
    { header: 'CR/DR ROI (%)', accessor: (p:any) => `${p.crRoi} / ${p.drRoi}` },
    { header: 'Earned (Payable)', accessor: (p:any) => p.interestEarned > 0 ? p.interestEarned.toLocaleString() : '-', className: 'text-surface-600' },
    { header: 'Charged (Receivable)', accessor: (p:any) => p.interestCharged > 0 ? p.interestCharged.toLocaleString() : '-', className: 'text-surface-600' },
    { header: 'Net Interest', accessor: (p:any) => (
      <span className={p.netInterest > 0 ? 'text-red-600 font-bold' : (p.netInterest < 0 ? 'text-green-600 font-bold' : 'text-surface-400')}>
        {p.netInterest !== 0 ? Math.abs(p.netInterest).toLocaleString() : '-'}
        {p.netInterest > 0 ? ' Pay' : (p.netInterest < 0 ? ' Recv' : '')}
      </span>
    )},
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-surface-900">Interest Generation Report</h1>

      <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-sm">
        <form onSubmit={handleFetch} className="flex flex-col sm:flex-row gap-4 items-end">
          <Input label="From Date" type="date" value={from} onChange={e => setFrom(e.target.value)} required />
          <Input label="To Date" type="date" value={to} onChange={e => setTo(e.target.value)} required />
          <Button type="submit" className="h-[42px] px-8 bg-indigo-600 hover:bg-indigo-700" isLoading={isLoading}>Compute Cycle</Button>
        </form>
      </div>

      {report && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 p-6 rounded-xl border border-red-100 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-red-800 font-bold text-sm">Total Interest Payable</h3>
                <p className="text-3xl font-black text-red-600 mt-2">₹ {report.totalInterestPayable.toLocaleString()}</p>
              </div>
              <TrendingDown className="w-12 h-12 text-red-200" />
            </div>
            
            <div className="bg-green-50 p-6 rounded-xl border border-green-100 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-green-800 font-bold text-sm">Total Interest Receivable</h3>
                <p className="text-3xl font-black text-green-600 mt-2">₹ {report.totalInterestReceivable.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <Table data={report.entries || []} columns={cols} keyExtractor={(e:any) => e.partyId} />
        </div>
      )}
    </div>
  );
}
