import React, { useState } from 'react';
import { Dumbbell, Plus, Trash2, Clock, Check, Layers, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGymData } from '@/context/GymDataContext';
import type { WorkoutCategory, WorkoutExercise } from '@/types';

export const TrainerWorkoutsPage: React.FC = () => {
  const { user } = useAuth();
  const { workoutPlans, createWorkoutPlan } = useGymData();

  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('user-member-1');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<WorkoutCategory>('Push');
  const [notes, setNotes] = useState('');

  // Builder exercise items
  const [exercises, setExercises] = useState<Omit<WorkoutExercise, 'id' | 'plan_id'>[]>([
    { exercise_name: 'Incline Dumbbell Press', sets: 4, reps: 10, target_weight_kg: 34, rest_seconds: 90, order_index: 1, instructions: '30-degree incline, 2s eccentric pause' },
    { exercise_name: 'Barbell Overhead Press', sets: 4, reps: 8, target_weight_kg: 60, rest_seconds: 120, order_index: 2, instructions: 'Clean bar path directly over midfoot' }
  ]);

  const memberOptions = [
    { id: 'user-member-1', name: 'Alex Vance (Performance Tier)' },
    { id: 'user-member-2', name: 'Elena Rostova (Elite Tier)' },
    { id: 'user-member-3', name: 'Jordan Bell (Starter Tier)' }
  ];

  const handleAddExerciseRow = () => {
    setExercises(prev => [
      ...prev,
      {
        exercise_name: '',
        sets: 3,
        reps: 10,
        target_weight_kg: 20,
        rest_seconds: 60,
        order_index: prev.length + 1,
        instructions: ''
      }
    ]);
  };

  const handleRemoveExerciseRow = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleExerciseChange = (index: number, field: string, value: any) => {
    setExercises(prev => prev.map((ex, i) => i === index ? { ...ex, [field]: value } : ex));
  };

  const handleSubmitPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || exercises.length === 0) return;

    const chosenMember = memberOptions.find(m => m.id === selectedMemberId);

    createWorkoutPlan({
      trainer_id: user?.id,
      trainer_name: user?.full_name || 'Marcus Drake',
      member_id: selectedMemberId,
      member_name: chosenMember ? chosenMember.name.split(' (')[0] : 'Alex Vance',
      title,
      category,
      notes,
      is_active: true,
      exercises: exercises.map((ex, i) => ({
        ...ex,
        id: `ex-new-${Date.now()}-${i}`,
        plan_id: 'new'
      }))
    });

    setShowBuilderModal(false);
    setTitle('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
            PROGRAM ARCHITECT & SPLIT BUILDER
          </h2>
          <p className="text-xs text-gym-secondary">
            Design periodized lifting routines, exercise sets, rest timers, and prescribe load
          </p>
        </div>

        <button
          onClick={() => setShowBuilderModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm font-heading uppercase font-bold text-xs bg-gym-lime text-gym-black hover:bg-gym-lime-hover shadow-lime-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Architect New Program</span>
        </button>
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workoutPlans.map(plan => (
          <div key={plan.id} className="bg-gym-surface border border-gym-border rounded-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading text-xl font-black uppercase text-gym-primary tracking-wide">
                  {plan.title}
                </span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-heading font-black uppercase bg-gym-lime/10 text-gym-lime border border-gym-lime/20">
                  {plan.category}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-gym-secondary mb-3">
                <User className="w-3.5 h-3.5 text-gym-lime" />
                <span>Athlete: <strong className="text-white">{plan.member_name || 'Alex Vance'}</strong></span>
                <span>&bull;</span>
                <span>Coach: <strong className="text-gym-primary">{plan.trainer_name || 'Marcus Drake'}</strong></span>
              </div>

              <p className="text-xs text-gym-secondary mb-4 italic leading-relaxed">
                "{plan.notes || 'Follow programmed cadence.'}"
              </p>

              <div className="space-y-2 border-t border-gym-border pt-4">
                <div className="text-[11px] font-heading uppercase font-bold text-gym-muted mb-2">
                  Prescribed Exercise Movement Hierarchy:
                </div>
                {plan.exercises?.map((ex, i) => (
                  <div key={ex.id || i} className="p-2.5 bg-gym-black rounded border border-gym-border flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gym-primary uppercase block">
                        {ex.exercise_name}
                      </span>
                      <span className="text-[11px] text-gym-secondary">
                        {ex.sets} sets &times; {ex.reps} reps &bull; {ex.rest_seconds}s rest
                      </span>
                    </div>
                    <span className="font-heading font-black text-xs text-gym-lime bg-gym-surface px-2 py-1 rounded border border-gym-border">
                      {ex.target_weight_kg > 0 ? `${ex.target_weight_kg} kg` : 'Bodyweight'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gym-border flex items-center justify-between text-xs">
              <span className="text-gym-muted font-mono">ID: {plan.id}</span>
              <span className="text-gym-lime font-bold">Active in Athlete App</span>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODAL: ARCHITECT PROGRAM ================= */}
      {showBuilderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-gym-surface border border-gym-border rounded-sm max-w-2xl w-full p-6 relative shadow-card my-8">
            <button
              onClick={() => setShowBuilderModal(false)}
              className="absolute top-4 right-4 text-gym-muted hover:text-white text-sm"
            >
              ✕
            </button>

            <h3 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide mb-1">
              ARCHITECT PERIODIZED WORKOUT PROGRAM
            </h3>
            <p className="text-xs text-gym-secondary mb-4">
              Prescribe specific exercise movements, targeted load, rep schemes, and rest intervals.
            </p>

            <form onSubmit={handleSubmitPlan} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                    Assign To Athlete
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-xs focus:outline-none focus:border-gym-lime"
                  >
                    {memberOptions.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                    Workout Category / Movement Pattern
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as WorkoutCategory)}
                    className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-xs focus:outline-none focus:border-gym-lime"
                  >
                    {['Push', 'Pull', 'Legs', 'Chest', 'Back', 'Shoulders', 'Arms', 'Full Body', 'Cardio & Core'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                  Routine Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Upper Body CNS Power & Hypertrophy"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-xs focus:outline-none focus:border-gym-lime"
                />
              </div>

              <div>
                <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                  Coach Technical Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Keep 2s pause at chest. Scapulae retracted throughout."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-xs focus:outline-none focus:border-gym-lime"
                />
              </div>

              {/* Dynamic Exercise Rows */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-heading font-bold uppercase text-gym-secondary">
                    Prescribed Movements ({exercises.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddExerciseRow}
                    className="text-xs text-gym-lime hover:underline font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Movement
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {exercises.map((ex, idx) => (
                    <div key={idx} className="p-3 bg-gym-black rounded border border-gym-border space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          placeholder="Movement Name (e.g. Barbell Squat)"
                          value={ex.exercise_name}
                          onChange={(e) => handleExerciseChange(idx, 'exercise_name', e.target.value)}
                          required
                          className="flex-1 py-1.5 px-2 bg-gym-surface border border-gym-border rounded text-gym-primary text-xs font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExerciseRow(idx)}
                          className="text-gym-muted hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="block text-[9px] uppercase text-gym-muted font-heading">Sets</label>
                          <input
                            type="number"
                            value={ex.sets}
                            onChange={(e) => handleExerciseChange(idx, 'sets', Number(e.target.value))}
                            className="w-full py-1 px-2 bg-gym-surface border border-gym-border rounded text-xs text-center text-gym-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase text-gym-muted font-heading">Reps</label>
                          <input
                            type="number"
                            value={ex.reps}
                            onChange={(e) => handleExerciseChange(idx, 'reps', Number(e.target.value))}
                            className="w-full py-1 px-2 bg-gym-surface border border-gym-border rounded text-xs text-center text-gym-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase text-gym-muted font-heading">Weight (kg)</label>
                          <input
                            type="number"
                            value={ex.target_weight_kg}
                            onChange={(e) => handleExerciseChange(idx, 'target_weight_kg', Number(e.target.value))}
                            className="w-full py-1 px-2 bg-gym-surface border border-gym-border rounded text-xs text-center text-gym-lime font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase text-gym-muted font-heading">Rest (s)</label>
                          <input
                            type="number"
                            value={ex.rest_seconds}
                            onChange={(e) => handleExerciseChange(idx, 'rest_seconds', Number(e.target.value))}
                            className="w-full py-1 px-2 bg-gym-surface border border-gym-border rounded text-xs text-center text-gym-primary"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBuilderModal(false)}
                  className="w-1/3 py-2.5 bg-gym-black hover:bg-gym-surface border border-gym-border text-gym-secondary text-xs uppercase font-heading font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-gym-lime hover:bg-gym-lime-hover text-gym-black text-xs uppercase font-heading font-black tracking-wider rounded shadow-lime-glow"
                >
                  Publish & Deploy Routine To Athlete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
