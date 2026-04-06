/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Plus, Search } from 'lucide-react';
import api from '../../lib/axios';

export function PartyList() {
  const [term, setTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(term);
      setPage(0); // Reset page on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [term]);

  const { data, isLoading } = useQuery({
    queryKey: ['parties', debouncedTerm, page],
    queryFn: async () => {
      const res = await api.get('/parties', { params: { term: debouncedTerm, page, size: 10 } });
      return res.data.data; // Page object structure
    }
  });

  const columns = [
    { header: 'Code', accessor: (p: any) => <span className="uppercase text-gray-500 font-mono text-sm">{p.partyCode}</span> },
    { header: 'Name', accessor: (p: any) => <span className="font-semibold text-surface-900">{p.name}</span> },
    { header: 'City', accessor: (p: any) => p.cityName },
    { header: 'Mobile', accessor: (p: any) => p.phone },
    { header: 'Opening Bal', accessor: (p: any) => {
      // Color logic: Green -> positive (CR), Red -> negative (DR)
      const isPositive = p.openingBalanceType === 'CR';
      return (
        <span className={`px-2 py-1 rounded w-24 inline-block text-right ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {p.openingBalance} {p.openingBalanceType}
        </span>
      );
    }},
    { header: 'Actions', accessor: (_: any) => (
      <Button variant="secondary">Edit</Button>
    )}
  ];

  const content = data?.content || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-surface-900">Party Management</h1>
        <Button className="w-full sm:w-auto shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Quick Add (Enter)
        </Button>
      </div>

      <div className="bg-white p-3 rounded-xl border border-surface-200 shadow-sm flex items-center gap-3 sticky top-4 z-10">
        <Search className="w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search instantly by code, name, or mobile..."
          className="flex-1 focus:outline-none text-surface-900 text-lg w-full"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          autoFocus
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden">
        <div className="max-h-[60vh] overflow-y-auto">
          <Table 
            data={content} 
            columns={columns} 
            keyExtractor={(p: any) => p.id} 
            isLoading={isLoading} 
          />
        </div>
        
        {/* Pagination Controls */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
           <span className="text-sm text-gray-700">
             Showing Page {page + 1} of {Math.max(1, totalPages)} (Total {data?.totalElements || 0} records)
           </span>
           <div className="flex gap-2">
             <Button variant="secondary" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Previous</Button>
             <Button variant="secondary" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>Next</Button>
           </div>
        </div>
      </div>
    </div>
  );
}
