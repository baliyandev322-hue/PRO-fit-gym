import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  Sparkles, 
  DollarSign, 
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useGymData } from '@/context/GymDataContext';
import type { MembershipPlan } from '@/types';

export const AdminMembershipsPage: React.FC = () => {
  const { plans, createPlan, updatePlan, deletePlan } = useGymData();

  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState(199);
  const [durationDays, setDurationDays] = useState(30);
  const [description, setDescription] = useState('');
  const [featuresStr, setFeaturesStr] = useState('');
  const [isPopular, setIsPopular] = useState(false);

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setName('');
    setSlug('');
    setPrice(199);
    setDurationDays(30);
    setDescription('');
    setFeaturesStr('Full gym floor access\nSauna & cold plunge access\nMobile app workout tracker');
    setIsPopular(false);
    setShowModal(true);
  };

  const handleOpenEdit = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setSlug(plan.slug);
    setPrice(plan.price);
    setDurationDays(plan.duration_days);
    setDescription(plan.description);
    setFeaturesStr(plan.features.join('\n'));
    setIsPopular(!!plan.is_popular);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const featuresList = featuresStr.split('\n').map(s => s.trim()).filter(Boolean);

    if (editingPlan) {
      updatePlan(editingPlan.id, {
        name,
        slug,
        price: Number(price),
        duration_days: Number(durationDays),
        description,
        features: featuresList,
        is_popular: isPopular
      });
    } else {
      createPlan({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        price: Number(price),
        duration_days: Number(durationDays),
        description,
        features: featuresList,
        is_popular: isPopular,
        is_active: true
      });
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
            MEMBERSHIP TIERS & PRICING ARCHITECTURE
          </h2>
          <p className="text-xs text-gym-secondary">
            Configure subscription tiers, pricing, billing duration, and athlete amenities
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm font-heading uppercase font-bold text-xs bg-gym-lime text-gym-black hover:bg-gym-lime-hover shadow-lime-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Tier</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div
            key={plan.id}
            className={`bg-gym-surface border rounded-sm p-6 flex flex-col justify-between transition-all ${
              plan.is_popular ? 'border-gym-lime/50 shadow-lime-glow' : 'border-gym-border'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
                  {plan.name}
                </span>
                {plan.is_popular && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-heading font-black uppercase bg-gym-lime text-gym-black">
                    Popular
                  </span>
                )}
              </div>

              <p className="text-xs text-gym-secondary mb-4 leading-relaxed">
                {plan.description}
              </p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-heading text-4xl font-black text-gym-lime">
                  ${plan.price}
                </span>
                <span className="text-xs text-gym-secondary font-medium">/ {plan.duration_days} days</span>
              </div>

              <div className="space-y-2 border-t border-gym-border pt-4 mb-6">
                <span className="text-[10px] font-heading uppercase font-bold text-gym-muted block mb-2">
                  Included Amenities ({plan.features.length})
                </span>
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-gym-secondary">
                    <Check className="w-3.5 h-3.5 text-gym-lime shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gym-border flex gap-2">
              <button
                onClick={() => handleOpenEdit(plan)}
                className="w-1/2 py-2 bg-gym-black hover:bg-gym-surface border border-gym-border rounded text-xs font-heading font-bold uppercase text-gym-primary flex items-center justify-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Tier
              </button>
              <button
                onClick={() => deletePlan(plan.id)}
                className="w-1/2 py-2 bg-gym-black hover:bg-gym-danger/20 border border-gym-border hover:border-gym-danger/40 rounded text-xs font-heading font-bold uppercase text-gym-muted hover:text-red-400 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Archive
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODAL: CREATE / EDIT PLAN ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-gym-surface border border-gym-border rounded-sm max-w-lg w-full p-6 relative shadow-card animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gym-muted hover:text-white text-sm"
            >
              ✕
            </button>

            <h3 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide mb-1">
              {editingPlan ? 'EDIT MEMBERSHIP TIER' : 'ARCHITECT NEW MEMBERSHIP TIER'}
            </h3>
            <p className="text-xs text-gym-secondary mb-4">
              Set tier parameters, pricing, duration, and feature bullets.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Performance VIP"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-xs focus:outline-none focus:border-gym-lime"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="performance-vip"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-xs focus:outline-none focus:border-gym-lime"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    required
                    className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-xs font-bold focus:outline-none focus:border-gym-lime"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    required
                    className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-xs focus:outline-none focus:border-gym-lime"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                  Tagline / Description
                </label>
                <input
                  type="text"
                  placeholder="Short description of who this plan is for..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-xs focus:outline-none focus:border-gym-lime"
                />
              </div>

              <div>
                <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                  Included Features (One per line)
                </label>
                <textarea
                  rows={4}
                  value={featuresStr}
                  onChange={(e) => setFeaturesStr(e.target.value)}
                  className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-xs focus:outline-none focus:border-gym-lime font-mono"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="popular-tier"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="h-4 w-4 rounded bg-gym-black border-gym-border text-gym-lime focus:ring-gym-lime"
                />
                <label htmlFor="popular-tier" className="ml-2 text-xs text-gym-secondary">
                  Highlight as 'Popular / Recommended' badge
                </label>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/3 py-2.5 bg-gym-black hover:bg-gym-surface border border-gym-border text-gym-secondary text-xs uppercase font-heading font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-gym-lime hover:bg-gym-lime-hover text-gym-black text-xs uppercase font-heading font-black tracking-wider rounded shadow-lime-glow"
                >
                  Save Tier Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
