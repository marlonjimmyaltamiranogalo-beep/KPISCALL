import React from 'react';
import { 
  PhoneOutgoing, 
  Clock, 
  CheckCircle, 
  Percent, 
  BarChart2, 
  TrendingUp, 
  PieChart, 
  Users,
  Timer
} from 'lucide-react';
import { OutboundExtensionStats } from '../types';
import { formatDuration } from '../utils/cdrEngine';

interface OutboundTabProps {
  totalOutboundCalls: number;
  totalDurationSeconds: number;
  avgHandlingTimeSeconds: number;
  effectiveContacts: number;
  effectiveRate: number;
  extensionStats: OutboundExtensionStats[];
  top5Extensions: OutboundExtensionStats[];
  durationDistribution: { range: string; count: number; percentage: number }[];
  hourlyDistribution: { hour: number; label: string; calls: number; effectiveCalls: number }[];
  onSelectExtension: (ext: string) => void;
  shiftLabel: string;
}

export const OutboundTab: React.FC<OutboundTabProps> = ({
  totalOutboundCalls,
  totalDurationSeconds,
  avgHandlingTimeSeconds,
  effectiveContacts,
  effectiveRate,
  extensionStats,
  top5Extensions,
  durationDistribution,
  hourlyDistribution,
  onSelectExtension,
  shiftLabel
}) => {
  const maxCalls = Math.max(...top5Extensions.map(e => e.totalCalls), 1);
  const maxHourlyCalls = Math.max(...hourlyDistribution.map(h => h.calls), 1);

  return (
    <div id="outbound-content" className="flex flex-col gap-6 animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            Vigilancia Outbound (Gestión Saliente)
          </h2>
          <div className="flex items-center gap-1.5 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">SALIENTES</span>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono bg-[#131317] px-3 py-1.5 rounded-lg border border-slate-800 w-fit">
          Filtrado por <span className="text-indigo-400 font-semibold">calltype: Outgoing</span> (Agente en 'From')
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* KPI 1: Total Salientes */}
        <div 
          id="kpi-outbound-total"
          className="bg-[#131317] rounded-xl p-4 lg:p-5 border border-slate-800 shadow-lg"
        >
          <div className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-wider">Llamadas Salientes</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-white font-mono tracking-tight">
              {totalOutboundCalls.toLocaleString()}
            </span>
            <PhoneOutgoing className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Llamadas emitidas por agentes</span>
        </div>

        {/* KPI 2: AHT Promedio */}
        <div 
          id="kpi-outbound-aht"
          className="bg-[#131317] rounded-xl p-4 lg:p-5 border border-slate-800 shadow-lg"
        >
          <div className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-wider">AHT Promedio</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-indigo-400 font-mono tracking-tight">
              {formatDuration(avgHandlingTimeSeconds)}
            </span>
            <Timer className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Duración media por llamada</span>
        </div>

        {/* KPI 3: Contactos Efectivos */}
        <div 
          id="kpi-outbound-efectivos"
          className="bg-[#131317] rounded-xl p-4 lg:p-5 border border-slate-800 shadow-lg"
        >
          <div className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-wider">Contactos Efectivos (&gt;1m)</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-emerald-400 font-mono tracking-tight">
              {effectiveContacts.toLocaleString()}
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Conversaciones &gt; 60s</span>
        </div>

        {/* KPI 4: % Contacto Efectivo */}
        <div 
          id="kpi-outbound-tasa-efectiva"
          className="bg-[#131317] rounded-xl p-4 lg:p-5 border border-slate-800 shadow-lg"
        >
          <div className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-wider">% Contacto Efectivo</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-white font-mono tracking-tight">
              {effectiveRate.toFixed(1)}%
            </span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Ratio de efectividad</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Top Extensiones por Volumen Saliente */}
        <section 
          id="chart-outbound-top-ext"
          className="lg:col-span-6 bg-[#131317] rounded-xl p-5 border border-slate-800 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Top Extensiones Salientes
              </h3>
              <span className="text-[11px] font-mono text-indigo-400">Llamadas emitidas</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Agentes con mayor volumen de marcación saliente
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-between gap-3 pt-2">
            {top5Extensions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No hay llamadas salientes registradas.
              </div>
            ) : (
              top5Extensions.map((item, idx) => {
                const pct = Math.round((item.totalCalls / maxCalls) * 100);
                return (
                  <div 
                    key={item.extension}
                    onClick={() => onSelectExtension(item.extension)}
                    className="flex items-center gap-3 cursor-pointer group hover:bg-[#1a1a20]/50 p-1.5 rounded-lg transition-colors"
                  >
                    <span className="text-[11px] w-8 text-slate-400 font-mono font-bold group-hover:text-indigo-400 transition-colors">
                      {item.extension}
                    </span>

                    <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                        style={{ width: `${Math.max(pct, 10)}%` }}
                      >
                      </div>
                    </div>

                    <div className="w-16 text-right font-mono text-[11px] font-bold text-slate-300">
                      {item.totalCalls} <span className="text-[10px] text-slate-500 font-normal">llams</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800 pt-3 mt-4">
            <span>Máximo: {maxCalls} llamadas</span>
            <span className="text-emerald-400 font-medium">Meta de marcación activa</span>
          </div>
        </section>

        {/* Chart 2: Distribución de Duración de Llamadas */}
        <section 
          id="chart-outbound-duracion"
          className="lg:col-span-6 bg-[#131317] rounded-xl p-5 border border-slate-800 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Distribución de Duración
              </h3>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-semibold">
                Segmentación AHT
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Distribución de llamadas según tiempo de conversación
            </p>
          </div>

          <div className="flex flex-col gap-2.5 my-auto">
            {durationDistribution.map((dist, i) => {
              const colors = ['bg-rose-500', 'bg-orange-400', 'bg-indigo-500', 'bg-emerald-500', 'bg-emerald-400'];
              return (
                <div key={dist.range} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 font-medium">{dist.range}</span>
                    <span className="text-white font-bold">
                      {dist.count} <span className="text-slate-500 font-normal">({dist.percentage}%)</span>
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${colors[i % colors.length]} transition-all duration-500`}
                      style={{ width: `${dist.percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800 pt-3 mt-4">
            <span>Tiempo hablado total: {formatDuration(totalDurationSeconds)}</span>
            <span className="text-indigo-400 font-medium">AHT Global: {formatDuration(avgHandlingTimeSeconds)}</span>
          </div>
        </section>
      </div>

      {/* Tabla de Productividad Outbound */}
      <section 
        id="table-productividad-outbound"
        className="bg-[#131317] rounded-xl border border-slate-800 shadow-lg overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-slate-800 bg-[#0d0d10] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tabla de Productividad Saliente por Extensión
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Rendimiento de llamadas emitidas, tiempo hablado y porcentaje de contacto efectivo
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#1a1a20] text-[10px] text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3">Extensión</th>
                <th className="px-6 py-3 text-right">Total Salientes</th>
                <th className="px-6 py-3 text-right">Tiempo Total Hablado</th>
                <th className="px-6 py-3 text-right">AHT Promedio</th>
                <th className="px-6 py-3 text-right">Contactos Efectivos (&gt;1m)</th>
                <th className="px-6 py-3 text-right">% Contacto Efectivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-xs">
              {extensionStats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">
                    No hay registros de llamadas salientes con los filtros actuales.
                  </td>
                </tr>
              ) : (
                extensionStats.map(stat => (
                  <tr 
                    key={stat.extension}
                    onClick={() => onSelectExtension(stat.extension)}
                    className="hover:bg-[#1a1a20]/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-3 font-bold text-white group-hover:text-indigo-400 transition-colors">
                      Ext {stat.extension}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-300 font-bold">
                      {stat.totalCalls}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-400">
                      {formatDuration(stat.totalDurationSeconds)}
                    </td>
                    <td className="px-6 py-3 text-right text-indigo-400 font-semibold">
                      {formatDuration(stat.avgDurationSeconds)}
                    </td>
                    <td className="px-6 py-3 text-right text-emerald-400 font-semibold">
                      {stat.effectiveCalls}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`font-bold ${stat.effectiveRate >= 70 ? 'text-emerald-400' : (stat.effectiveRate >= 50 ? 'text-indigo-400' : 'text-orange-400')}`}>
                          {stat.effectiveRate.toFixed(1)}%
                        </span>
                        <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                          <div 
                            className={`h-full rounded-full ${stat.effectiveRate >= 70 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                            style={{ width: `${stat.effectiveRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
