/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

interface Party {
  id?: string;
  name: string;
  partyCode?: string;
  cityName: string;
  phone: string;
  email?: string;
  partyType: 'CR' | 'DR' | 'BOTH';
  crRoi: number;
  drRoi: number;
  openingBalance: number;
  openingBalanceType: 'DR' | 'CR';
}

interface PartyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  existing?: Party | null;
}

const defaultForm: Omit<Party, 'id' | 'partyCode'> = {
  name: '',
  cityName: '',
  phone: '',
  email: '',
  partyType: 'BOTH',
  crRoi: 0.0,
  drRoi: 0.0,
  openingBalance: 0,
  openingBalanceType: 'DR',
};

export function PartyFormModal({ isOpen, onClose, existing }: PartyFormModalProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(defaultForm);
  const isEdit = !!existing?.id;

  // Sync form when existing data changes
  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name || '',
        cityName: existing.cityName || '',
        phone: existing.phone || '',
        email: existing.email || '',
        partyType: existing.partyType || 'BOTH',
        crRoi: existing.crRoi ?? 0,
        drRoi: existing.drRoi ?? 0,
        openingBalance: existing.openingBalance ?? 0,
        openingBalanceType: existing.openingBalanceType || 'DR',
      });
    } else {
      setForm(defaultForm);
    }
  }, [existing, isOpen]);

  const set = (field: keyof typeof form, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const mutation = useMutation({
    mutationFn: (data: typeof form) =>
      isEdit
        ? api.put(`/parties/${existing?.id}`, data)
        : api.post('/parties', data),
    onSuccess: () => {
      // Invalidate both parties list AND dashboard stats
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      queryClient.invalidateQueries({ queryKey: ['parties_list'] });
      queryClient.invalidateQueries({ queryKey: ['parties_select'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      toast.success(isEdit ? 'Party updated!' : 'Party added successfully!');
      setForm(defaultForm);
      onClose();
    },
    onError: (err: any) => {
      const data = err.response?.data;
      if (data?.fieldErrors && data.fieldErrors.length > 0) {
        toast.error(data.fieldErrors.map((f: any) => f.message).join(' | '));
      } else {
        toast.error(data?.message || 'Failed to save party. Check required fields.');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Party name is required');
    if (!form.phone.trim()) return toast.error('Phone number is required');
    if (!form.cityName.trim()) return toast.error('City/Location is required');
    if (!form.partyType) return toast.error('Party Type is required');
    // Phone pattern: Indian mobile numbers start with 6-9
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      return toast.error('Enter a valid 10-digit Indian mobile number (must start with 6–9)');
    }
    mutation.mutate(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Party' : 'Add New Party'}
      subtitle={isEdit ? 'Update party details below' : 'Create a new hawala party account'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Edit mode: show auto-generated party code */}
        {isEdit && existing?.partyCode && (
          <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
            <span className="text-xs text-slate-500 font-medium">Party Code:</span>
            <span className="font-mono text-sm font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-lg border border-indigo-200">
              {existing.partyCode}
            </span>
            <span className="text-xs text-slate-400 ml-auto italic">Auto-generated</span>
          </div>
        )}

        {/* Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Party Name *"
            placeholder="e.g. Ramesh Bhai Patel"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            required
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Party Type *</label>
            <select
              required
              className="form-select"
              value={form.partyType}
              onChange={e => set('partyType', e.target.value)}
            >
              <option value="BOTH">BOTH (Sender &amp; Receiver)</option>
              <option value="CR">CREDIT (Receiver Only)</option>
              <option value="DR">DEBIT (Sender Only)</option>
            </select>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="City / Location *"
            placeholder="e.g. Ahmedabad"
            value={form.cityName}
            onChange={e => set('cityName', e.target.value)}
            required
          />
          <Input
            label="Mobile / Phone *"
            type="tel"
            placeholder="e.g. 9876543210"
            value={form.phone}
            onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
            required
            hint="10-digit Indian number starting with 6–9"
          />
        </div>

        {/* Email */}
        <Input
          label="Email Address"
          type="email"
          placeholder="e.g. ramesh@example.com (optional)"
          value={form.email || ''}
          onChange={e => set('email', e.target.value)}
          hint="Optional — for digital statements"
        />

        {/* ROI and Balances */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
          <p className="text-sm font-semibold text-slate-700">Financial Settings</p>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Debit ROI (%)"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 1.50"
              value={form.drRoi}
              onChange={e => set('drRoi', parseFloat(e.target.value) || 0)}
              hint="Interest rate on sent funds"
            />
            <Input
              label="Credit ROI (%)"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 1.50"
              value={form.crRoi}
              onChange={e => set('crRoi', parseFloat(e.target.value) || 0)}
              hint="Interest rate on received funds"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <Input
              label="Opening Balance (₹)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.openingBalance}
              onChange={e => set('openingBalance', parseFloat(e.target.value) || 0)}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Balance Type</label>
              <div className="flex gap-2 mt-0.5">
                <button
                  type="button"
                  onClick={() => set('openingBalanceType', 'DR')}
                  className={`flex-1 py-1.5 rounded-xl text-sm font-bold border-2 transition-all ${
                    form.openingBalanceType === 'DR'
                      ? 'border-red-400 bg-red-50 text-red-600'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  DR (Debit)
                </button>
                <button
                  type="button"
                  onClick={() => set('openingBalanceType', 'CR')}
                  className={`flex-1 py-1.5 rounded-xl text-sm font-bold border-2 transition-all ${
                    form.openingBalanceType === 'CR'
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  CR (Credit)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {isEdit ? 'Update Party' : 'Add Party'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
