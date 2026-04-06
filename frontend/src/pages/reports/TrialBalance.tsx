/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import api from '../../lib/axios';

export function TrialBalance() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submittedDate, setSubmittedDate] = useState<string | null>(null);

  const { data: tb, isLoading } = useQuery({
    queryKey: ['trial-balance', submittedDate],
    queryFn: async () => {
      const res = await api.get('/reports/trial-balance', { params: { date: submittedDate } });
      return res.data.data;
    },
    enabled: !!submittedDate
  });

  const cols = [
    { header: 'Party Code', accessor: (p:any) => p.partyCode },
    { header: 'Name', accessor: (p:any) => <span className="font-medium text-surface-900">{p.partyName}</span> },
    { header: 'City', accessor: (p:any) => p.cityName },
    { header: 'Debit (Dr)', accessor: (p:any) => p.totalDr > 0 ? p.totalDr.toLocaleString() : '-', className: 'text-red-600 text-right' },
    { header: 'Credit (Cr)', accessor: (p:any) => p.totalCr > 0 ? p.totalCr.toLocaleString() : '-', className: 'text-green-600 text-right' },
  ];

  const handleFetch = (e: React.FormEvent) => {
    e.preventDefault();
    if (date) setSubmittedDate(date);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-surface-900">Trial Balance</h1>

      <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-sm">
        <form onSubmit={handleFetch} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 max-w-xs">
            <Input label="As of Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <Button type="submit" className="h-[42px]">Generate Report</Button>
        </form>
      </div>

      {tb && (
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-surface-200 bg-surface-50">
            <h2 className="font-semibold text-surface-900">Financial Year: {tb.financialYear}</h2>
          </div>
          
          <Table data={tb.entries || []} columns={cols} keyExtractor={(e:any) => e.partyId} isLoading={isLoading} />
          
          <div className="bg-white p-4 border-t border-surface-200">
            <div className="flex justify-between md:justify-end md:gap-24 font-bold text-lg">
              <span className="text-surface-700">Grand Totals:</span>
              <span className="text-red-700 text-right">{tb.grandTotalDr.toLocaleString()}</span>
              <span className="text-green-700 text-right w-32">{tb.grandTotalCr.toLocaleString()}</span>
            </div>
            {tb.netDifference > 0 && (
              <div className="flex justify-end mt-2 text-red-500 text-sm">
                Warning: Ledger out of balance by ₹{tb.netDifference.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
