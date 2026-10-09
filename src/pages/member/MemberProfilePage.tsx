import React, { useState } from 'react';
import { User, Phone, Shield, Mail, Save, Camera } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const MemberProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [emergencyContact, setEmergencyContact] = useState(user?.emergency_contact || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      full_name: fullName,
      phone,
      emergency_contact: emergencyContact,
      bio,
      avatar_url: avatarUrl
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
          ATHLETE PROFILE & CREDENTIALS
        </h2>
        <p className="text-xs text-gym-secondary">
          Manage your personal details, biometric contact, and facility emergency records
        </p>
      </div>

      <div className="bg-gym-surface border border-gym-border rounded-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gym-border">
            <div className="relative group">
              <img
                src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                alt={fullName}
                className="w-24 h-24 rounded-full object-cover border-2 border-gym-lime shadow-lime-glow"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-heading text-xl font-bold uppercase text-gym-primary">{fullName}</h3>
              <p className="text-xs text-gym-muted font-mono">{user.email}</p>
              <div className="mt-3">
                <input
                  type="url"
                  placeholder="Paste Image URL for Avatar"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full max-w-md py-1.5 px-3 bg-gym-black border border-gym-border rounded text-xs text-gym-primary focus:outline-none focus:border-gym-lime"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-heading font-bold text-gym-secondary mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full py-2.5 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-xs focus:outline-none focus:border-gym-lime"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-heading font-bold text-gym-secondary mb-1">
                Email (Account Identity)
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full py-2.5 px-3 bg-gym-black/50 border border-gym-border/50 rounded text-gym-muted text-xs cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-heading font-bold text-gym-secondary mb-1">
                Direct Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (212) 555-0192"
                className="w-full py-2.5 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-xs focus:outline-none focus:border-gym-lime"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-heading font-bold text-gym-secondary mb-1">
                Emergency Contact (Name & Phone)
              </label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="Sarah Vance - +1 (212) 555-0199"
                className="w-full py-2.5 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-xs focus:outline-none focus:border-gym-lime"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-heading font-bold text-gym-secondary mb-1">
              Athletic Background & Goals
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell your coaches about your lifting focus, injuries, and athletic targets..."
              className="w-full py-2.5 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-xs focus:outline-none focus:border-gym-lime"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-gym-lime text-gym-black font-heading uppercase font-bold text-xs rounded hover:bg-gym-lime-hover shadow-lime-glow transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Athlete Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
