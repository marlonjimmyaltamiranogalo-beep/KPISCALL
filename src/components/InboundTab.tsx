import React from 'react';
import { 
  PhoneIncoming, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  BarChart2, 
  TrendingUp, 
  Timer,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { InboundExtensionStats } from '../types';
import { formatDuration } from '../utils/cdrEngine';

interface InboundTabProps {
  totalInboundCalls: number;
  totalDurationSeconds: number;
  avgDurationSeconds: number; // TMO
  shortCalls: number;
  shortCallsRate: number;
  extensionStats: InboundExtensionStats[];
  top5Extensions: InboundExtensionStats[];
  hourlyDistribution: { hour: number; label: string; calls: number; shortCalls: number }[];
  onSelectExtension: (ext: string) => void;
  shiftLabel: string;
}

export const InboundTab: React.FC<InboundTabProps> = ({
  totalInboundCalls,
  totalDurationSeconds,
  avgDurationSeconds,
  shortCalls,
  shortCallsRate,
  extensionStats,
  top5Extensions,
  hourlyDistribution,
  onSelectExtension,
  shiftLabel
}) => {
  const maxCalls = Math.max(...top5Extensions.map(e => e.totalReceived), 1);
  const maxHourlyCalls = Math.max(...hourlyDistribution.map(h => h.calls), 1);

  // SVG Line Chart points for Inbound Hourly Flow
  const chartWidth = 500;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 25;

  const points = hourlyDistribution.map((item, idx) => {
    const x = paddingX + (idx / Math.max(hourlyDistribution.length - 1, 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (item.calls / maxHourlyCalls) * (chartHeight - paddingY * 2);
    return { x, y, ...item };
  });

  const pathD = points.length > 0
    ? points.reduce((acc, curr, idx, arr) => {
        if (idx === 0) return `M ${curr.x} ${curr.y}`;
        const prev = arr[idx - 1];
        const cp1x = prev.x + (curr.x - prev.x) / 2;
        const cp1y = prev.y;
        const cp2x = prev.x + (curr.x - prev.x) / 2;
        const cp2y = curr.y;
        return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
      }, '')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : '';

  return (
    <div id="inbound-content" className="flex flex-col gap-6 animate-fadeIn">
      {/* Title & Active Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            Vigilancia Inbound (Gestión Entrante)
          </h2>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">ACTIVE</span>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono bg-[#131317] px-3 py-1.5 rounded-lg border border-slate-800 w-fit">
          Filtrado por <span className="text-emerald-400 font-semibold">calltype: Incoming</span> (Agente en 'To')
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* KPI 1: Total Llamadas Entrantes */}
        <div 
          id="kpi-inbound-total"
          className="bg-[#131317] rounded-xl p-4 lg:p-5 border border-slate-800 shadow-lg"
        >
          <div className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-wider">Llamadas Entrantes</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-white font-mono tracking-tight">
              {totalInboundCalls.toLocaleString()}
            </span>
            <PhoneIncoming className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Tráfico recibido en cola</span>
        </div>

        {/* KPI 2: TMO Entrante */}
        <div 
          id="kpi-inbound-tmo"
          className="bg-[#131317] rounded-xl p-4 lg:p-5 border border-slate-800 shadow-lg"
        >
          <div className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-wider">TMO Entrante (Avg Talk)</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-emerald-400 font-mono tracking-tight">
              {formatDuration(avgDurationSeconds)}
            </span>
            <Timer className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Tiempo medio de operación</span>
        </div>

        {/* KPI 3: Llamadas Cortas */}
        <div 
          id="kpi-inbound-cortas"
          className="bg-[#131317] rounded-xl p-4 lg:p-5 border border-slate-800 shadow-lg"
        >
          <div className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-wider">Llamadas Cortas (&lt;30s)</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-orange-400 font-mono tracking-tight">
              {shortCalls.toLocaleString()}
            </span>
            <AlertCircle className="w-4 h-4 text-orange-400" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Posibles desvíos rápidos</span>
        </div>

        {/* KPI 4: Tasa de Cortes / Abandono */}
        <div 
          id="kpi-inbound-calidad"
          className="bg-[#131317] rounded-xl p-4 lg:p-5 border border-slate-800 shadow-lg"
        >
          <div className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-wider">Tasa de Cortes (&lt;30s)</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-rose-400 font-mono tracking-tight">
              {shortCallsRate.toFixed(1)}%
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Indicador de calidad</span>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Curva Horaria de Llamadas Recibidas */}
        <section 
          id="chart-inbound-curva"
          className="lg:col-span-7 bg-[#131317] rounded-xl p-5 border border-slate-800 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Volumen Entrante por Hora
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                Curva de Tráfico
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              {shiftLabel}
            </p>
          </div>

          <div className="w-full h-52 flex flex-col justify-between py-2">
            <svg 
              className="w-full h-40 overflow-visible" 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="inboundTrafficGradientEmerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="rgba(255,255,255,0.08)" />

              {/* Gradient Area */}
              {areaD && (
                <path d={areaD} fill="url(#inboundTrafficGradientEmerald)" />
              )}

              {/* Trend Line */}
              {pathD && (
                <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              )}

              {/* Data points */}
              {points.map((p, i) => (
                <g key={i} className="group cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#0a0a0c"
                    stroke="#10b981"
                    strokeWidth="2"
                    className="hover:r-6 transition-all"
                  />
                  <text
                    x={p.x}
                    y={p.y - 8}
                    textAnchor="middle"
                    fill="#34d399"
                    fontSize="10"
                    fontWeight="bold"
                    className="opacity-0 group-hover:opacity-100 transition-opacity font-mono"
                  >
                    {p.calls}
                  </text>
                </g>
              ))}
            </svg>

            {/* X Axis Labels */}
            <div className="flex justify-between px-6 text-[10px] font-mono text-slate-500">
              {hourlyDistribution.map(h => (
                <span key={h.hour} className="text-center">{h.label}</span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800 pt-2.5 mt-2">
            <span>Hora pico de recepción: {maxHourlyCalls} llamadas</span>
            <span className="text-emerald-400 font-medium">Capacidad estable</span>
          </div>
        </section>

        {/* Chart 2: Top Extensiones Inbound */}
        <section 
          id="chart-inbound-top-ext"
          className="lg:col-span-5 bg-[#131317] rounded-xl p-5 border border-slate-800 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Top 5 Ext. Inbound
              </h3>
              <span className="text-[11px] font-mono text-emerald-400">Atendidas</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Extensiones con mayor cantidad de llamadas atendidas
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-between gap-3 pt-2">
            {top5Extensions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No hay llamadas entrantes registradas.
              </div>
            ) : (
              top5Extensions.map((item, idx) => {
                const pct = Math.round((item.totalReceived / maxCalls) * 100);
                return (
                  <div 
                    key={item.extension}
                    onClick={() => onSelectExtension(item.extension)}
                    className="flex items-center gap-3 cursor-pointer group hover:bg-[#1a1a20]/50 p-1.5 rounded-lg transition-colors"
                  >
                    <span className="text-[11px] w-8 text-slate-400 font-mono font-bold group-hover:text-emerald-400 transition-colors">
                      {item.extension}
                    </span>

                    <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${Math.max(pct, 10)}%` }}
                      >
                      </div>
                    </div>

                    <div className="w-14 text-right font-mono text-[11px] font-bold text-slate-300">
                      {item.totalReceived} <span className="text-[10px] text-slate-500 font-normal">atend.</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800 pt-3 mt-4">
            <span>Máximo atendido: {maxCalls}</span>
            <span className="text-indigo-400 font-medium">Distribución balanceada</span>
          </div>
        </section>
      </div>

      {/* Table: Calidad de Atención Inbound */}
      <section 
        id="table-calidad-inbound"
        className="bg-[#131317] rounded-xl border border-slate-800 shadow-lg overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-slate-800 bg-[#0d0d10] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Calidad de Atención Inbound por Extensión
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Registro de llamadas recibidas, tiempo total de habla, TMO y conteo de llamadas cortas
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#1a1a20] text-[10px] text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3">Extensión</th>
                <th className="px-6 py-3 text-right">Recibidas</th>
                <th className="px-6 py-3 text-right">Tiempo Total</th>
                <th className="px-6 py-3 text-right">TMO Promedio</th>
                <th className="px-6 py-3 text-right">Cortas (&lt;30s)</th>
                <th className="px-6 py-3 text-right">Ratio Cortas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-xs">
              {extensionStats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">
                    No hay registros de llamadas entrantes con los filtros actuales.
                  </td>
                </tr>
              ) : (
                extensionStats.map(row => (
                  <tr 
                    key={row.extension}
                    onClick={() => onSelectExtension(row.extension)}
                    className="hover:bg-[#1a1a20]/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-3 font-bold text-white group-hover:text-emerald-400 transition-colors">
                      Ext {row.extension}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-300 font-bold">
                      {row.totalReceived}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-400">
                      {formatDuration(row.totalDurationSeconds)}
                    </td>
                    <td className="px-6 py-3 text-right text-emerald-400 font-semibold">
                      {formatDuration(row.avgDurationSeconds)}
                    </td>
                    <td className="px-6 py-3 text-right text-orange-400">
                      {row.shortCalls}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold border ${
                        row.shortCallsRate <= 5
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : row.shortCallsRate <= 10
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {row.shortCallsRate <= 5 ? 'Excelente' : row.shortCallsRate <= 10 ? 'Aceptable' : 'Alerta'} ({row.shortCallsRate.toFixed(1)}%)
                      </span>
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
