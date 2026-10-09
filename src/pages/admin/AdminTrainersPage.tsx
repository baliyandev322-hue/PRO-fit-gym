import React, { useState } from 'react';
import { UserCheck, Plus, Mail, Phone, Award, Users, Trash2 } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

export const AdminTrainersPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [email, setEmail] = useState('');

  const trainers = [
    {
      id: 'user-trainer-1',
      name: 'Marcus Drake',
      email: 'trainer@profitgym.com',
      avatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=400&q=80',
      title: 'CSCS & Senior Strength Specialist',
      athletes: 3,
      certifications: 'USAW Level 2 &bull; CSCS &bull; EXOS Performance',
      status: 'On Duty'
    },
    {
      id: 'user-trainer-2',
      name: 'Chloe Sterling',
      email: 'chloe@profitgym.com',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      title: 'Head Biomechanics & Rehab Coach',
      athletes: 4,
      certifications: 'DPT &bull; FMS Level 2 &bull; Precision Nutrition',
      status: 'On Duty'
    },
    {
      id: 'user-trainer-3',
      name: 'Kai Thorne',
      email: 'kai@profitgym.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      title: 'Olympic Weightlifting & CNS Director',
      athletes: 2,
      certifications: 'IWF Master Coach &bull; Eleiko Certified',
      status: 'Off Duty'
    }
  ];

  const handleAddTrainer = (e: React.FormEvent) => {
    e.preventDefault();
    showToast({
      type: 'success',
      title: 'COACH CREDENTIALED',
      message: `${name} has been issued Master Coach credentials.`
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
            MASTER COACHES & STAFF DIRECTORY
          </h2>
          <p className="text-xs text-gym-secondary">
            Manage certified coaching staff, athlete load allocations, and certifications
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm font-heading uppercase font-bold text-xs bg-gym-lime text-gym-black hover:bg-gym-lime-hover shadow-lime-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Credential New Master Coach</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {trainers.map(t => (
          <div key={t.id} className="bg-gym-surface border border-gym-border rounded-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-gym-lime"
                />
                <div>
                  <h3 className="font-heading text-lg font-black uppercase text-gym-primary">
                    {t.name}
                  </h3>
                  <span className="text-xs text-gym-lime font-mono block">
                    {t.title}
                  </span>
                  <span className="text-[10px] text-gym-muted block font-mono">
                    {t.email}
                  </span>
                </div>
              </div>

              <div className="space-y-2 py-3 border-y border-gym-border text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gym-secondary">Active Athletes:</span>
                  <span className="text-white font-bold">{t.athletes} Athletes Assigned</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gym-secondary">Floor Duty Status:</span>
                  <span className="text-gym-lime font-bold">{t.status}</span>
                </div>
                <div className="pt-1">
                  <span className="text-[10px] text-gym-muted block uppercase font-heading">Certifications:</span>
                  <span className="text-gym-secondary text-[11px]" dangerouslySetInnerHTML={{ __html: t.certifications }} />
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-2">
              <button
                onClick={() => showToast({ type: 'info', title: 'ROSTER ASSIGNMENT', message: `Opened athlete allocator for ${t.name}` })}
                className="w-full py-2 bg-gym-black hover:bg-gym-surface border border-gym-border text-center rounded text-xs font-heading font-bold uppercase tracking-wider text-gym-primary transition-colors"
              >
                Assign Athletes & Splits
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-gym-surface border border-gym-border rounded-sm max-w-md w-full p-6 relative shadow-card">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gym-muted hover:text-white text-sm"
            >
              ✕
            </button>

            <h3 className="font-heading text-xl font-black uppercase text-gym-primary tracking-wide mb-1">
              CREDENTIAL MASTER COACH
            </h3>
            <p className="text-xs text-gym-secondary mb-4">
              Create coaching login credentials and roster rights.
            </p>

            <form onSubmit={handleAddTrainer} className="space-y-4">
              <div>
                <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                  Coach Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Marcus Drake"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-xs focus:outline-none focus:border-gym-lime"
                />
              </div>

              <div>
                <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="coach@profitgym.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-xs focus:outline-none focus:border-gym-lime"
                />
              </div>

              <div>
                <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                  Specialty Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. CSCS Head Olympic Lifting Coach"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  required
                  className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-xs focus:outline-none focus:border-gym-lime"
                />
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
                  Issue Coaching Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
