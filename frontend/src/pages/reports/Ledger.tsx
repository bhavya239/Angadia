/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import api from '../../lib/axios';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function Ledger() {
  const [partyId, setPartyId] = useState('');
  const [from, setFrom] = useState('2024-04-01');
  const [to, setTo] = useState(new Date().toISOString().split('T')[0]);
  const [submittedArgs, setSubmittedArgs] = useState<{ id: string, from: string, to: string } | null>(null);

  const { data: parties } = useQuery({
    queryKey: ['parties_select'],
    queryFn: async () => (await api.get('/parties')).data.data.content
  });

  const { data: ledger, isLoading } = useQuery({
    queryKey: ['ledger', submittedArgs],
    queryFn: async () => {
      const res = await api.get(`/parties/${submittedArgs?.id}/ledger`, {
        params: { from: submittedArgs?.from, to: submittedArgs?.to }
      });
      return res.data.data;
    },
    enabled: !!submittedArgs
  });

  const handleFetch = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (partyId && from && to) {
      setSubmittedArgs({ id: partyId, from, to });
    }
  };

  const cols = [
    { header: 'Date', accessor: (e:any) => e.date },
    { header: 'Particulars', accessor: (e:any) => e.particulars },
    { header: 'Debit (Dr)', accessor: (e:any) => e.drAmount > 0 ? e.drAmount.toLocaleString() : '-', className: 'text-red-600' },
    { header: 'Credit (Cr)', accessor: (e:any) => e.crAmount > 0 ? e.crAmount.toLocaleString() : '-', className: 'text-green-600' },
    { header: 'Running Bal.', accessor: (e:any) => (
      <span className={e.balanceType === 'CR' ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>
        {e.runningBalance.toLocaleString()} {e.balanceType}
      </span>
    )}
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-surface-900">Ledger View</h1>

      {/* Query Filter */}
      <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-sm">
        <form onSubmit={handleFetch} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-1.5">
            <label className="block text-sm font-medium text-surface-700">Select Party</label>
            <select 
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              required
            >
              <option value="">Search Party...</option>
              {parties?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="w-full md:w-auto">
            <Input label="From Date" type="date" value={from} onChange={e => setFrom(e.target.value)} required />
          </div>
          <div className="w-full md:w-auto">
            <Input label="To Date" type="date" value={to} onChange={e => setTo(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full md:w-auto h-[42px]">Generate Ledger</Button>
        </form>
      </div>

      {ledger && (
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
          {/* Header Info */}
          <div className="p-6 border-b border-surface-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-50">
            <div>
              <h2 className="text-xl font-bold text-surface-900">{ledger.partyName} ({ledger.partyCode})</h2>
              <p className="text-sm text-surface-500 mt-1">City: {ledger.cityName} | Range: {ledger.fromDate} to {ledger.toDate}</p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-surface-500">Opening Balance</p>
                <p className={`text-lg font-bold ${ledger.openingBalanceType === 'CR' ? 'text-green-600' : 'text-red-600'}`}>
                  {ledger.openingBalance} {ledger.openingBalanceType}
                </p>
              </div>
              <div className="text-right pl-6 border-l border-surface-300">
                <p className="text-sm text-surface-500">Closing Balance</p>
                <p className={`text-2xl font-black ${ledger.closingBalanceType === 'CR' ? 'text-green-700' : 'text-red-700'}`}>
                  {ledger.closingBalance.toLocaleString()} {ledger.closingBalanceType}
                </p>
              </div>
            </div>
          </div>

          {/* Ledger Entries */}
          <Table 
            data={ledger.entries || []}
            columns={cols}
            keyExtractor={(e:any) => e.txnNumber || e.date + e.drAmount}
            isLoading={isLoading}
          />

          {/* Totals Footer */}
          <div className="bg-surface-100 p-4 border-t border-surface-200 flex justify-end gap-12 font-bold text-lg">
            <div className="flex items-center gap-2 text-red-600">
              <ArrowUpRight className="w-5 h-5" /> Total DR: {ledger.totalDr.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <ArrowDownRight className="w-5 h-5" /> Total CR: {ledger.totalCr.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
