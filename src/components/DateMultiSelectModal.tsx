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
  CalendarDays
} from 'lucide-react';
import { CDRRecord } from '../types';

interface DateMultiSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableDates: string[];
  selectedDates: string[];
  onToggleDate: (date: string) => void;
  onSetSelectedDates: (dates: string[]) => void;
  onSelectAllDates: () => void;
  cdrRecords: CDRRecord[];
}

export const DateMultiSelectModal: React.FC<DateMultiSelectModalProps> = ({
  isOpen,
  onClose,
  availableDates,
  selectedDates,
  onToggleDate,
  onSetSelectedDates,
  onSelectAllDates,
  cdrRecords
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Call volume per date
  const dateCounts = useMemo(() => {
    const map = new Map<string, number>();
    cdrRecords.forEach(r => {
      const y = r.dateTime.getFullYear();
      const m = String(r.dateTime.getMonth() + 1).padStart(2, '0');
      const d = String(r.dateTime.getDate()).padStart(2, '0');
      const dateKey = `${y}-${m}-${d}`;
      map.set(dateKey, (map.get(dateKey) || 0) + 1);
    });
    return map;
  }, [cdrRecords]);

  // Filtered by search
  const filteredDates = useMemo(() => {
    return availableDates.filter(d => 
      d.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  }, [availableDates, searchTerm]);

  // Is all selected? (Empty or includes 'all' or length === availableDates.length)
  const isAllSelected = selectedDates.length === 0 || selectedDates.includes('all') || (selectedDates.length === availableDates.length && availableDates.length > 0);

  const isDateChecked = (date: string) => {
    if (isAllSelected) return true;
    return selectedDates.includes(date);
  };

  const handleSelectLatest = () => {
    if (availableDates.length > 0) {
      const latest = availableDates[availableDates.length - 1];
      onSetSelectedDates([latest]);
    }
  };

  const handleSelectLast3 = () => {
    if (availableDates.length > 0) {
      const last3 = availableDates.slice(-3);
      onSetSelectedDates(last3);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      id="modal-date-multiselect"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-[#131317] border border-slate-800 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#0d0d10] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Filtro de Selección Múltiple de Fechas</span>
                {!isAllSelected && (
                  <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full font-mono border border-indigo-500/30">
                    {selectedDates.length} {selectedDates.length === 1 ? 'día' : 'días'}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Selecciona uno, varios o todos los días del reporte CDR para consolidar métricas.
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
          {/* Quick Filter Presets */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={onSelectAllDates}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                isAllSelected 
                  ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300 font-bold' 
                  : 'bg-[#1a1a20] border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Todos los Días ({availableDates.length})
            </button>
            <button
              type="button"
              onClick={handleSelectLatest}
              className="px-3 py-1.5 rounded-lg bg-[#1a1a20] hover:bg-slate-800 text-slate-300 border border-slate-700 font-medium transition-colors"
            >
              Último Día
            </button>
            {availableDates.length > 2 && (
              <button
                type="button"
                onClick={handleSelectLast3}
                className="px-3 py-1.5 rounded-lg bg-[#1a1a20] hover:bg-slate-800 text-slate-300 border border-slate-700 font-medium transition-colors"
              >
                Últimos 3 Días
              </button>
            )}
          </div>

          {/* Search if more than 5 dates */}
          {availableDates.length > 5 && (
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar fecha (ej: 2026-08-18)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1a1a20] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Date Checklist List */}
          <div className="border border-slate-800 rounded-xl bg-[#0d0d10] p-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2 px-1">
              <span>Fechas Disponibles ({filteredDates.length})</span>
              <span className="text-[11px] text-slate-500">Haz clic para marcar / desmarcar</span>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {filteredDates.map(dateStr => {
                const checked = isDateChecked(dateStr);
                const count = dateCounts.get(dateStr) || 0;

                // Format display nicely (e.g. "Martes, 18 de Agosto de 2026")
                const [y, m, d] = dateStr.split('-').map(Number);
                const dObj = new Date(y, m - 1, d);
                const formattedName = isNaN(dObj.getTime()) 
                  ? dateStr 
                  : dObj.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

                return (
                  <div
                    key={dateStr}
                    onClick={() => {
                      if (isAllSelected) {
                        // Switch from all to just this one, or all except this one
                        onSetSelectedDates([dateStr]);
                      } else {
                        onToggleDate(dateStr);
                      }
                    }}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all select-none ${
                      checked 
                        ? 'bg-indigo-950/20 border-indigo-800/40 text-indigo-200' 
                        : 'bg-[#16161a] border-slate-800/80 text-slate-400 hover:border-slate-700 hover:bg-[#1a1a20]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                        checked 
                          ? 'bg-indigo-600 border-indigo-500 text-white font-bold' 
                          : 'border-slate-600 bg-transparent text-transparent'
                      }`}>
                        {checked ? '✓' : ''}
                      </div>

                      <div className="flex flex-col">
                        <span className={`text-xs font-mono font-bold ${checked ? 'text-white' : 'text-slate-300'}`}>
                          {dateStr}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {formattedName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                      <PhoneCall className="w-3 h-3 text-indigo-400" />
                      <span>{count.toLocaleString()} llamadas</span>
                    </div>
                  </div>
                );
              })}

              {filteredDates.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-500">
                  No se encontraron fechas
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0d0d10] flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {isAllSelected ? (
              <span className="text-emerald-400 font-semibold">Todas las fechas seleccionadas</span>
            ) : (
              <span className="text-indigo-400 font-semibold font-mono">
                {selectedDates.length} de {availableDates.length} fechas activas
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
          >
            Aplicar Fechas
          </button>
        </div>
      </div>
    </div>
  );
};
