import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  Search, 
  Download, 
  Filter, 
  Clock, 
  ArrowUpDown,
  PhoneCall
} from 'lucide-react';
import { InactivityAlert } from '../types';

interface AllAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: InactivityAlert[];
  onSelectExtension: (ext: string) => void;
}

export const AllAlertsModal: React.FC<AllAlertsModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onSelectExtension
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'normal'>('all');
  const [sortBy, setSortBy] = useState<'duration' | 'extension' | 'time'>('duration');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  if (!isOpen) return null;

  const filteredAlerts = alerts
    .filter(a => {
      const matchExt = a.extension.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSev = severityFilter === 'all' || a.severity === severityFilter;
      return matchExt && matchSev;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'duration') {
        comparison = a.durationSeconds - b.durationSeconds;
      } else if (sortBy === 'extension') {
        comparison = a.extension.localeCompare(b.extension);
      } else if (sortBy === 'time') {
        comparison = a.startTime.localeCompare(b.startTime);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const handleExportAlertsCsv = () => {
    const headers = 'extension,inicio_inactividad,fin_inactividad,duracion_minutos,duracion_segundos,severidad\n';
    const rows = filteredAlerts.map(a => 
      `${a.extension},${a.startTime},${a.endTime},${a.durationMinutes},${a.durationSeconds},${a.severity}`
    );
    const blob = new Blob([headers + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `alertas_inactividad_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      id="modal-all-alerts"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-[#131317] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-[#0d0d10] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Auditoría Completa de Alertas de Inactividad (&gt;5 min)
              </h3>
              <p className="text-xs text-slate-400">
                Registro cronológico de pausas y tiempos muertos entre llamadas por agente
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAlertsCsv}
              className="flex items-center gap-1.5 bg-[#1a1a20] hover:bg-slate-800 text-indigo-400 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>

            <button 
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 bg-[#0a0a0c] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-[#131317] border border-slate-800 rounded-lg px-3 py-1.5">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por extensión (ej. 3810)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-white placeholder-slate-500 focus:outline-none w-full text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-mono text-[11px]">Severidad:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="bg-[#131317] border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer text-xs"
            >
              <option value="all">Todas ({alerts.length})</option>
              <option value="critical">Críticas &gt;15m</option>
              <option value="warning">Altas 10-15m</option>
              <option value="normal">Moderadas 5-10m</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-mono text-[11px]">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#131317] border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer text-xs"
            >
              <option value="duration">Duración Inactiva</option>
              <option value="extension">Extensión</option>
              <option value="time">Hora de Inicio</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="p-1.5 bg-[#131317] border border-slate-800 rounded-lg text-indigo-400 hover:bg-slate-800"
              title="Cambiar orden ascendente/descendente"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Modal Alerts Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 z-10 bg-[#1a1a20] border-b border-slate-800 text-[10px] uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-5 py-3">Extensión</th>
                <th className="px-5 py-3">Inicio Pausa (Fin Ant.)</th>
                <th className="px-5 py-3">Fin Pausa (Inicio Sig.)</th>
                <th className="px-5 py-3">Severidad</th>
                <th className="px-5 py-3 text-right">Tiempo Muerto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-xs">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-sans">
                    No se encontraron alertas con los criterios de búsqueda especificados.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map(alert => {
                  let badgeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                  let label = 'Crítica (>15m)';

                  if (alert.severity === 'warning') {
                    badgeBg = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
                    label = 'Alta (10-15m)';
                  } else if (alert.severity === 'normal') {
                    badgeBg = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
                    label = 'Moderada (5-10m)';
                  }

                  return (
                    <tr 
                      key={alert.id}
                      onClick={() => {
                        onSelectExtension(alert.extension);
                        onClose();
                      }}
                      className="hover:bg-[#1a1a20]/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-3 font-bold text-white group-hover:text-indigo-400 transition-colors">
                        Ext {alert.extension}
                      </td>
                      <td className="px-5 py-3 text-slate-400">{alert.startTime}</td>
                      <td className="px-5 py-3 text-slate-400">{alert.endTime}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold border ${badgeBg}`}>
                          {label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-rose-400">
                        {alert.durationMinutes.toFixed(1)} min ({alert.durationSeconds}s)
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0d0d10] flex items-center justify-between text-xs text-slate-500">
          <span>Mostrando {filteredAlerts.length} de {alerts.length} alertas</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg font-semibold bg-[#1a1a20] hover:bg-slate-800 text-slate-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
