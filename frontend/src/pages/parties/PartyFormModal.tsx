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
  partyCode: string;
  cityName: string;
  phone: string;
  email: string;
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

const defaultForm: Party = {
  name: '',
  partyCode: '',
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
  const [form, setForm] = useState<Party>(defaultForm);
  const isEdit = !!existing?.id;

  // Sync form when existing data changes
  useEffect(() => {
    if (existing) {
      setForm({
        ...defaultForm,
        ...existing,
      });
    } else {
      setForm(defaultForm);
    }
  }, [existing, isOpen]);

  const set = (field: keyof Party, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const mutation = useMutation({
    mutationFn: (data: Party) =>
      isEdit
        ? api.put(`/parties/${existing?.id}`, data)
        : api.post('/parties', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
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
    if (!form.cityName) return toast.error('City/Location is required');
    if (!form.partyType) return toast.error('Party Type is required');
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
        {/* Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Party Name *"
            placeholder="e.g. Ramesh Bhai Patel"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            required
          />
          <Input
            label="Party Code"
            placeholder="e.g. RBP001"
            value={form.partyCode || ''}
            onChange={e => set('partyCode', e.target.value.toUpperCase())}
            hint="Short unique identifier"
          />
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
            onChange={e => set('phone', e.target.value)}
            required
            hint="Used for WhatsApp reminders (format: 9XXXXXXXXX)"
          />
        </div>

        {/* Email & Party Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. ramesh@example.com"
            value={form.email || ''}
            onChange={e => set('email', e.target.value)}
            hint="Optional"
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Party Type *</label>
            <select
              required
              className="form-select"
              value={form.partyType}
              onChange={e => set('partyType', e.target.value)}
            >
              <option value="BOTH">BOTH (Sender & Receiver)</option>
              <option value="CR">CREDIT (Receiver Only)</option>
              <option value="DR">DEBIT (Sender Only)</option>
            </select>
          </div>
        </div>

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
              hint="Interest rate charged on sent funds"
            />
            <Input
              label="Credit ROI (%)"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 1.50"
              value={form.crRoi}
              onChange={e => set('crRoi', parseFloat(e.target.value) || 0)}
              hint="Interest rate paid on received funds"
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
