import React from 'react';
import { 
  Activity, 
  Layers, 
  UserCheck, 
  Upload, 
  RotateCcw, 
  X, 
  Headphones,
  Ban,
  CalendarDays,
  Utensils
} from 'lucide-react';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'tiempos-muertos' | 'outbound' | 'inbound';
  setActiveTab: (tab: 'tiempos-muertos' | 'outbound' | 'inbound') => void;
  onOpenUpload: () => void;
  onResetDemo: () => void;
  totalCalls: number;
  excludedCount?: number;
  onOpenExclusionModal?: () => void;
  onOpenDateModal?: () => void;
  onOpenHourlyLunchModal?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onOpenUpload,
  onResetDemo,
  totalCalls,
  excludedCount = 0,
  onOpenExclusionModal,
  onOpenDateModal,
  onOpenHourlyLunchModal
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="relative w-[280px] bg-[#111114] border-r border-slate-800 h-full flex flex-col shadow-2xl z-10 p-4">
        {/* Brand */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Call center Expresso</h3>
              <p className="text-[10px] text-indigo-400 font-medium">Netmobile Operations</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 py-4 flex flex-col gap-1.5 overflow-y-auto">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1">
            Módulos de Auditoría
          </span>

          <button
            onClick={() => { setActiveTab('tiempos-muertos'); onClose(); }}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'tiempos-muertos'
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-4 h-4 text-rose-400" />
            <span>Tiempos Muertos</span>
          </button>

          <button
            onClick={() => { setActiveTab('outbound'); onClose(); }}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'outbound'
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>KPIs Outbound</span>
          </button>

          <button
            onClick={() => { setActiveTab('inbound'); onClose(); }}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'inbound'
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>KPIs Inbound</span>
          </button>

          <div className="my-3 border-t border-slate-800"></div>

          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1">
            Filtros Avanzados
          </span>

          {onOpenDateModal && (
            <button
              onClick={() => { onOpenDateModal(); onClose(); }}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <CalendarDays className="w-4 h-4 text-indigo-400" />
              <span>Selección Múltiple de Fechas</span>
            </button>
          )}

          {onOpenHourlyLunchModal && (
            <button
              onClick={() => { onOpenHourlyLunchModal(); onClose(); }}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <Utensils className="w-4 h-4 text-amber-400" />
              <span>Horarios y Excluir Almuerzos</span>
            </button>
          )}

          {onOpenExclusionModal && (
            <button
              onClick={() => { onOpenExclusionModal(); onClose(); }}
              className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs transition-all ${
                excludedCount > 0 
                  ? 'bg-rose-950/30 text-rose-300 border border-rose-800/40' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Ban className={`w-4 h-4 ${excludedCount > 0 ? 'text-rose-400' : 'text-slate-400'}`} />
                <span>Excluir Extensiones</span>
              </div>
              {excludedCount > 0 && (
                <span className="bg-rose-600 text-white font-mono text-[10px] px-1.5 py-0.5 rounded-full">
                  {excludedCount}
                </span>
              )}
            </button>
          )}

          <div className="my-2 border-t border-slate-800"></div>

          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1">
            Operaciones CDR
          </span>

          <button
            onClick={() => { onOpenUpload(); onClose(); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Cargar Archivo CSV / Excel</span>
          </button>

          <button
            onClick={() => { onResetDemo(); onClose(); }}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restaurar Datos Demo</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
          <span>Total Llamadas</span>
          <span className="font-bold text-slate-300">{totalCalls.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
