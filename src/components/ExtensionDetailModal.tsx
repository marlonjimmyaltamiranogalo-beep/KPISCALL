import React from 'react';
import { 
  X, 
  User, 
  PhoneCall, 
  Clock, 
  PhoneOutgoing, 
  PhoneIncoming, 
  AlertTriangle, 
  TrendingUp, 
  Timer,
  CheckCircle2
} from 'lucide-react';
import { CDRRecord, InactivityAlert } from '../types';
import { formatDuration, formatTime } from '../utils/cdrEngine';

interface ExtensionDetailModalProps {
  extension: string | null;
  onClose: () => void;
  records: CDRRecord[];
  alerts: InactivityAlert[];
}

export const ExtensionDetailModal: React.FC<ExtensionDetailModalProps> = ({
  extension,
  onClose,
  records,
  alerts
}) => {
  if (!extension) return null;

  // Filter records for this extension
  const extRecords = records.filter(r => 
    r.agentExtension === extension || r.from === extension || r.to === extension
  ).sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

  const extAlerts = alerts.filter(a => a.extension === extension);

  const outboundCalls = extRecords.filter(r => r.callType === 'Outgoing');
  const inboundCalls = extRecords.filter(r => r.callType === 'Incoming');

  const totalDuration = extRecords.reduce((acc, r) => acc + r.durationSeconds, 0);
  const avgDuration = extRecords.length > 0 ? Math.round(totalDuration / extRecords.length) : 0;
  
  const effectiveOutbound = outboundCalls.filter(r => r.durationSeconds > 60).length;
  const effectiveRate = outboundCalls.length > 0 ? ((effectiveOutbound / outboundCalls.length) * 100).toFixed(1) : '0';

  const shortInbound = inboundCalls.filter(r => r.durationSeconds < 30).length;

  return (
    <div 
      id="modal-extension-detail"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-[#131317] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#0d0d10] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg font-mono">
              {extension}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Detalle del Agente - Extensión {extension}
                </h3>
                <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Activo
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Registro de llamadas, pausas de inactividad y métricas de desempeño
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

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#0a0a0c] border-b border-slate-800 text-xs">
          <div className="bg-[#131317] p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[11px] block mb-1">Total Llamadas</span>
            <span className="text-xl font-bold font-mono text-white">{extRecords.length}</span>
          </div>

          <div className="bg-[#131317] p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[11px] block mb-1">Salientes / Entrantes</span>
            <span className="text-xl font-bold font-mono text-indigo-400">
              {outboundCalls.length} <span className="text-xs text-slate-500 font-normal">/ {inboundCalls.length}</span>
            </span>
          </div>

          <div className="bg-[#131317] p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[11px] block mb-1">Tiempo Hablado Total</span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              {formatDuration(totalDuration)}
            </span>
          </div>

          <div className="bg-[#131317] p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[11px] block mb-1">Alertas Inactividad</span>
            <span className="text-xl font-bold font-mono text-rose-400">
              {extAlerts.length}
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* Inactivity alerts for this extension if any */}
          {extAlerts.length > 0 && (
            <div className="bg-rose-500/10 rounded-xl p-4 border border-rose-500/20">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Pausas Críticas Registradas (&gt;5m)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {extAlerts.map(a => (
                  <div key={a.id} className="bg-[#131317] p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">{a.startTime} → {a.endTime}</span>
                    <span className="font-bold text-rose-400">{a.durationMinutes.toFixed(1)} min</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Call Timeline / Log */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-indigo-400" />
                <span>Historial Cronológico de Llamadas</span>
              </h4>
              <span className="text-xs text-slate-500 font-mono">{extRecords.length} registros</span>
            </div>

            <div className="bg-[#131317] rounded-xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="sticky top-0 bg-[#1a1a20] border-b border-slate-800 text-[10px] text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Hora Inicio</th>
                      <th className="px-4 py-2.5">Tipo</th>
                      <th className="px-4 py-2.5">Origen</th>
                      <th className="px-4 py-2.5">Destino</th>
                      <th className="px-4 py-2.5 text-right">Duración</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {extRecords.map(rec => (
                      <tr key={rec.id} className="hover:bg-[#1a1a20]/50 transition-colors">
                        <td className="px-4 py-2.5 text-slate-400">
                          {formatTime(rec.dateTime)}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] ${
                            rec.callType === 'Outgoing'
                              ? 'bg-indigo-500/10 text-indigo-400'
                              : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {rec.callType === 'Outgoing' ? <PhoneOutgoing className="w-3 h-3" /> : <PhoneIncoming className="w-3 h-3" />}
                            {rec.callType}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-white font-semibold">{rec.from}</td>
                        <td className="px-4 py-2.5 text-slate-400">{rec.to}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-white">
                          {formatDuration(rec.durationSeconds)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0d0d10] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-semibold bg-[#1a1a20] hover:bg-slate-800 text-slate-300 transition-colors"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
};
