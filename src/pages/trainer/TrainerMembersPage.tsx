import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Dumbbell, 
  Calendar, 
  Mail, 
  Phone, 
  ChevronRight, 
  Award, 
  TrendingUp, 
  Plus, 
  CheckCircle2, 
  Search, 
  MessageSquare, 
  FileText, 
  Clock, 
  Flame, 
  Activity,
  ArrowRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { useGymData } from '@/context/GymDataContext';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';

export interface AthleteRecord {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone: string;
  tier: string;
  status: 'active' | 'expiring_soon' | 'expired';
  benchPR: number;
  squatPR: number;
  deadliftPR: number;
  bodyWeight: number;
  bodyFat?: number;
  sessionsLogged: number;
  program: string;
  coachNotes: { id: string; date: string; author: string; note: string }[];
}

export const TrainerMembersPage: React.FC = () => {
  const { user } = useAuth();
  const { workoutPlans, addProgressMetric, getMemberAttendance, getMemberWorkouts } = useGymData();
  const { showToast } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'prs' | 'notes' | 'log_progress'>('overview');

  // Coaching note form state
  const [newNoteText, setNewNoteText] = useState('');

  // Progress log form state
  const [logWeight, setLogWeight] = useState(80);
  const [logBench, setLogBench] = useState(115);
  const [logSquat, setLogSquat] = useState(150);
  const [logDeadlift, setLogDeadlift] = useState(190);
  const [logNotes, setLogNotes] = useState('');

  const [roster, setRoster] = useState<AthleteRecord[]>([
    {
      id: 'user-member-1',
      name: 'Alex Vance',
      email: 'alex.vance@athlete.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      phone: '+1 (212) 555-0192',
      tier: 'Performance Tier',
      status: 'active',
      benchPR: 125,
      squatPR: 165,
      deadliftPR: 195,
      bodyWeight: 79.8,
      bodyFat: 11.4,
      sessionsLogged: 24,
      program: 'Push Day (Hypertrophy & CNS Activation)',
      coachNotes: [
        {
          id: 'note-1',
          date: '2026-10-06',
          author: 'Marcus Drake CSCS',
          note: 'Barbell speed off the floor on 180kg deadlift was exceptional. Increased working set weight by 2.5kg next cycle.'
        },
        {
          id: 'note-2',
          date: '2026-09-28',
          author: 'Marcus Drake CSCS',
          note: 'Scapular retraction stable during incline dumbbell press. Maintain 90s rest interval.'
        }
      ]
    },
    {
      id: 'user-member-2',
      name: 'Elena Rostova',
      email: 'elena.rostova@athlete.com',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      phone: '+1 (212) 555-0144',
      tier: 'Elite VIP Tier',
      status: 'active',
      benchPR: 80,
      squatPR: 135,
      deadliftPR: 160,
      bodyWeight: 64.2,
      bodyFat: 14.8,
      sessionsLogged: 19,
      program: 'Olympic Clean & Jerk Cycle',
      coachNotes: [
        {
          id: 'note-3',
          date: '2026-10-04',
          author: 'Marcus Drake CSCS',
          note: 'Triple extension velocity improved during snatch pull. Add 2 sets of high-hang snatch.'
        }
      ]
    },
    {
      id: 'user-member-3',
      name: 'Jordan Bell',
      email: 'jordan.bell@business.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      phone: '+1 (212) 555-0177',
      tier: 'Starter Tier',
      status: 'expiring_soon',
      benchPR: 95,
      squatPR: 120,
      deadliftPR: 145,
      bodyWeight: 84.5,
      bodyFat: 16.2,
      sessionsLogged: 12,
      program: 'Full Body Functional Base',
      coachNotes: [
        {
          id: 'note-4',
          date: '2026-10-02',
          author: 'Marcus Drake CSCS',
          note: 'Form review for front squats: ankle mobility drills required before loaded sets.'
        }
      ]
    }
  ]);

  const filteredRoster = roster.filter(athlete => {
    const matchesSearch = 
      athlete.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      athlete.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'all' || athlete.tier.toLowerCase().includes(filterTier.toLowerCase());
    return matchesSearch && matchesTier;
  });

  const handleAddCoachNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAthlete || !newNoteText.trim()) return;

    const newNoteObj = {
      id: `note-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      author: `${user?.full_name || 'Marcus Drake'} CSCS`,
      note: newNoteText.trim()
    };

    const updatedRoster = roster.map(a => {
      if (a.id === selectedAthlete.id) {
        return {
          ...a,
          coachNotes: [newNoteObj, ...a.coachNotes]
        };
      }
      return a;
    });

    setRoster(updatedRoster);
    setSelectedAthlete(prev => prev ? { ...prev, coachNotes: [newNoteObj, ...prev.coachNotes] } : null);
    setNewNoteText('');

    showToast({
      type: 'success',
      title: 'COACH NOTE LOGGED',
      message: `Performance guidance saved for ${selectedAthlete.name}.`
    });
  };

  const handleSaveProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAthlete) return;

    // Save into global GymDataContext
    addProgressMetric({
      member_id: selectedAthlete.id,
      recorded_date: new Date().toISOString().split('T')[0],
      body_weight_kg: Number(logWeight),
      bench_press_1rm: Number(logBench),
      squat_1rm: Number(logSquat),
      deadlift_1rm: Number(logDeadlift),
      notes: logNotes || 'Logged during Master Coach 1-on-1 session'
    });

    // Update local roster record
    const updatedRoster = roster.map(a => {
      if (a.id === selectedAthlete.id) {
        return {
          ...a,
          bodyWeight: Number(logWeight),
          benchPR: Math.max(a.benchPR, Number(logBench)),
          squatPR: Math.max(a.squatPR, Number(logSquat)),
          deadliftPR: Math.max(a.deadliftPR, Number(logDeadlift))
        };
      }
      return a;
    });

    setRoster(updatedRoster);
    if (selectedAthlete) {
      setSelectedAthlete({
        ...selectedAthlete,
        bodyWeight: Number(logWeight),
        benchPR: Math.max(selectedAthlete.benchPR, Number(logBench)),
        squatPR: Math.max(selectedAthlete.squatPR, Number(logSquat)),
        deadliftPR: Math.max(selectedAthlete.deadliftPR, Number(logDeadlift))
      });
    }

    showToast({
      type: 'success',
      title: 'METRICS RECORDED',
      message: `Updated benchmarks for ${selectedAthlete.name}: BW ${logWeight}kg, DL ${logDeadlift}kg.`
    });

    setActiveTab('prs');
  };

  const handleOpenAthlete = (athlete: AthleteRecord) => {
    setSelectedAthlete(athlete);
    setLogWeight(athlete.bodyWeight);
    setLogBench(athlete.benchPR);
    setLogSquat(athlete.squatPR);
    setLogDeadlift(athlete.deadliftPR);
    setActiveTab('overview');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
            ASSIGNED ATHLETES DIRECTORY
          </h2>
          <p className="text-xs text-gym-secondary">
            Manage periodized training blocks, compound 1RM benchmarks, and coaching telemetry
          </p>
        </div>

        <Link
          to="/trainer/workouts"
          className="flex items-center gap-2 px-5 py-2.5 rounded-sm font-heading uppercase font-bold text-xs bg-gym-lime text-gym-black hover:bg-gym-lime-hover shadow-lime-glow transition-all"
        >
          <Dumbbell className="w-4 h-4" />
          <span>Architect Program Routine</span>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-gym-surface border border-gym-border p-4 rounded-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gym-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search athlete by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gym-black border border-gym-border rounded text-xs text-gym-primary focus:outline-none focus:border-gym-lime"
          />
        </div>

        <div className="flex items-center gap-2 bg-gym-black p-1 rounded border border-gym-border text-xs w-full md:w-auto">
          {[
            { id: 'all', label: 'All Tiers' },
            { id: 'performance', label: 'Performance' },
            { id: 'elite', label: 'Elite VIP' },
            { id: 'starter', label: 'Starter' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFilterTier(t.id)}
              className={`px-3 py-1 font-heading uppercase font-bold text-xs rounded transition-colors ${
                filterTier === t.id ? 'bg-gym-lime text-gym-black' : 'text-gym-secondary hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Athlete Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredRoster.map(athlete => (
          <div 
            key={athlete.id} 
            className="bg-gym-surface border border-gym-border hover:border-gym-lime/50 rounded-sm p-6 flex flex-col justify-between transition-all group"
          >
            <div>
              <div className="flex items-center gap-3.5 mb-4">
                <img
                  src={athlete.avatar}
                  alt={athlete.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-gym-lime shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-heading text-lg font-black uppercase text-gym-primary truncate group-hover:text-gym-lime transition-colors">
                    {athlete.name}
                  </h3>
                  <span className="text-xs text-gym-lime font-mono block">
                    {athlete.tier}
                  </span>
                  <span className="text-[11px] text-gym-muted truncate block">
                    {athlete.email}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gym-border/60 text-xs">
                <span className="text-gym-muted">Floor Status</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-heading font-black uppercase tracking-wider ${
                  athlete.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  {athlete.status.replace('_', ' ')}
                </span>
              </div>

              {/* Vital Stat Rows */}
              <div className="space-y-2 py-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gym-secondary">Active Split:</span>
                  <span className="text-gym-primary font-bold truncate max-w-[160px] text-right">
                    {athlete.program}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gym-secondary">Body Weight:</span>
                  <span className="text-white font-mono font-bold">{athlete.bodyWeight} kg</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gym-secondary">Big 3 Total:</span>
                  <span className="text-gym-lime font-mono font-bold">
                    {athlete.benchPR + athlete.squatPR + athlete.deadliftPR} kg
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gym-secondary">Monthly Visits:</span>
                  <span className="text-white font-mono">{athlete.sessionsLogged} Sessions</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gym-secondary">Coach Direct Notes:</span>
                  <span className="text-cyan-400 font-mono font-semibold">
                    {athlete.coachNotes.length} Logged
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-5 mt-4 border-t border-gym-border space-y-2">
              <button
                onClick={() => handleOpenAthlete(athlete)}
                className="w-full py-2.5 bg-gym-black hover:bg-gym-surface-hover border border-gym-border text-gym-primary font-heading uppercase font-bold text-xs rounded transition-colors flex items-center justify-center gap-2 group-hover:border-gym-lime"
              >
                <Activity className="w-4 h-4 text-gym-lime" />
                <span>Open Biometrics & Notes</span>
              </button>

              <Link
                to="/trainer/workouts"
                className="w-full py-2 bg-gym-lime hover:bg-gym-lime-hover text-gym-black font-heading font-black uppercase text-xs rounded text-center shadow-lime-glow transition-all block"
              >
                Assign / Adjust Routine
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODAL: ATHLETE TELEMETRY & NOTES ================= */}
      {selectedAthlete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-gym-surface border border-gym-border rounded-sm max-w-2xl w-full p-6 relative shadow-card animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedAthlete(null)}
              className="absolute top-4 right-4 p-1.5 text-gym-muted hover:text-white rounded bg-gym-black/50"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-gym-border">
              <img
                src={selectedAthlete.avatar}
                alt={selectedAthlete.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-gym-lime"
              />
              <div>
                <h3 className="font-heading text-2xl font-black uppercase text-gym-primary">
                  {selectedAthlete.name}
                </h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gym-lime font-mono">{selectedAthlete.tier}</span>
                  <span className="text-gym-muted">&bull;</span>
                  <span className="text-gym-secondary">{selectedAthlete.email}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 pt-4 border-b border-gym-border">
              {[
                { id: 'overview', label: 'Program & Bio' },
                { id: 'prs', label: 'Big 3 Benchmarks' },
                { id: 'notes', label: `Coach Notes (${selectedAthlete.coachNotes.length})` },
                { id: 'log_progress', label: '+ Log Progress' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 text-xs font-heading uppercase font-bold border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-gym-lime text-gym-lime'
                      : 'border-transparent text-gym-secondary hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-gym-black p-3 rounded border border-gym-border">
                    <span className="text-[10px] text-gym-muted uppercase block font-heading">Body Weight</span>
                    <span className="font-heading text-xl font-black text-white">{selectedAthlete.bodyWeight} kg</span>
                  </div>
                  <div className="bg-gym-black p-3 rounded border border-gym-border">
                    <span className="text-[10px] text-gym-muted uppercase block font-heading">Est. Body Fat</span>
                    <span className="font-heading text-xl font-black text-gym-lime">{selectedAthlete.bodyFat}%</span>
                  </div>
                  <div className="bg-gym-black p-3 rounded border border-gym-border">
                    <span className="text-[10px] text-gym-muted uppercase block font-heading">Deadlift 1RM</span>
                    <span className="font-heading text-xl font-black text-white">{selectedAthlete.deadliftPR} kg</span>
                  </div>
                  <div className="bg-gym-black p-3 rounded border border-gym-border">
                    <span className="text-[10px] text-gym-muted uppercase block font-heading">Visits (MTD)</span>
                    <span className="font-heading text-xl font-black text-cyan-400">{selectedAthlete.sessionsLogged}</span>
                  </div>
                </div>

                <div className="bg-gym-black p-4 rounded border border-gym-border">
                  <span className="text-xs uppercase font-heading font-bold text-gym-secondary block mb-1">
                    Assigned Periodization Program
                  </span>
                  <div className="font-heading text-lg font-black text-gym-primary uppercase">
                    {selectedAthlete.program}
                  </div>
                  <p className="text-xs text-gym-muted mt-1">
                    Calibrated by Master Coach Marcus Drake. Next deload week scheduled in 14 days.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('log_progress')}
                    className="px-4 py-2 bg-gym-lime text-gym-black font-heading uppercase font-bold text-xs rounded hover:bg-gym-lime-hover shadow-lime-glow transition-all"
                  >
                    Log New Metric / PR
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: PRs */}
            {activeTab === 'prs' && (
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gym-black p-4 rounded border border-gym-border text-center">
                    <span className="text-xs text-gym-secondary uppercase font-heading font-bold block mb-1">
                      Bench Press
                    </span>
                    <span className="font-heading text-3xl font-black text-white">{selectedAthlete.benchPR}</span>
                    <span className="text-[10px] text-gym-muted block mt-1">kg 1RM Benchmark</span>
                  </div>

                  <div className="bg-gym-black p-4 rounded border border-gym-border text-center">
                    <span className="text-xs text-gym-secondary uppercase font-heading font-bold block mb-1">
                      Back Squat
                    </span>
                    <span className="font-heading text-3xl font-black text-cyan-400">{selectedAthlete.squatPR}</span>
                    <span className="text-[10px] text-gym-muted block mt-1">kg 1RM Benchmark</span>
                  </div>

                  <div className="bg-gym-black p-4 rounded border border-gym-border text-center">
                    <span className="text-xs text-gym-secondary uppercase font-heading font-bold block mb-1">
                      Deadlift
                    </span>
                    <span className="font-heading text-3xl font-black text-gym-lime">{selectedAthlete.deadliftPR}</span>
                    <span className="text-[10px] text-gym-muted block mt-1">kg 1RM Benchmark</span>
                  </div>
                </div>

                <div className="p-3 bg-gym-black/50 border border-gym-border rounded text-xs text-gym-secondary flex items-center justify-between">
                  <span>Compound 3-Lift Total:</span>
                  <span className="font-heading font-black text-base text-gym-lime">
                    {selectedAthlete.benchPR + selectedAthlete.squatPR + selectedAthlete.deadliftPR} kg
                  </span>
                </div>
              </div>
            )}

            {/* Tab 3: Notes */}
            {activeTab === 'notes' && (
              <div className="py-4 space-y-4">
                {/* Add Note Form */}
                <form onSubmit={handleAddCoachNote} className="space-y-2">
                  <label className="text-xs uppercase font-heading font-bold text-gym-secondary block">
                    Write Coach's Guidance / Biomechanics Cue
                  </label>
                  <textarea
                    rows={3}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="e.g. Focus on chest up and lat engagement during second pull. Keep working weight at 85% 1RM."
                    className="w-full p-3 bg-gym-black border border-gym-border rounded text-xs text-gym-primary focus:outline-none focus:border-gym-lime"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newNoteText.trim()}
                      className="px-4 py-2 bg-gym-lime disabled:opacity-50 text-gym-black font-heading uppercase font-bold text-xs rounded hover:bg-gym-lime-hover shadow-lime-glow transition-all"
                    >
                      Post Note to Athlete
                    </button>
                  </div>
                </form>

                {/* Notes Feed */}
                <div className="space-y-3 pt-3 border-t border-gym-border">
                  {selectedAthlete.coachNotes.map((note) => (
                    <div key={note.id} className="p-3 bg-gym-black border border-gym-border rounded text-xs">
                      <div className="flex items-center justify-between text-gym-muted mb-1 text-[11px]">
                        <span className="font-bold text-gym-lime">{note.author}</span>
                        <span className="font-mono">{note.date}</span>
                      </div>
                      <p className="text-gym-primary leading-relaxed">{note.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Log Progress */}
            {activeTab === 'log_progress' && (
              <form onSubmit={handleSaveProgress} className="py-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] uppercase font-heading font-bold text-gym-secondary block mb-1">
                      Body Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={logWeight}
                      onChange={(e) => setLogWeight(Number(e.target.value))}
                      className="w-full p-2.5 bg-gym-black border border-gym-border rounded text-xs text-white focus:outline-none focus:border-gym-lime font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase font-heading font-bold text-gym-secondary block mb-1">
                      Bench 1RM (kg)
                    </label>
                    <input
                      type="number"
                      value={logBench}
                      onChange={(e) => setLogBench(Number(e.target.value))}
                      className="w-full p-2.5 bg-gym-black border border-gym-border rounded text-xs text-white focus:outline-none focus:border-gym-lime font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase font-heading font-bold text-gym-secondary block mb-1">
                      Squat 1RM (kg)
                    </label>
                    <input
                      type="number"
                      value={logSquat}
                      onChange={(e) => setLogSquat(Number(e.target.value))}
                      className="w-full p-2.5 bg-gym-black border border-gym-border rounded text-xs text-white focus:outline-none focus:border-gym-lime font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase font-heading font-bold text-gym-secondary block mb-1">
                      Deadlift 1RM (kg)
                    </label>
                    <input
                      type="number"
                      value={logDeadlift}
                      onChange={(e) => setLogDeadlift(Number(e.target.value))}
                      className="w-full p-2.5 bg-gym-black border border-gym-border rounded text-xs text-white focus:outline-none focus:border-gym-lime font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase font-heading font-bold text-gym-secondary block mb-1">
                    Coach Observation / Session Notes
                  </label>
                  <input
                    type="text"
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    placeholder="e.g. Clean rep speed, solid intra-abdominal bracing."
                    className="w-full p-2.5 bg-gym-black border border-gym-border rounded text-xs text-white focus:outline-none focus:border-gym-lime"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className="px-4 py-2 bg-gym-black border border-gym-border text-gym-secondary font-heading uppercase font-bold text-xs rounded hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gym-lime text-gym-black font-heading uppercase font-bold text-xs rounded hover:bg-gym-lime-hover shadow-lime-glow transition-all"
                  >
                    Commit Biometric Telemetry
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
