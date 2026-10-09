import React, { useState } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Calendar, 
  Award, 
  Activity, 
  Scale, 
  Dumbbell,
  ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { useGymData } from '@/context/GymDataContext';

export const MemberProgressPage: React.FC = () => {
  const { user } = useAuth();
  const { getMemberProgress, addProgressMetric } = useGymData();

  const [showLogModal, setShowLogModal] = useState(false);
  const [newWeight, setNewWeight] = useState(80.0);
  const [newBench, setNewBench] = useState(107.5);
  const [newSquat, setNewSquat] = useState(145.0);
  const [newDeadlift, setNewDeadlift] = useState(185.0);
  const [newBodyFat, setNewBodyFat] = useState(13.5);
  const [metricNotes, setMetricNotes] = useState('');

  if (!user) return null;

  const rawProgress = getMemberProgress(user.id);

  // Format data for Recharts
  const chartData = rawProgress.map(p => ({
    date: p.recorded_date.substring(5), // MM-DD
    weight: p.body_weight_kg,
    bench: p.bench_press_1rm || 0,
    squat: p.squat_1rm || 0,
    deadlift: p.deadlift_1rm || 0,
    bodyFat: p.body_fat_percentage || 0
  }));

  const latestRecord = rawProgress[rawProgress.length - 1];

  const handleSaveMetric = (e: React.FormEvent) => {
    e.preventDefault();
    addProgressMetric({
      member_id: user.id,
      recorded_date: new Date().toISOString().split('T')[0],
      body_weight_kg: Number(newWeight),
      bench_press_1rm: Number(newBench),
      squat_1rm: Number(newSquat),
      deadlift_1rm: Number(newDeadlift),
      body_fat_percentage: Number(newBodyFat),
      notes: metricNotes || 'Periodic reassessment'
    });
    setShowLogModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
            BIOMECHANICS & STRENGTH GAINS
          </h2>
          <p className="text-xs text-gym-secondary">
            Periodized tracking of body mass and powerlifting calibrated 1-Rep Maxes
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm font-heading uppercase font-bold text-xs bg-gym-lime text-gym-black hover:bg-gym-lime-hover shadow-lime-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Biomarker Check-In</span>
        </button>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gym-surface border border-gym-border p-5 rounded-sm">
          <div className="flex items-center justify-between text-gym-muted mb-2">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider">Body Weight</span>
            <Scale className="w-4 h-4 text-gym-lime" />
          </div>
          <div className="font-heading text-3xl font-black text-gym-primary">
            {latestRecord?.body_weight_kg || 79.8} <span className="text-sm font-normal text-gym-secondary">kg</span>
          </div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
            <ArrowUpRight className="w-3 h-3" /> Lean mass trending upward
          </span>
        </div>

        <div className="bg-gym-surface border border-gym-border p-5 rounded-sm">
          <div className="flex items-center justify-between text-gym-muted mb-2">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider">Bench Press 1RM</span>
            <Dumbbell className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-heading text-3xl font-black text-gym-primary">
            {latestRecord?.bench_press_1rm || 105} <span className="text-sm font-normal text-gym-secondary">kg</span>
          </div>
          <span className="text-[10px] text-gym-lime mt-1 block font-semibold">+10kg vs baseline</span>
        </div>

        <div className="bg-gym-surface border border-gym-border p-5 rounded-sm">
          <div className="flex items-center justify-between text-gym-muted mb-2">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider">Back Squat 1RM</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-heading text-3xl font-black text-gym-primary">
            {latestRecord?.squat_1rm || 142.5} <span className="text-sm font-normal text-gym-secondary">kg</span>
          </div>
          <span className="text-[10px] text-gym-lime mt-1 block font-semibold">+12.5kg vs baseline</span>
        </div>

        <div className="bg-gym-surface border border-gym-border p-5 rounded-sm">
          <div className="flex items-center justify-between text-gym-muted mb-2">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider">Deadlift 1RM</span>
            <Award className="w-4 h-4 text-gym-lime" />
          </div>
          <div className="font-heading text-3xl font-black text-gym-primary">
            {latestRecord?.deadlift_1rm || 180} <span className="text-sm font-normal text-gym-secondary">kg</span>
          </div>
          <span className="text-[10px] text-gym-lime mt-1 block font-semibold">+15kg vs baseline</span>
        </div>
      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strength Progress Chart */}
        <div className="bg-gym-surface border border-gym-border rounded-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-heading text-lg font-black uppercase tracking-wider text-gym-primary">
                1RM COMPOUND LIFTS EVOLUTION
              </h3>
              <p className="text-xs text-gym-secondary">Calibrated Barbell Big 3 Progression</p>
            </div>
            <span className="text-xs bg-gym-black border border-gym-border px-3 py-1 rounded text-gym-lime font-mono">
              In Kilograms (KG)
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#23252a" />
                <XAxis dataKey="date" stroke="#676c78" fontSize={11} />
                <YAxis stroke="#676c78" fontSize={11} domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#141518',
                    border: '1px solid #23252a',
                    borderRadius: '2px',
                    color: '#f5f6f8',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="deadlift" name="Deadlift (kg)" stroke="#ccff00" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="squat" name="Back Squat (kg)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="bench" name="Bench Press (kg)" stroke="#38bdf8" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Body Weight & Body Fat Chart */}
        <div className="bg-gym-surface border border-gym-border rounded-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-heading text-lg font-black uppercase tracking-wider text-gym-primary">
                BODY MASS & ADIPOSE COMPOSITION
              </h3>
              <p className="text-xs text-gym-secondary">InBody Scan Biometrics</p>
            </div>
            <span className="text-xs bg-gym-black border border-gym-border px-3 py-1 rounded text-gym-secondary font-mono">
              Body Mass (KG)
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#23252a" />
                <XAxis dataKey="date" stroke="#676c78" fontSize={11} />
                <YAxis stroke="#676c78" fontSize={11} domain={[70, 85]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#141518',
                    border: '1px solid #23252a',
                    borderRadius: '2px',
                    color: '#f5f6f8',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="weight" name="Body Weight (kg)" fill="#ccff00" radius={[2, 2, 0, 0]} />
                <Bar dataKey="bodyFat" name="Body Fat %" fill="#676c78" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Progress History Table */}
      <div className="bg-gym-surface border border-gym-border rounded-sm p-6">
        <h3 className="font-heading text-lg font-black uppercase tracking-wider text-gym-primary mb-4">
          RECORDED PROGRESS AUDIT
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gym-border text-gym-muted font-heading uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Weight</th>
                <th className="py-3 px-4">Bench 1RM</th>
                <th className="py-3 px-4">Squat 1RM</th>
                <th className="py-3 px-4">Deadlift 1RM</th>
                <th className="py-3 px-4">Body Fat %</th>
                <th className="py-3 px-4">Coach Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gym-border/40">
              {rawProgress.map(p => (
                <tr key={p.id} className="hover:bg-gym-surface-hover/60 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-gym-primary font-mono">{p.recorded_date}</td>
                  <td className="py-3.5 px-4 font-bold text-gym-lime">{p.body_weight_kg} kg</td>
                  <td className="py-3.5 px-4 text-gym-secondary">{p.bench_press_1rm ? `${p.bench_press_1rm} kg` : '-'}</td>
                  <td className="py-3.5 px-4 text-gym-secondary">{p.squat_1rm ? `${p.squat_1rm} kg` : '-'}</td>
                  <td className="py-3.5 px-4 font-bold text-white">{p.deadlift_1rm ? `${p.deadlift_1rm} kg` : '-'}</td>
                  <td className="py-3.5 px-4 text-gym-secondary">{p.body_fat_percentage ? `${p.body_fat_percentage}%` : '-'}</td>
                  <td className="py-3.5 px-4 text-gym-muted italic">{p.notes || 'Routine check'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: RECORD NEW METRIC ================= */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gym-surface border border-gym-border rounded-sm max-w-md w-full p-6 relative shadow-card animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowLogModal(false)}
              className="absolute top-4 right-4 text-gym-muted hover:text-white text-sm"
            >
              ✕
            </button>

            <h3 className="font-heading text-xl font-black uppercase text-gym-primary tracking-wide mb-1">
              RECORD BIOMARKER & 1RM CHECK
            </h3>
            <p className="text-xs text-gym-secondary mb-4">
              Enter updated verified numbers from today's session or assessment.
            </p>

            <form onSubmit={handleSaveMetric} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                    Body Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    required
                    className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary font-bold focus:outline-none focus:border-gym-lime"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                    Body Fat %
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newBodyFat}
                    onChange={(e) => setNewBodyFat(Number(e.target.value))}
                    className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary font-bold focus:outline-none focus:border-gym-lime"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                    Bench (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newBench}
                    onChange={(e) => setNewBench(Number(e.target.value))}
                    className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary font-bold focus:outline-none focus:border-gym-lime"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                    Squat (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newSquat}
                    onChange={(e) => setNewSquat(Number(e.target.value))}
                    className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary font-bold focus:outline-none focus:border-gym-lime"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                    Deadlift (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newDeadlift}
                    onChange={(e) => setNewDeadlift(Number(e.target.value))}
                    className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary font-bold focus:outline-none focus:border-gym-lime"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Eleiko calibrated plates test"
                  value={metricNotes}
                  onChange={(e) => setMetricNotes(e.target.value)}
                  className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-xs focus:outline-none focus:border-gym-lime"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="w-1/2 py-2.5 bg-gym-black hover:bg-gym-surface border border-gym-border text-gym-secondary text-xs uppercase font-heading font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-gym-lime hover:bg-gym-lime-hover text-gym-black text-xs uppercase font-heading font-black tracking-wider rounded shadow-lime-glow"
                >
                  Save Biomarkers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
