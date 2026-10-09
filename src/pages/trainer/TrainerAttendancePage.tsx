import React from 'react';
import { CalendarCheck, MapPin, CheckCircle2 } from 'lucide-react';
import { useGymData } from '@/context/GymDataContext';

export const TrainerAttendancePage: React.FC = () => {
  const { attendance } = useGymData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
          ATHLETE FLOOR ATTENDANCE ROSTER
        </h2>
        <p className="text-xs text-gym-secondary">
          Live feed of athletes checking in and out through facility gates
        </p>
      </div>

      <div className="bg-gym-surface border border-gym-border rounded-sm p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gym-border text-gym-muted font-heading uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Athlete</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Check-In Time</th>
                <th className="py-3 px-4">Facility Zone</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Floor Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gym-border/40">
              {attendance.map((rec) => (
                <tr key={rec.id} className="hover:bg-gym-surface-hover/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gym-primary font-heading uppercase text-sm">
                    {rec.member_name || 'Alex Vance'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gym-secondary">{rec.date}</td>
                  <td className="py-3.5 px-4 font-mono text-white">
                    {new Date(rec.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3.5 px-4 text-gym-secondary flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gym-lime" />
                    <span>{rec.gym_location}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-gym-black border border-gym-border text-[10px] uppercase font-mono text-gym-secondary">
                      {rec.method}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-gym-lime font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Floor Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
