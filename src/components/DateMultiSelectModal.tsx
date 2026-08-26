import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  CheckSquare, 
  Square, 
  RotateCcw, 
  Search, 
  PhoneCall, 
  Check,
  CalendarDays,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { CDRRecord, DatasetDateBounds } from '../types';
import { analyzeDatasetDateBounds, formatDateDisplay } from '../utils/cdrEngine';

interface DateMultiSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableDates: string[];
  selectedDates: string[];
  onToggleDate: (date: string) => void;
  onSetSelectedDates: (dates: string[]) => void;
  onSelectAllDates: () => void;
  cdrRecords: CDRRecord[];
  dateBounds?: DatasetDateBounds;
}

export const DateMultiSelectModal: React.FC<DateMultiSelectModalProps> = ({
  isOpen,
  onClose,
  availableDates,
  selectedDates,
  onToggleDate,
  onSetSelectedDates,
  onSelectAllDates,
  cdrRecords,
  dateBounds: customDateBounds
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Compute date bounds and call counts
  const bounds = useMemo(() => {
    return customDateBounds || analyzeDatasetDateBounds(cdrRecords);
  }, [customDateBounds, cdrRecords]);

  // Synchronized available dates from bounds to guarantee zero truncation
  const effectiveAvailableDates = useMemo(() => {
    if (availableDates && availableDates.length > 0) {
      return availableDates;
    }
    return bounds.availableDates;
  }, [availableDates, bounds.availableDates]);

  // Filtered dates by search term
  const filteredDates = useMemo(() => {
    if (!searchTerm.trim()) return effectiveAvailableDates;
    const term = searchTerm.toLowerCase().trim();
    return effectiveAvailableDates.filter(d => {
      const formatted = formatDateDisplay(d, 'long').toLowerCase();
      return d.toLowerCase().includes(term) || formatted.includes(term);
    });
  }, [effectiveAvailableDates, searchTerm]);

  // Is all dates currently active?
  const isAllSelected = selectedDates.length === 0 || 
    selectedDates.includes('all') || 
    (effectiveAvailableDates.length > 0 && selectedDates.length === effectiveAvailableDates.length);

  const isDateChecked = (date: string) => {
    if (isAllSelected) return true;
    return selectedDates.includes(date);
  };

  const handleSelectEarliest = () => {
    if (bounds.minDateStr) {
      onSetSelectedDates([bounds.minDateStr]);
    } else if (effectiveAvailableDates.length > 0) {
      onSetSelectedDates([effectiveAvailableDates[0]]);
    }
  };

  const handleSelectLatest = () => {
    if (bounds.maxDateStr) {
      onSetSelectedDates([bounds.maxDateStr]);
    } else if (effectiveAvailableDates.length > 0) {
      onSetSelectedDates([effectiveAvailableDates[effectiveAvailableDates.length - 1]]);
    }
  };

  const handleSelectLast3 = () => {
    if (effectiveAvailableDates.length > 0) {
      const last3 = effectiveAvailableDates.slice(-3);
      onSetSelectedDates(last3);
    }
  };

  const handleSelectFullRange = () => {
    onSelectAllDates();
  };

  if (!isOpen) return null;

  return (
    <div 
      id="modal-date-multiselect"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-[#131317] border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#0d0d10] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Rango de Fechas del Dataset</span>
                {!isAllSelected && (
                  <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-indigo-500/30">
                    {selectedDates.length} de {effectiveAvailableDates.length} {selectedDates.length === 1 ? 'día' : 'días'}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Selecciona las fechas que deseas incluir en las auditorías y análisis de tiempos muertos.
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

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Dataset Date Bounds Banner */}
          <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-[#131317] border border-indigo-900/40 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Rango Real Detectado en los Datos
              </span>
              <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {effectiveAvailableDates.length} {effectiveAvailableDates.length === 1 ? 'Día detectado' : 'Días detectados'}
              </span>
            </div>

            {effectiveAvailableDates.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div className="bg-[#0a0a0c]/70 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Fecha Mínima (Inicio)</span>
                  <span className="text-sm font-mono font-bold text-white block mt-0.5">
                    {bounds.minDateStr || effectiveAvailableDates[0]}
                  </span>
                  <span className="text-[10px] text-indigo-400 capitalize">
                    {bounds.minDateStr ? formatDateDisplay(bounds.minDateStr, 'medium') : ''}
                  </span>
                </div>

                <div className="bg-[#0a0a0c]/70 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Fecha Máxima (Fin)</span>
                  <span className="text-sm font-mono font-bold text-white block mt-0.5">
                    {bounds.maxDateStr || effectiveAvailableDates[effectiveAvailableDates.length - 1]}
                  </span>
                  <span className="text-[10px] text-indigo-400 capitalize">
                    {bounds.maxDateStr ? formatDateDisplay(bounds.maxDateStr, 'medium') : ''}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-2 text-center">
                No hay fechas detectadas en el dataset actual.
              </div>
            )}
          </div>

          {/* Quick Filter Presets */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
              Accesos Rápidos de Rango
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleSelectFullRange}
                className={`px-3 py-2 rounded-lg border font-medium transition-all ${
                  isAllSelected 
                    ? 'bg-indigo-600 text-white border-indigo-500 font-bold shadow-md shadow-indigo-600/20' 
                    : 'bg-[#1a1a20] border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Todos los Días ({effectiveAvailableDates.length})
              </button>

              {effectiveAvailableDates.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handleSelectEarliest}
                    className="px-3 py-2 rounded-lg bg-[#1a1a20] hover:bg-slate-800 text-slate-300 border border-slate-700 font-medium transition-all"
                  >
                    Día Inicial ({bounds.minDateStr || effectiveAvailableDates[0]})
                  </button>

                  <button
                    type="button"
                    onClick={handleSelectLatest}
                    className="px-3 py-2 rounded-lg bg-[#1a1a20] hover:bg-slate-800 text-slate-300 border border-slate-700 font-medium transition-all"
                  >
                    Día Final ({bounds.maxDateStr || effectiveAvailableDates[effectiveAvailableDates.length - 1]})
                  </button>
                </>
              )}

              {effectiveAvailableDates.length > 2 && (
                <button
                  type="button"
                  onClick={handleSelectLast3}
                  className="px-3 py-2 rounded-lg bg-[#1a1a20] hover:bg-slate-800 text-slate-300 border border-slate-700 font-medium transition-all"
                >
                  Últimos 3 Días
                </button>
              )}
            </div>
          </div>

          {/* Search bar if multiple dates */}
          {effectiveAvailableDates.length > 3 && (
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar fecha específica (ej: 2026-08-18 o 'agosto')..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1a1a20] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          )}

          {/* Date Checklist List */}
          <div className="border border-slate-800 rounded-xl bg-[#0d0d10] p-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2 px-1">
              <span>Fechas del Dataset ({filteredDates.length})</span>
              <span className="text-[11px] text-slate-500">Haz clic para alternar selección</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {filteredDates.map((dateStr, index) => {
                const checked = isDateChecked(dateStr);
                const count = bounds.dateCounts[dateStr] || 0;
                const totalCalls = bounds.totalRecordsProcessed || 1;
                const pct = Math.round((count / totalCalls) * 100);

                const isFirst = dateStr === bounds.minDateStr;
                const isLast = dateStr === bounds.maxDateStr && bounds.minDateStr !== bounds.maxDateStr;

                const formattedName = formatDateDisplay(dateStr, 'long');

                return (
                  <div
                    key={dateStr}
                    onClick={() => {
                      if (isAllSelected) {
                        onSetSelectedDates([dateStr]);
                      } else {
                        onToggleDate(dateStr);
                      }
                    }}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all select-none ${
                      checked 
                        ? 'bg-indigo-950/30 border-indigo-600/50 text-indigo-100 shadow-sm' 
                        : 'bg-[#16161a] border-slate-800/80 text-slate-400 hover:border-slate-700 hover:bg-[#1a1a20]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] transition-colors ${
                        checked 
                          ? 'bg-indigo-600 border-indigo-500 text-white font-bold' 
                          : 'border-slate-600 bg-transparent text-transparent'
                      }`}>
                        {checked ? '✓' : ''}
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-mono font-bold ${checked ? 'text-white' : 'text-slate-300'}`}>
                            {dateStr}
                          </span>
                          {isFirst && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-500/30 uppercase">
                              Inicio (Mín)
                            </span>
                          )}
                          {isLast && (
                            <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.2 rounded border border-indigo-500/30 uppercase">
                              Fin (Máx)
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {formattedName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-slate-800/70 px-2 py-0.5 rounded border border-slate-700/50">
                        <PhoneCall className="w-3 h-3 text-indigo-400" />
                        <span>{count.toLocaleString()} ll.</span>
                        {totalCalls > 0 && (
                          <span className="text-[10px] text-slate-400">({pct}%)</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredDates.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-500">
                  No se encontraron fechas que coincidan con la búsqueda
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0d0d10] flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {isAllSelected ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Todas las fechas seleccionadas ({effectiveAvailableDates.length})
              </span>
            ) : (
              <span className="text-indigo-400 font-semibold font-mono">
                {selectedDates.length} de {effectiveAvailableDates.length} fechas activas
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
          >
            Aplicar Fechas
          </button>
        </div>
      </div>
    </div>
  );
};
