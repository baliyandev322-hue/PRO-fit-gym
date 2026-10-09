import React, { useState } from 'react';
import { 
  Mail, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Archive, 
  Eye, 
  Send,
  Phone,
  Trash2
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

export interface ContactItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'responded' | 'archived';
  createdAt: string;
}

const INITIAL_MESSAGES: ContactItem[] = [
  {
    id: 'msg-001',
    fullName: 'Robert Sterling',
    email: 'robert@sterlingcapital.com',
    phone: '+1 (212) 555-0911',
    subject: 'Corporate Executive Membership for 5 Partners',
    message: 'We are seeking 5 executive keycard memberships with permanent lockers and recovery suite access for our managing directors. Can we arrange a private walkthrough with head director Dev Baliyan?',
    status: 'unread',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'msg-002',
    fullName: 'Maya Kapoor',
    email: 'maya.k@athletics.in',
    phone: '+91 98111 99887',
    subject: 'Powerlifting Meet Preparation & Calibrated Plates',
    message: 'Inquiring if PROFIT offers competition squat rack heights and calibrated 25kg steel discs for USAPL / IPF sanctioned competition training.',
    status: 'read',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'msg-003',
    fullName: 'Daniel Chen',
    email: 'dchen@biotech.org',
    phone: '+1 (212) 555-0944',
    subject: 'Recovery Suite Cold Plunge Temperature Specification',
    message: 'What filtration and temperature standards do you maintain in the hydrotherapy plunge pools? Looking for true sub-40 degree Fahrenheit immersion.',
    status: 'responded',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export const AdminMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<ContactItem[]>(INITIAL_MESSAGES);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read' | 'responded' | 'archived'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactItem | null>(null);
  const { showToast } = useNotifications();

  const handleUpdateStatus = (id: string, newStatus: ContactItem['status']) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
    );
    showToast({
      type: 'info',
      title: 'INBOX UPDATED',
      message: `Inquiry marked as ${newStatus.toUpperCase()}`,
    });
    if (selectedMessage?.id === id) {
      setSelectedMessage((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const filtered = messages.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const unreadCount = messages.filter((m) => m.status === 'unread').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
              INBOUND CONTACT & ATHLETE INQUIRIES
            </h2>
            {unreadCount > 0 && (
              <span className="bg-gym-lime text-gym-black font-heading font-black text-xs px-2 py-0.5 rounded">
                {unreadCount} UNREAD
              </span>
            )}
          </div>
          <p className="text-xs text-gym-secondary">
            Manage inquiries submitted via public portal contact form
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-gym-surface border border-gym-border p-4 rounded-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gym-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search inquiries, subject, sender..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gym-black border border-gym-border rounded text-xs text-gym-primary focus:outline-none focus:border-gym-lime"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-gym-black p-1 rounded border border-gym-border text-xs w-full md:w-auto overflow-x-auto">
          {(['all', 'unread', 'read', 'responded', 'archived'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 font-heading uppercase font-bold text-xs rounded transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-gym-lime text-gym-black'
                  : 'text-gym-secondary hover:text-white'
              }`}
            >
              {st === 'all' ? 'All Inquiries' : st.toUpperCase()}
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
                <th className="py-3.5 px-4">Sender</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gym-border/40">
              {filtered.map((m) => (
                <tr
                  key={m.id}
                  className={`hover:bg-gym-surface-hover/60 transition-colors ${
                    m.status === 'unread' ? 'bg-gym-lime/[0.03]' : ''
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white font-heading uppercase text-sm">
                      {m.fullName}
                    </div>
                    <div className="text-[11px] text-gym-secondary font-mono">{m.email}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-gym-primary block">{m.subject}</span>
                    <p className="text-[11px] text-gym-muted line-clamp-1">{m.message}</p>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-gym-secondary whitespace-nowrap">
                    {new Date(m.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-heading font-black uppercase tracking-wider ${
                        m.status === 'unread'
                          ? 'bg-gym-lime/10 text-gym-lime border border-gym-lime/30'
                          : m.status === 'read'
                          ? 'bg-gym-surface text-gym-secondary border border-gym-border'
                          : m.status === 'responded'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-gym-black text-gym-muted'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedMessage(m)}
                        className="p-1.5 text-gym-secondary hover:text-white"
                        title="Read Message"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {m.status === 'unread' && (
                        <button
                          onClick={() => handleUpdateStatus(m.id, 'read')}
                          className="px-2 py-1 bg-gym-black border border-gym-border text-gym-secondary text-[10px] font-heading font-bold uppercase rounded"
                        >
                          Mark Read
                        </button>
                      )}
                      {m.status !== 'responded' && (
                        <button
                          onClick={() => handleUpdateStatus(m.id, 'responded')}
                          className="px-2 py-1 bg-gym-lime hover:bg-gym-lime-hover text-gym-black text-[10px] font-heading font-black uppercase rounded shadow-lime-glow"
                        >
                          Mark Responded
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

      {/* Read Inquiry Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-gym-surface border border-gym-border rounded-sm max-w-lg w-full p-6 relative shadow-card animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedMessage(null)}
              className="absolute top-4 right-4 text-gym-muted hover:text-white text-sm"
            >
              ✕
            </button>

            <span className="text-[10px] font-heading font-black uppercase text-gym-lime tracking-widest block mb-1">
              INBOUND CONTACT INQUIRY
            </span>
            <h3 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide mb-1">
              {selectedMessage.subject}
            </h3>
            <div className="text-xs text-gym-secondary flex items-center gap-2 mb-4 pb-3 border-b border-gym-border">
              <span>From: <strong className="text-white">{selectedMessage.fullName}</strong></span>
              <span>&bull;</span>
              <span className="font-mono text-gym-muted">{selectedMessage.email}</span>
            </div>

            <div className="p-4 bg-gym-black rounded border border-gym-border text-xs text-gym-primary leading-relaxed mb-4 max-h-60 overflow-y-auto">
              "{selectedMessage.message}"
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedMessage.id, 'responded')}
                  className="px-4 py-2 bg-gym-lime text-gym-black font-heading font-black uppercase text-xs rounded hover:bg-gym-lime-hover shadow-lime-glow"
                >
                  Mark Responded
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedMessage.id, 'archived')}
                  className="px-3 py-2 bg-gym-black border border-gym-border text-gym-secondary font-heading font-bold uppercase text-xs rounded"
                >
                  Archive
                </button>
              </div>
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                className="inline-flex items-center gap-1.5 text-xs text-gym-lime hover:underline font-bold"
              >
                <Send className="w-3.5 h-3.5" /> Direct Email Reply
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
