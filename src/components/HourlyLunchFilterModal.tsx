import React, { useMemo } from 'react';
import { 
  X, 
  Clock, 
  Utensils, 
  RotateCcw, 
  Check, 
  Ban, 
  Coffee, 
  Sun, 
  Sunset, 
  Building2,
  CalendarClock,
  Sparkles
} from 'lucide-react';
import { CDRRecord } from '../types';

interface HourlyLunchFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHours: number[]; // e.g. [8, 9, 10, 11, 14, 15, 16, 17] (0-23)
  onSetSelectedHours: (hours: number[]) => void;
  excludedHours: number[]; // hours specifically marked as lunch / pause, e.g. [13]
  onSetExcludedHours: (hours: number[]) => void;
  cdrRecords: CDRRecord[];
}

export const HourlyLunchFilterModal: React.FC<HourlyLunchFilterModalProps> = ({
  isOpen,
  onClose,
  selectedHours,
  onSetSelectedHours,
  excludedHours,
  onSetExcludedHours,
  cdrRecords
}) => {
  // Call counts per hour (0 to 23)
  const hourlyCallCounts = useMemo(() => {
    const counts = new Array(24).fill(0);
    cdrRecords.forEach(r => {
      const h = r.dateTime.getHours();
      counts[h]++;
    });
    return counts;
  }, [cdrRecords]);

  const maxCallsInAnHour = useMemo(() => {
    return Math.max(1, ...hourlyCallCounts);
  }, [hourlyCallCounts]);

  // Is all 24 hours included and no lunch excluded?
  const is24HoursFull = selectedHours.length === 24 && excludedHours.length === 0;

  // Toggle single hour
  const handleToggleHour = (hour: number) => {
    if (selectedHours.includes(hour)) {
      // Exclude this hour
      onSetSelectedHours(selectedHours.filter(h => h !== hour));
    } else {
      // Include this hour
      const next = [...selectedHours, hour].sort((a, b) => a - b);
      onSetSelectedHours(next);
      if (excludedHours.includes(hour)) {
        onSetExcludedHours(excludedHours.filter(h => h !== hour));
      }
    }
  };

  // Preset: 24 Hours
  const handleSet24Hours = () => {
    onSetSelectedHours(Array.from({ length: 24 }, (_, i) => i));
    onSetExcludedHours([]);
  };

  // Preset: Standard Office 08:00 - 18:00
  const handleSetStandardOffice = () => {
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
    onSetSelectedHours(hours);
    onSetExcludedHours([]);
  };

  // Preset: Turno Mañana (08:00 - 14:00)
  const handleSetMorningShift = () => {
    const hours = [8, 9, 10, 11, 12, 13];
    onSetSelectedHours(hours);
    onSetExcludedHours([]);
  };

  // Preset: Turno Tarde (14:00 - 20:00)
  const handleSetAfternoonShift = () => {
    const hours = [14, 15, 16, 17, 18, 19];
    onSetSelectedHours(hours);
    onSetExcludedHours([]);
  };

  // Quick Lunch Exclusions (keep working hours but exclude specific lunch hour)
  const handleExcludeLunchHour = (lunchHour: number) => {
    const baseHours = selectedHours.length > 0 ? selectedHours : [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    const newSelected = baseHours.filter(h => h !== lunchHour);
    onSetSelectedHours(newSelected);
    onSetExcludedHours(Array.from(new Set([...excludedHours, lunchHour])));
  };

  const handleExcludeLunchSpan = (startHour: number, endHour: number) => {
    const baseHours = selectedHours.length > 0 ? selectedHours : [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    const toExclude = [];
    for (let h = startHour; h < endHour; h++) {
      toExclude.push(h);
    }
    const newSelected = baseHours.filter(h => !toExclude.includes(h));
    onSetSelectedHours(newSelected);
    onSetExcludedHours(Array.from(new Set([...excludedHours, ...toExclude])));
  };

  if (!isOpen) return null;

  return (
    <div 
      id="modal-hourly-lunch-filter"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-[#131317] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#0d0d10] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Filtro de Horarios y Exclusión de Almuerzos</span>
                {excludedHours.length > 0 && (
                  <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full font-mono border border-amber-500/30">
                    Almuerzo ({excludedHours.map(h => `${h}:00`).join(', ')})
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Omite las horas de comida de los agentes para evitar falsas alertas críticas de inactividad.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          {/* Quick Lunch Exclusion Shortcuts */}
          <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2.5">
              <Utensils className="w-4 h-4" />
              <span>Exclusión Rápida de Almuerzos (1 Clic)</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Selecciona la franja habitual de colación del equipo para excluirla de los cálculos de tiempos muertos:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleExcludeLunchHour(12)}
                className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                  excludedHours.includes(12) && !selectedHours.includes(12)
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 font-bold'
                    : 'bg-[#1a1a20] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>🥪 Almuerzo 12:00 - 13:00</span>
                {excludedHours.includes(12) && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              <button
                type="button"
                onClick={() => handleExcludeLunchHour(13)}
                className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                  excludedHours.includes(13) && !selectedHours.includes(13)
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 font-bold'
                    : 'bg-[#1a1a20] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>🥪 Almuerzo 13:00 - 14:00</span>
                {excludedHours.includes(13) && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              <button
                type="button"
                onClick={() => handleExcludeLunchHour(14)}
                className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                  excludedHours.includes(14) && !selectedHours.includes(14)
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 font-bold'
                    : 'bg-[#1a1a20] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>🥪 Almuerzo 14:00 - 15:00</span>
                {excludedHours.includes(14) && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              <button
                type="button"
                onClick={() => handleExcludeLunchSpan(12, 14)}
                className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                  excludedHours.includes(12) && excludedHours.includes(13)
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 font-bold'
                    : 'bg-[#1a1a20] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>🍲 Almuerzo 12:00 - 14:00</span>
                {excludedHours.includes(12) && excludedHours.includes(13) && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              <button
                type="button"
                onClick={() => handleExcludeLunchSpan(13, 15)}
                className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                  excludedHours.includes(13) && excludedHours.includes(14)
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 font-bold'
                    : 'bg-[#1a1a20] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>🍲 Almuerzo 13:00 - 15:00</span>
                {excludedHours.includes(13) && excludedHours.includes(14) && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              <button
                type="button"
                onClick={handleSet24Hours}
                className="p-2.5 rounded-lg bg-[#1a1a20] border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 text-left flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Sin Almuerzos (Todo)</span>
                </span>
              </button>
            </div>
          </div>

          {/* Turno Presets */}
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
              Plantillas de Turnos Laborales
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={handleSetMorningShift}
                className="p-2.5 rounded-lg bg-[#16161a] hover:bg-[#1f1f26] border border-slate-800 text-slate-200 flex items-center gap-2 transition-all"
              >
                <Sun className="w-4 h-4 text-amber-400" />
                <div className="text-left">
                  <span className="font-semibold block">Mañana</span>
                  <span className="text-[10px] text-slate-500">08:00 - 14:00</span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleSetAfternoonShift}
                className="p-2.5 rounded-lg bg-[#16161a] hover:bg-[#1f1f26] border border-slate-800 text-slate-200 flex items-center gap-2 transition-all"
              >
                <Sunset className="w-4 h-4 text-orange-400" />
                <div className="text-left">
                  <span className="font-semibold block">Tarde</span>
                  <span className="text-[10px] text-slate-500">14:00 - 20:00</span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleSetStandardOffice}
                className="p-2.5 rounded-lg bg-[#16161a] hover:bg-[#1f1f26] border border-slate-800 text-slate-200 flex items-center gap-2 transition-all"
              >
                <Building2 className="w-4 h-4 text-indigo-400" />
                <div className="text-left">
                  <span className="font-semibold block">Oficina</span>
                  <span className="text-[10px] text-slate-500">08:00 - 18:00</span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleSet24Hours}
                className="p-2.5 rounded-lg bg-[#16161a] hover:bg-[#1f1f26] border border-slate-800 text-slate-200 flex items-center gap-2 transition-all"
              >
                <Clock className="w-4 h-4 text-emerald-400" />
                <div className="text-left">
                  <span className="font-semibold block">24 Horas</span>
                  <span className="text-[10px] text-slate-500">Todo el día</span>
                </div>
              </button>
            </div>
          </div>

          {/* Interactive 24-Hour Multi-Select Grid */}
          <div className="border border-slate-800 rounded-xl bg-[#0d0d10] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-indigo-400" />
                <span>Horas Activas e Inactivas (Haz clic para alternar)</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {selectedHours.length} de 24 hrs activas
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {Array.from({ length: 24 }, (_, hour) => {
                const isSelected = selectedHours.includes(hour);
                const isExcludedLunch = excludedHours.includes(hour);
                const count = hourlyCallCounts[hour];
                const heightPct = Math.max(8, Math.round((count / maxCallsInAnHour) * 100));

                return (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => handleToggleHour(hour)}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-between gap-1 transition-all select-none relative ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200 shadow-sm'
                        : isExcludedLunch
                        ? 'bg-amber-950/30 border-amber-700/50 text-amber-300'
                        : 'bg-[#16161a] border-slate-800/80 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-mono font-bold">
                      {String(hour).padStart(2, '0')}:00
                    </span>

                    {/* Mini visual volume bar */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden my-1">
                      <div 
                        className={`h-full rounded-full ${isSelected ? 'bg-indigo-400' : isExcludedLunch ? 'bg-amber-500' : 'bg-slate-600'}`}
                        style={{ width: `${heightPct}%` }}
                      ></div>
                    </div>

                    <span className="text-[10px] font-mono">
                      {count} ll.
                    </span>

                    {isExcludedLunch && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded uppercase font-bold tracking-tighter">
                        Almuerzo
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0d0d10] flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {is24HoursFull ? (
              <span className="text-emerald-400 font-semibold">24 Horas Activas (Sin restricciones)</span>
            ) : (
              <span className="text-indigo-300 font-mono font-semibold">
                {selectedHours.length} horas seleccionadas
                {excludedHours.length > 0 && ` • ${excludedHours.length} hr(s) de almuerzo excluidas`}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
          >
            Aplicar Horarios
          </button>
        </div>
      </div>
    </div>
  );
};
