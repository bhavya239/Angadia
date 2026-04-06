/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

const txnSchema = z.object({
  txnDate: z.string().min(1, 'Date required'),
  senderId: z.string().min(1, 'Sender required'),
  receiverId: z.string().min(1, 'Receiver required'),
  amount: z.coerce.number().min(1, 'Amount must be > 0'),
  vatavRate: z.coerce.number().min(0, 'Vatav rate cannot be negative'),
  narration: z.string().optional(),
});

type TxnForm = z.infer<typeof txnSchema>;

export function TransactionEntry() {
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);
  
  // Real-time UI calculations
  const [vatavPreview, setVatavPreview] = useState(0);

  const { register, handleSubmit, watch, reset, setFocus, formState: { errors } } = useForm<any>({
    resolver: zodResolver(txnSchema),
    defaultValues: {
      txnDate: new Date().toISOString().split('T')[0],
      vatavRate: 0.25,
    }
  });

  const amountWatch = watch('amount');
  const vatavRateWatch = watch('vatavRate');

  useEffect(() => {
    if (amountWatch && vatavRateWatch) {
      setVatavPreview((Number(amountWatch) * Number(vatavRateWatch)) / 100);
    } else {
      setVatavPreview(0);
    }
  }, [amountWatch, vatavRateWatch]);

  // Enter-key fast navigation constraint
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const form = formRef.current;
      if (!form) return;
      const elements = Array.from(form.elements) as HTMLElement[];
      const index = elements.indexOf(e.target as HTMLElement);
      // Skip over disabled/hidden elements
      let nextIndex = index + 1;
      while (nextIndex < elements.length && 
            (elements[nextIndex].tagName === 'BUTTON' || (elements[nextIndex] as HTMLInputElement).disabled)) {
        nextIndex++;
      }
      if (nextIndex < elements.length && elements[nextIndex].tagName !== 'BUTTON') {
        elements[nextIndex].focus();
      } else {
        // Submit if end of form
        handleSubmit(onSubmit)();
      }
    }
  };

  // Queries
  const { data: parties } = useQuery({
    queryKey: ['parties_list'],
    queryFn: async () => (await api.get('/parties')).data.data.content
  });

  const { data: daybook, isLoading: loadDaybook } = useQuery({
    queryKey: ['daybook'],
    queryFn: async () => (await api.get('/transactions/daybook')).data.data
  });

  const mutCreate = useMutation({
    mutationFn: (data: TxnForm) => api.post('/transactions', data),
    onSuccess: () => {
      toast.success('Transaction Saved!');
      queryClient.invalidateQueries({ queryKey: ['daybook'] });
      reset({ txnDate: watch('txnDate'), vatavRate: watch('vatavRate') }); // keep date and vatav rate constant for flow
      setFocus('senderId');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error saving')
  });

  const onSubmit: SubmitHandler<TxnForm> = (data) => mutCreate.mutate(data);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* Fast Entry Form */}
      <div className="xl:col-span-1 bg-white p-6 rounded-xl border border-surface-200 shadow-sm h-fit">
        <h2 className="text-lg font-bold text-surface-900 mb-6 border-b pb-2">Fast Transaction Entry</h2>
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown} className="space-y-4">
          <Input label="Date" type="date" {...register('txnDate')} error={errors.txnDate?.message as any} />
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-700">Sender Party (Dr)</label>
            <select 
              {...register('senderId')}
              className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Select Sender...</option>
              {parties?.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.cityName})</option>)}
            </select>
            {errors.senderId && <p className="text-sm text-red-500">{errors.senderId.message as any}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-700">Receiver Party (Cr)</label>
            <select 
              {...register('receiverId')}
              className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Select Receiver...</option>
              {parties?.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.cityName})</option>)}
            </select>
            {errors.receiverId && <p className="text-sm text-red-500">{errors.receiverId.message as any}</p>}
          </div>

          <div className="flex gap-4">
            <Input label="Amount (₹)" type="number" step="0.01" {...register('amount')} error={errors.amount?.message as any} />
            <Input label="Vatav (%)" type="number" step="0.01" {...register('vatavRate')} error={errors.vatavRate?.message as any} />
          </div>

          <div className="bg-surface-50 p-3 rounded-lg border border-surface-200">
            <p className="text-sm text-surface-500">Live Commission Preview</p>
            <p className="text-lg font-bold text-amber-600">₹ {vatavPreview.toFixed(2)}</p>
          </div>

          <Input label="Narration" type="text" {...register('narration')} />

          <Button type="button" onClick={handleSubmit(onSubmit)} className="w-full" isLoading={mutCreate.isPending}>
            Save (Enter)
          </Button>
        </form>
      </div>

      {/* Daybook Preview */}
      <div className="xl:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-surface-900">Today's Daybook</h2>
          <span className="text-sm bg-primary-50 text-primary-700 px-3 py-1 rounded-full font-medium">
            {daybook?.filter((t:any) => t.status==='ACTIVE').length || 0} Txns
          </span>
        </div>
        <Table 
          data={daybook?.filter((t:any) => t.status === 'ACTIVE') || []}
          isLoading={loadDaybook}
          keyExtractor={(t) => t.id}
          columns={[
            { header: 'Txn No', accessor: (t:any) => t.txnNumber },
            { header: 'Sender', accessor: (t:any) => t.senderName, className: 'text-red-600 font-medium' },
            { header: 'Receiver', accessor: (t:any) => t.receiverName, className: 'text-green-600 font-medium' },
            { header: 'Amount ₹', accessor: (t:any) => t.amount.toLocaleString(), className: 'font-bold' },
            { header: 'Vatav ₹', accessor: (t:any) => t.vatavAmount.toLocaleString(), className: 'text-amber-600' }
          ]}
        />
      </div>

    </div>
  );
}
