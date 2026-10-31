import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  UserPlus, 
  Mail, 
  Phone,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { useGymData } from '@/context/GymDataContext';
import { useNotifications } from '@/context/NotificationContext';
import type { UserProfile, MembershipStatus } from '@/types';

export const AdminMembersPage: React.FC = () => {
  const { memberships, plans } = useGymData();
  const { showToast } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring_soon' | 'expired'>('all');
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New member form
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPlanId, setNewPlanId] = useState('plan-performance');
  const [memberList, setMemberList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('profit_gym_jwt_token') || localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const res = await fetch('/api/admin/members', {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setMemberList(data.data);
      } else {
        // Fallback default athletes if database is freshly initialized
        setMemberList([
          {
            id: 'user-member-1',
            full_name: 'Alex Vance',
            email: 'alex.vance@athlete.com',
            phone: '+1 (212) 555-0192',
            tier: 'Performance Tier',
            status: 'active' as MembershipStatus,
            daysLeft: 18,
            trainer: 'Marcus Drake',
            joined: '2026-08-15'
          }
        ]);
      }
    } catch (err) {
      console.warn('Failed to load real members from MongoDB Atlas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleDeleteMember = async (id: string, name: string) => {
    try {
      const token = localStorage.getItem('profit_gym_jwt_token') || localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const res = await fetch(`/api/admin/members/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      const data = await res.json();
      if (data.success) {
        showToast({
          type: 'warning',
          title: 'MEMBER REMOVED',
          message: `${name} deleted from MongoDB Atlas.`
        });
        fetchMembers();
      }
    } catch (err) {
      setMemberList(prev => prev.filter(m => m.id !== id));
    }
  };

  const filteredMembers = memberList.filter(m => {
    const matchesSearch = 
      m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      statusFilter === 'all' || m.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newEmail) return;

    try {
      const token = localStorage.getItem('profit_gym_jwt_token') || localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          fullName: newFullName,
          email: newEmail,
          phone: newPhone || '+1 (212) 555-0100',
          planId: newPlanId
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast({
          type: 'success',
          title: 'ATHLETE REGISTERED',
          message: `Enrolled ${newFullName} directly into MongoDB Atlas!`
        });
        setShowAddModal(false);
        setNewFullName('');
        setNewEmail('');
        setNewPhone('');
        fetchMembers();
      } else {
        showToast({
          type: 'error',
          title: 'ENROLLMENT FAILED',
          message: data.message || 'Could not register member.'
        });
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'NETWORK ERROR',
        message: err.message
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
            ATHLETES DIRECTORY & ROSTER
          </h2>
          <p className="text-xs text-gym-secondary">
            Manage the 300 capped members, subscription statuses, contact profiles, and floor access
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm font-heading uppercase font-bold text-xs bg-gym-lime text-gym-black hover:bg-gym-lime-hover shadow-lime-glow transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Enroll New Athlete</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-gym-surface border border-gym-border p-4 rounded-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gym-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by athlete name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gym-black border border-gym-border rounded text-xs text-gym-primary focus:outline-none focus:border-gym-lime"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-gym-black p-1 rounded border border-gym-border text-xs w-full md:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Members' },
            { id: 'active', label: 'Active' },
            { id: 'expiring_soon', label: 'Expiring Soon' },
            { id: 'expired', label: 'Expired' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id as any)}
              className={`px-3 py-1 font-heading uppercase font-bold text-xs rounded transition-colors whitespace-nowrap ${
                statusFilter === f.id
                  ? 'bg-gym-lime text-gym-black'
                  : 'text-gym-secondary hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-gym-surface border border-gym-border rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gym-border text-gym-muted font-heading uppercase tracking-wider text-[11px] bg-gym-black/40">
                <th className="py-3.5 px-4">Athlete</th>
                <th className="py-3.5 px-4">Membership Tier</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Days Left</th>
                <th className="py-3.5 px-4">Master Coach</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gym-border/40">
              {filteredMembers.map(member => (
                <tr key={member.id} className="hover:bg-gym-surface-hover/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-gym-primary font-heading uppercase text-sm">
                      {member.full_name}
                    </div>
                    <div className="text-[11px] text-gym-muted font-mono">{member.email}</div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-gym-secondary">
                    {member.tier}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-heading font-black uppercase tracking-wider ${
                      member.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : member.status === 'expiring_soon'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}>
                      {member.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {member.daysLeft > 0 ? `${member.daysLeft} days` : '0 (Expired)'}
                  </td>

                  <td className="py-3.5 px-4 text-gym-secondary">
                    {member.trainer}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedMember(member)}
                        className="p-1 text-gym-secondary hover:text-gym-lime"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          showToast({
                            type: 'info',
                            title: 'EDIT ATHLETE',
                            message: `Opening editor for ${member.full_name}`
                          });
                        }}
                        className="p-1 text-gym-secondary hover:text-white"
                        title="Edit Record"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Revoke gym access and delete ${member.full_name}?`)) {
                            await handleDeleteMember(member.id, member.full_name);
                          }
                        }}
                        className="p-1 text-gym-muted hover:text-red-400"
                        title="Revoke Access"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: VIEW MEMBER PROFILE ================= */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-gym-surface border border-gym-border rounded-sm max-w-md w-full p-6 relative shadow-card animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 text-gym-muted hover:text-white text-sm"
            >
              ✕
            </button>

            <div className="text-center pb-4 border-b border-gym-border">
              <h3 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
                {selectedMember.full_name}
              </h3>
              <span className="text-xs text-gym-lime font-mono">{selectedMember.tier}</span>
            </div>

            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-gym-border/40">
                <span className="text-gym-secondary">Email:</span>
                <span className="text-white font-mono">{selectedMember.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gym-border/40">
                <span className="text-gym-secondary">Phone:</span>
                <span className="text-white font-mono">{selectedMember.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gym-border/40">
                <span className="text-gym-secondary">Assigned Coach:</span>
                <span className="text-white font-bold">{selectedMember.trainer}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gym-border/40">
                <span className="text-gym-secondary">Status:</span>
                <span className="text-gym-lime uppercase font-bold">{selectedMember.status}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gym-secondary">Enrolled Since:</span>
                <span className="text-white font-mono">{selectedMember.joined}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedMember(null)}
              className="w-full py-2.5 bg-gym-lime text-gym-black font-heading font-black uppercase text-xs rounded shadow-lime-glow"
            >
              Close Record
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: ENROLL NEW ATHLETE ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-gym-surface border border-gym-border rounded-sm max-w-md w-full p-6 relative shadow-card animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gym-muted hover:text-white text-sm"
            >
              ✕
            </button>

            <h3 className="font-heading text-xl font-black uppercase text-gym-primary tracking-wide mb-1">
              ENROLL NEW ATHLETE MEMBER
            </h3>
            <p className="text-xs text-gym-secondary mb-4">
              Issue membership slot within the 300-member cap.
            </p>

            <form onSubmit={handleCreateMember} className="space-y-4">
              <div>
                <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Liam Gallagher"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  required
                  className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-xs focus:outline-none focus:border-gym-lime"
                />
              </div>

              <div>
                <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="liam@domain.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-xs focus:outline-none focus:border-gym-lime"
                />
              </div>

              <div>
                <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                  Direct Phone
                </label>
                <input
                  type="text"
                  placeholder="+1 (212) 555-0100"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-xs focus:outline-none focus:border-gym-lime"
                />
              </div>

              <div>
                <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                  Assigned Membership Tier
                </label>
                <select
                  value={newPlanId}
                  onChange={(e) => setNewPlanId(e.target.value)}
                  className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-xs focus:outline-none focus:border-gym-lime"
                >
                  <option value="plan-starter">Starter Tier ($149 / mo)</option>
                  <option value="plan-performance">Performance Tier ($249 / mo)</option>
                  <option value="plan-elite">Elite VIP Tier ($399 / mo)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/3 py-2 bg-gym-black hover:bg-gym-surface border border-gym-border text-gym-secondary text-xs uppercase font-heading font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2 bg-gym-lime hover:bg-gym-lime-hover text-gym-black text-xs uppercase font-heading font-black tracking-wider rounded shadow-lime-glow"
                >
                  Confirm & Grant Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
