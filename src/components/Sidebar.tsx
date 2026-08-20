import React from 'react';
import { 
  Activity, 
  BarChart3, 
  BellRing, 
  Users, 
  Upload, 
  RotateCcw, 
  FileSpreadsheet, 
  Headphones,
  ShieldAlert,
  PhoneCall
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenUpload: () => void;
  onResetDemo: () => void;
  totalRecordsCount: number;
  activeAgentsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  onOpenUpload,
  onResetDemo,
  totalRecordsCount,
  activeAgentsCount
}) => {
  return (
    <aside 
      id="sidebar-navigation"
      className="fixed left-0 top-0 h-full w-[280px] z-40 hidden lg:flex flex-col bg-[#111114] border-r border-slate-800 shadow-2xl transition-all duration-300"
    >
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3.5 border-b border-slate-800 h-20">
        <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Headphones className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-base text-white tracking-tight leading-tight">Call center Expresso</span>
          <span className="text-[11px] text-indigo-400 font-semibold uppercase tracking-wider">Netmobile Lead Supervisor</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col p-4 gap-1.5 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Monitoreo Operativo
        </div>

        <button
          id="nav-btn-realtime"
          onClick={() => setActiveView('realtime')}
          className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all ${
            activeView === 'realtime'
              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1a20]'
          }`}
        >
          <Activity className="w-4 h-4 text-indigo-400" />
          <span>Real-time Monitor</span>
        </button>

        <button
          id="nav-btn-performance"
          onClick={() => setActiveView('performance')}
          className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all ${
            activeView === 'performance'
              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1a20]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Performance Trends</span>
        </button>

        <button
          id="nav-btn-alerts"
          onClick={() => setActiveView('alerts')}
          className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all ${
            activeView === 'alerts'
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1a20]'
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>Alert History</span>
        </button>

        <div className="my-3 border-t border-slate-800"></div>

        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Gestión de Archivos CDR
        </div>

        {/* Upload CDR Button */}
        <button
          id="sidebar-btn-upload"
          onClick={onOpenUpload}
          className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-sm text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/20 shadow-md shadow-indigo-500/20 transition-all group font-medium"
        >
          <Upload className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
          <span>Subir Reporte CSV</span>
        </button>

        {/* Reset Demo CDR Button */}
        <button
          id="sidebar-btn-reset-demo"
          onClick={onResetDemo}
          className="flex items-center gap-3 w-full px-3.5 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-[#1a1a20] transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restaurar Datos Demo</span>
        </button>

        {/* Live Status Card in Sidebar */}
        <div className="mt-auto bg-[#0a0a0c] rounded-xl p-3.5 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Servidor CDR</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-indigo-400" /> Llamadas:
            </span>
            <span className="font-bold text-white">{totalRecordsCount.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Users className="w-3 h-3 text-emerald-400" /> Agentes:
            </span>
            <span className="font-bold text-white">{activeAgentsCount}</span>
          </div>
        </div>

        <button
          id="nav-btn-team-settings"
          onClick={() => setActiveView('settings')}
          className="flex items-center gap-3 w-full px-3.5 py-2 text-slate-500 hover:text-slate-300 hover:bg-[#1a1a20] rounded-lg transition-colors mt-2 text-xs"
        >
          <Users className="w-4 h-4" />
          <span>Team Settings</span>
        </button>
      </nav>
    </aside>
  );
};
