import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  CheckSquare, 
  Square, 
  RotateCcw, 
  ShieldAlert, 
  Filter, 
  Users, 
  PhoneOff,
  Check,
  Ban
} from 'lucide-react';
import { CDRRecord } from '../types';

interface ExtensionExclusionModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableExtensions: string[];
  excludedExtensions: string[];
  onToggleExclude: (ext: string) => void;
  onSetExcluded: (exts: string[]) => void;
  onClearExcluded: () => void;
  cdrRecords: CDRRecord[];
}

export const ExtensionExclusionModal: React.FC<ExtensionExclusionModalProps> = ({
  isOpen,
  onClose,
  availableExtensions,
  excludedExtensions,
  onToggleExclude,
  onSetExcluded,
  onClearExcluded,
  cdrRecords
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate call volume per extension
  const extensionCounts = useMemo(() => {
    const map = new Map<string, { total: number; outgoing: number; incoming: number }>();
    cdrRecords.forEach(r => {
      const ext = r.agentExtension || r.from || r.to;
      if (!ext) return;
      const curr = map.get(ext) || { total: 0, outgoing: 0, incoming: 0 };
      curr.total++;
      if (r.callType === 'Outgoing') curr.outgoing++;
      if (r.callType === 'Incoming') curr.incoming++;
      map.set(ext, curr);
    });
    return map;
  }, [cdrRecords]);

  // Filtered list based on search
  const filteredExtensions = useMemo(() => {
    return availableExtensions.filter(ext => 
      ext.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  }, [availableExtensions, searchTerm]);

  // Quick exclusion presets
  const handleExcludeHighPrefix = () => {
    // E.g. exclude extensions >= 5500 (supervisory/test extensions)
    const toExclude = availableExtensions.filter(e => {
      const num = parseInt(e, 10);
      return !isNaN(num) && num >= 5500;
    });
    onSetExcluded(Array.from(new Set([...excludedExtensions, ...toExclude])));
  };

  const handleExcludeLowVolume = () => {
    // Exclude extensions with less than 5 calls (possible test/inactive)
    const toExclude = availableExtensions.filter(e => {
      const stats = extensionCounts.get(e);
      return !stats || stats.total <= 3;
    });
    onSetExcluded(Array.from(new Set([...excludedExtensions, ...toExclude])));
  };

  const handleToggleAllVisible = () => {
    const allFilteredAreExcluded = filteredExtensions.every(e => excludedExtensions.includes(e));
    if (allFilteredAreExcluded) {
      // Unexclude all visible
      onSetExcluded(excludedExtensions.filter(e => !filteredExtensions.includes(e)));
    } else {
      // Exclude all visible
      onSetExcluded(Array.from(new Set([...excludedExtensions, ...filteredExtensions])));
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      id="modal-exclude-extensions"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-[#131317] border border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#0d0d10] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Filtro de Exclusión de Extensiones</span>
                {excludedExtensions.length > 0 && (
                  <span className="bg-rose-500/20 text-rose-400 text-xs px-2 py-0.5 rounded-full font-mono border border-rose-500/30">
                    {excludedExtensions.length} excluidas
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Selecciona las extensiones que deseas omitir de los cálculos y gráficos de la campaña.
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

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Search Bar & Quick Toggles */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar extensión..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1a1a20] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={handleToggleAllVisible}
              className="px-3 py-2 rounded-lg bg-[#1a1a20] hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>{filteredExtensions.every(e => excludedExtensions.includes(e)) ? 'Incluir Visibles' : 'Excluir Visibles'}</span>
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="text-slate-500 font-semibold">Filtros rápidos:</span>
            <button
              type="button"
              onClick={handleExcludeHighPrefix}
              className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-colors"
            >
              Excluir Supervisores (≥5500)
            </button>
            <button
              type="button"
              onClick={handleExcludeLowVolume}
              className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-colors"
            >
              Excluir Bajo Volumen (≤3 llamadas)
            </button>
            {excludedExtensions.length > 0 && (
              <button
                type="button"
                onClick={onClearExcluded}
                className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors ml-auto flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer Todo</span>
              </button>
            )}
          </div>

          {/* Active Excluded Chips */}
          {excludedExtensions.length > 0 && (
            <div className="bg-rose-950/20 border border-rose-800/30 rounded-xl p-3">
              <span className="text-[11px] font-bold text-rose-400 block mb-2">
                Extensiones Excluidas ({excludedExtensions.length}):
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {excludedExtensions.map(ext => (
                  <span
                    key={ext}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-rose-900/40 text-rose-200 border border-rose-700/50 text-[11px] font-mono font-medium"
                  >
                    <span>Ext. {ext}</span>
                    <button
                      type="button"
                      onClick={() => onToggleExclude(ext)}
                      className="hover:text-white text-rose-400 p-0.5 rounded transition-colors"
                      title="Quitar exclusión"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Extensions Checklist Grid */}
          <div className="border border-slate-800 rounded-xl bg-[#0d0d10] p-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2 px-1">
              <span>Listado de Extensiones ({filteredExtensions.length})</span>
              <span className="text-[11px] text-slate-500">Haz clic para excluir / incluir</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {filteredExtensions.map(ext => {
                const isExcluded = excludedExtensions.includes(ext);
                const stats = extensionCounts.get(ext) || { total: 0, outgoing: 0, incoming: 0 };

                return (
                  <div
                    key={ext}
                    onClick={() => onToggleExclude(ext)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all select-none ${
                      isExcluded 
                        ? 'bg-rose-950/20 border-rose-800/40 text-rose-300' 
                        : 'bg-[#16161a] border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-[#1a1a20]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                        isExcluded 
                          ? 'bg-rose-600 border-rose-500 text-white font-bold' 
                          : 'border-slate-600 bg-transparent text-transparent'
                      }`}>
                        {isExcluded ? '✕' : ''}
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-mono text-xs font-bold ${isExcluded ? 'text-rose-400 line-through' : 'text-white'}`}>
                          Ext. {ext}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {stats.total} llamadas ({stats.outgoing} salientes, {stats.incoming} entrantes)
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                      isExcluded ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isExcluded ? 'Excluida' : 'Activa'}
                    </span>
                  </div>
                );
              })}

              {filteredExtensions.length === 0 && (
                <div className="col-span-2 py-8 text-center text-xs text-slate-500">
                  No se encontraron extensiones que coincidan con &quot;{searchTerm}&quot;
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0d0d10] flex items-center justify-between">
          <div className="text-xs text-slate-400 font-medium">
            {excludedExtensions.length === 0 ? (
              <span className="text-slate-500">Todas las extensiones están activas</span>
            ) : (
              <span className="text-rose-400 font-semibold">
                {excludedExtensions.length} de {availableExtensions.length} extensiones excluidas
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
          >
            Aplicar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
