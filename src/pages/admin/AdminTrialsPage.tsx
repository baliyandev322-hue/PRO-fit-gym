import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  UserPlus, 
  Mail, 
  Phone,
  Calendar,
  Eye,
  ArrowRight
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

export interface TrialItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  discipline: string;
  preferredDate: string;
  status: 'new' | 'contacted' | 'converted' | 'rejected';
  notes?: string;
  createdAt: string;
}

const INITIAL_TRIALS: TrialItem[] = [
  {
    id: 'trial-001',
    fullName: 'Lucas Meyer',
    email: 'lucas.m@gmail.com',
    phone: '+1 (212) 555-0811',
    discipline: 'Heavy Barbell Iron',
    preferredDate: '2026-10-14',
    status: 'new',
    notes: 'Powerlifter relocating to NoHo, wants to test calibrated Eleiko plates.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'trial-002',
    fullName: 'Natasha Roman',
    email: 'natasha.r@techcorp.io',
    phone: '+1 (212) 555-0822',
    discipline: 'Olympic Weightlifting',
    preferredDate: '2026-10-15',
    status: 'contacted',
    notes: 'Master coach session requested with Marcus Drake.',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'trial-003',
    fullName: 'Arjun Mehta',
    email: 'arjun.mehta@venture.com',
    phone: '+91 98200 12345',
    discipline: 'Contrast Hydrotherapy & Conditioning',
    preferredDate: '2026-10-16',
    status: 'converted',
    notes: 'Purchased Performance Tier on same day.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'trial-004',
    fullName: 'Emily Thorne',
    email: 'emily@thorne.design',
    phone: '+1 (212) 555-0899',
    discipline: 'Heavy Barbell Iron',
    preferredDate: '2026-10-12',
    status: 'rejected',
    notes: 'Requested casual drop-in (rejected: private 300 member sanctuary policy).',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'trial-005',
    fullName: 'Vikram Singhania',
    email: 'vikram.s@investments.in',
    phone: '+91 98333 44556',
    discipline: 'Anaerobic Engine',
    preferredDate: '2026-10-18',
    status: 'new',
    notes: 'Interested in VO2 max curved treadmill sprint testing.',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

export const AdminTrialsPage: React.FC = () => {
  const [trials, setTrials] = useState<TrialItem[]>(INITIAL_TRIALS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'contacted' | 'converted' | 'rejected'>('all');
  const [selectedTrial, setSelectedTrial] = useState<TrialItem | null>(null);
  const { showToast } = useNotifications();

  const handleUpdateStatus = (id: string, newStatus: TrialItem['status']) => {
    setTrials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    showToast({
      type: 'success',
      title: 'TRIAL STATUS UPDATED',
      message: `Applicant marked as ${newStatus.toUpperCase()}`,
    });
    if (selectedTrial?.id === id) {
      setSelectedTrial((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const filtered = trials.filter((t) => {
    const matchesSearch =
      t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.discipline.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const newCount = trials.filter((t) => t.status === 'new').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
              FREE TRIAL APPLICATIONS & CONVERSION LEADS
            </h2>
            {newCount > 0 && (
              <span className="bg-gym-lime text-gym-black font-heading font-black text-xs px-2 py-0.5 rounded">
                {newCount} NEW LEADS
              </span>
            )}
          </div>
          <p className="text-xs text-gym-secondary">
            Screen incoming athlete applicants before issuing Sanctuary trial passes
          </p>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gym-surface border border-gym-border p-4 rounded-sm">
          <span className="text-[11px] font-heading font-bold uppercase text-gym-muted block">
            New Submissions
          </span>
          <span className="font-heading text-3xl font-black text-gym-lime mt-1 block">
            {newCount}
          </span>
          <span className="text-[10px] text-gym-secondary">Require coach contact</span>
        </div>

        <div className="bg-gym-surface border border-gym-border p-4 rounded-sm">
          <span className="text-[11px] font-heading font-bold uppercase text-gym-muted block">
            Contacted In Review
          </span>
          <span className="font-heading text-3xl font-black text-cyan-400 mt-1 block">
            {trials.filter((t) => t.status === 'contacted').length}
          </span>
          <span className="text-[10px] text-gym-secondary">Trial session scheduled</span>
        </div>

        <div className="bg-gym-surface border border-gym-border p-4 rounded-sm">
          <span className="text-[11px] font-heading font-bold uppercase text-gym-muted block">
            Converted to Paid Members
          </span>
          <span className="font-heading text-3xl font-black text-emerald-400 mt-1 block">
            {trials.filter((t) => t.status === 'converted').length}
          </span>
          <span className="text-[10px] text-gym-secondary">Joined 300 member cap</span>
        </div>

        <div className="bg-gym-surface border border-gym-border p-4 rounded-sm">
          <span className="text-[11px] font-heading font-bold uppercase text-gym-muted block">
            Rejected / Ineligible
          </span>
          <span className="font-heading text-3xl font-black text-gym-muted mt-1 block">
            {trials.filter((t) => t.status === 'rejected').length}
          </span>
          <span className="text-[10px] text-gym-secondary">Declined sanctuary access</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-gym-surface border border-gym-border p-4 rounded-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gym-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search applicants, email, discipline..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gym-black border border-gym-border rounded text-xs text-gym-primary focus:outline-none focus:border-gym-lime"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-gym-black p-1 rounded border border-gym-border text-xs w-full md:w-auto overflow-x-auto">
          {(['all', 'new', 'contacted', 'converted', 'rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 font-heading uppercase font-bold text-xs rounded transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-gym-lime text-gym-black'
                  : 'text-gym-secondary hover:text-white'
              }`}
            >
              {st === 'all' ? 'All Applicants' : st.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gym-surface border border-gym-border rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gym-border text-gym-muted font-heading uppercase tracking-wider text-[11px] bg-gym-black/40">
                <th className="py-3.5 px-4">Applicant</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Target Discipline</th>
                <th className="py-3.5 px-4">Preferred Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gym-border/40">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-gym-surface-hover/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white font-heading uppercase text-sm">
                      {t.fullName}
                    </div>
                    <div className="text-[11px] text-gym-muted font-mono">{t.id}</div>
                  </td>

                  <td className="py-3.5 px-4 text-gym-secondary">
                    <div>{t.email}</div>
                    <div className="font-mono text-[11px] text-gym-muted">{t.phone}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-gym-lime text-xs">{t.discipline}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-white">
                    {t.preferredDate}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-heading font-black uppercase tracking-wider ${
                        t.status === 'new'
                          ? 'bg-gym-lime/10 text-gym-lime border border-gym-lime/30'
                          : t.status === 'contacted'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                          : t.status === 'converted'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedTrial(t)}
                        className="p-1.5 text-gym-secondary hover:text-white"
                        title="View Full Application"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {t.status === 'new' && (
                        <button
                          onClick={() => handleUpdateStatus(t.id, 'contacted')}
                          className="px-2 py-1 bg-gym-black hover:bg-gym-surface border border-gym-border text-cyan-400 font-heading uppercase font-bold text-[10px] rounded"
                        >
                          Mark Contacted
                        </button>
                      )}
                      {t.status === 'contacted' && (
                        <button
                          onClick={() => handleUpdateStatus(t.id, 'converted')}
                          className="px-2 py-1 bg-gym-lime hover:bg-gym-lime-hover text-gym-black font-heading uppercase font-black text-[10px] rounded shadow-lime-glow"
                        >
                          Convert Member
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Application Modal */}
      {selectedTrial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-gym-surface border border-gym-border rounded-sm max-w-md w-full p-6 relative shadow-card animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedTrial(null)}
              className="absolute top-4 right-4 text-gym-muted hover:text-white text-sm"
            >
              ✕
            </button>

            <span className="text-[10px] font-heading font-black uppercase text-gym-lime tracking-widest block mb-1">
              SANCTUARY TRIAL APPLICATION
            </span>
            <h3 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide mb-1">
              {selectedTrial.fullName}
            </h3>
            <span className="text-xs text-gym-muted font-mono block mb-4">
              Submitted: {new Date(selectedTrial.createdAt).toLocaleString()}
            </span>

            <div className="space-y-2.5 text-xs py-3 border-y border-gym-border">
              <div className="flex justify-between">
                <span className="text-gym-secondary">Email:</span>
                <span className="text-white font-mono">{selectedTrial.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gym-secondary">Phone:</span>
                <span className="text-white font-mono">{selectedTrial.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gym-secondary">Discipline:</span>
                <span className="text-gym-lime font-bold">{selectedTrial.discipline}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gym-secondary">Preferred Date:</span>
                <span className="text-white font-mono">{selectedTrial.preferredDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gym-secondary">Current Status:</span>
                <span className="text-gym-lime uppercase font-bold">{selectedTrial.status}</span>
              </div>
              {selectedTrial.notes && (
                <div className="pt-2">
                  <span className="text-[10px] font-heading uppercase font-bold text-gym-muted block mb-1">
                    Athlete Notes:
                  </span>
                  <p className="text-gym-secondary italic bg-gym-black p-2 rounded border border-gym-border">
                    "{selectedTrial.notes}"
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 flex gap-2">
              <button
                onClick={() => handleUpdateStatus(selectedTrial.id, 'converted')}
                className="flex-1 py-2 bg-gym-lime text-gym-black font-heading font-black uppercase text-xs rounded hover:bg-gym-lime-hover shadow-lime-glow"
              >
                Enroll as Paid Member
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedTrial.id, 'rejected')}
                className="py-2 px-3 bg-gym-black border border-gym-border text-red-400 font-heading font-bold uppercase text-xs rounded hover:bg-red-500/10"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
