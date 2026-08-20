import React from 'react';
import { 
  TrendingUp, 
  Clock, 
  PhoneCall, 
  AlertTriangle, 
  ArrowRight, 
  Flame, 
  ShieldAlert, 
  CheckCircle2, 
  Info,
  Calendar
} from 'lucide-react';
import { InactivityAlert, ExtensionInactivity } from '../types';

interface TiemposMuertosTabProps {
  avgDeadTimeMinutes: number;
  worstExtension: { extension: string; deadTimeMinutes: number };
  totalCallsProcessed: number;
  criticalAlertsCount: number;
  top5Extensions: ExtensionInactivity[];
  hourlyDistribution: { hour: number; label: string; deadTimeMinutes: number; callsCount: number }[];
  alerts: InactivityAlert[];
  onOpenAllAlerts: () => void;
  onSelectExtension: (ext: string) => void;
  shiftLabel: string;
}

export const TiemposMuertosTab: React.FC<TiemposMuertosTabProps> = ({
  avgDeadTimeMinutes,
  worstExtension,
  totalCallsProcessed,
  criticalAlertsCount,
  top5Extensions,
  hourlyDistribution,
  alerts,
  onOpenAllAlerts,
  onSelectExtension,
  shiftLabel
}) => {
  // Compute max value for bar chart scaling
  const maxDeadTime = Math.max(...top5Extensions.map(e => e.totalDeadTimeMinutes), 1);
  const maxHourlyDeadTime = Math.max(...hourlyDistribution.map(h => h.deadTimeMinutes), 1);

  // SVG Line Chart points
  const chartWidth = 500;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 25;

  const points = hourlyDistribution.map((item, idx) => {
    const x = paddingX + (idx / Math.max(hourlyDistribution.length - 1, 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (item.deadTimeMinutes / maxHourlyDeadTime) * (chartHeight - paddingY * 2);
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
    <div id="tiempos-muertos-content" className="flex flex-col gap-6 animate-fadeIn">
      {/* Title & Live Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            Vigilancia de Tiempos Muertos
          </h2>
          <div className="flex items-center gap-1.5 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">LIVE</span>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2 bg-[#131317] px-3 py-1.5 rounded-lg border border-slate-800 w-fit">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>Ignorando descansos mayores a 2 horas (almuerzos / cambios de turno)</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* KPI 1: Promedio Inactividad */}
        <div 
          id="kpi-promedio-inactividad"
          className="bg-[#131317] rounded-xl p-4 lg:p-5 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all"
        >
          <div className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-wider">Promedio Inactividad</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-white font-mono tracking-tight">
              {avgDeadTimeMinutes.toFixed(1)}<span className="text-sm font-normal text-slate-400">m</span>
            </span>
            <span className="text-xs text-emerald-400 font-normal ml-1">-2.4%</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Por agente entre llamadas</span>
        </div>

        {/* KPI 2: Peor Extensión */}
        <div 
          id="kpi-peor-extension"
          onClick={() => worstExtension.extension !== 'N/A' && onSelectExtension(worstExtension.extension)}
          className="bg-[#131317] rounded-xl p-4 lg:p-5 border border-slate-800 shadow-lg cursor-pointer hover:border-rose-500/40 transition-all"
        >
          <div className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-wider">Ext. Crítica</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-rose-400 font-mono tracking-tight">
              {worstExtension.extension}
            </span>
            <span className="text-xs text-slate-500 font-normal ml-1 font-mono">
              ({worstExtension.deadTimeMinutes.toFixed(0)}m)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Mayor tiempo muerto acumulado</span>
        </div>

        {/* KPI 3: Llamadas Totales */}
        <div 
          id="kpi-llamadas-totales"
          className="bg-[#131317] rounded-xl p-4 lg:p-5 border border-slate-800 shadow-lg"
        >
          <div className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-wider">Llamadas Procesadas</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-white font-mono tracking-tight">
              {totalCallsProcessed.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Procesadas en el filtro</span>
        </div>

        {/* KPI 4: Alertas Activas */}
        <div 
          id="kpi-alertas-criticas"
          onClick={onOpenAllAlerts}
          className="bg-[#131317] rounded-xl p-4 lg:p-5 border border-slate-800 shadow-lg cursor-pointer hover:border-orange-500/40 transition-all"
        >
          <div className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-wider">Alertas Activas (&gt;5m)</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-orange-400 font-mono tracking-tight">
              {criticalAlertsCount}
            </span>
            <AlertTriangle className="w-4 h-4 text-orange-400 ml-1" />
          </div>
          <span className="text-[11px] text-indigo-400 mt-1 flex items-center gap-1 font-medium hover:underline">
            Ver todas las alertas <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Top 5 Inactividad por Extensión */}
        <section 
          id="chart-top-extensiones"
          className="lg:col-span-5 bg-[#131317] rounded-xl p-5 border border-slate-800 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Top 5 Inactividad por Extensión
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">Minutos</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Extensiones con mayor tiempo muerto entre llamadas
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-between gap-3 pt-2">
            {top5Extensions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No hay suficientes registros para calcular inactividad.
              </div>
            ) : (
              top5Extensions.map((item, idx) => {
                const percentage = Math.min(100, Math.round((item.totalDeadTimeMinutes / maxDeadTime) * 100));
                
                // Color scaling matching Sleek Interface design
                let barColor = 'bg-slate-600';
                if (idx === 0) {
                  barColor = 'bg-rose-500';
                } else if (idx === 1) {
                  barColor = 'bg-rose-400';
                } else if (idx === 2) {
                  barColor = 'bg-orange-400';
                }

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
                        className={`h-full rounded-full ${barColor} transition-all duration-500`}
                        style={{ width: `${Math.max(percentage, 8)}%` }}
                      >
                      </div>
                    </div>

                    <div className="w-14 text-right font-mono text-[11px] font-bold text-slate-300">
                      {item.totalDeadTimeMinutes.toFixed(0)} <span className="text-[10px] text-slate-500 font-normal">m</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800 pt-3 mt-4">
            <span>Escala normalizada (0 - {maxDeadTime.toFixed(0)} min)</span>
            <button 
              onClick={onOpenAllAlerts}
              className="text-indigo-400 hover:underline font-medium"
            >
              Auditoría completa →
            </button>
          </div>
        </section>

        {/* Chart 2: Distribución de Inactividad por Hora */}
        <section 
          id="chart-tendencia-hora"
          className="lg:col-span-7 bg-[#131317] rounded-xl p-5 border border-slate-800 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Distribución de Inactividad por Hora
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span className="text-[10px] text-slate-400">T. Muerto</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] text-slate-400">Llamadas</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              {shiftLabel}
            </p>
          </div>

          {/* SVG Line / Area Visualizer */}
          <div className="w-full h-52 flex flex-col justify-between py-2">
            <svg 
              className="w-full h-40 overflow-visible" 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="deadTimeGradientIndigo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="rgba(255,255,255,0.08)" />

              {/* Gradient Area */}
              {areaD && (
                <path d={areaD} fill="url(#deadTimeGradientIndigo)" />
              )}

              {/* Trend Line */}
              {pathD && (
                <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              )}

              {/* Data points */}
              {points.map((p, i) => (
                <g key={i} className="group cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#0a0a0c"
                    stroke="#6366f1"
                    strokeWidth="2"
                    className="hover:r-6 transition-all"
                  />
                  <text
                    x={p.x}
                    y={p.y - 8}
                    textAnchor="middle"
                    fill="#818cf8"
                    fontSize="10"
                    fontWeight="bold"
                    className="opacity-0 group-hover:opacity-100 transition-opacity font-mono"
                  >
                    {p.deadTimeMinutes}m
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
            <span>Pico máximo: {maxHourlyDeadTime.toFixed(0)} min</span>
            <span className="text-emerald-400 font-medium">Monitoreo continuo</span>
          </div>
        </section>
      </div>

      {/* Table: Alertas de Pausas Críticas (> 5 min) */}
      <section 
        id="table-alertas-criticas"
        className="bg-[#131317] rounded-xl border border-slate-800 shadow-lg overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#0d0d10]">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Alertas de Pausas Críticas (&gt; 5 min)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Pausas no justificadas entre llamadas consecutivas
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 text-[10px] font-bold rounded uppercase tracking-wider border border-rose-500/20">
              Se requiere intervención
            </span>
            <button 
              id="btn-ver-todas-alertas"
              onClick={onOpenAllAlerts}
              className="text-indigo-400 hover:text-indigo-300 text-xs font-medium hover:underline flex items-center gap-1"
            >
              <span>Ver todas ({alerts.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#1a1a20] text-[10px] text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3">Extensión</th>
                <th className="px-6 py-3">Hora Inicio</th>
                <th className="px-6 py-3">Hora Fin</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Duración</th>
                <th className="px-6 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                    No se detectaron pausas críticas superiores a 5 minutos en el período seleccionado.
                  </td>
                </tr>
              ) : (
                alerts.slice(0, 6).map((alert, index) => {
                  let badgeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                  let label = 'No justificada';

                  if (alert.severity === 'warning') {
                    badgeBg = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
                    label = 'Exceso Descanso';
                  } else if (alert.severity === 'normal') {
                    badgeBg = 'bg-slate-700/50 text-slate-400 border-slate-700';
                    label = 'Fin Turno / Pausa';
                  }

                  return (
                    <tr 
                      key={alert.id}
                      className="hover:bg-[#1a1a20]/50 transition-colors"
                    >
                      <td className="px-6 py-3 text-sm text-white font-medium">
                        Ext {alert.extension}
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-400 font-mono">{alert.startTime}</td>
                      <td className="px-6 py-3 text-xs text-slate-400 font-mono">{alert.endTime}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium border ${badgeBg}`}>
                          {label}
                        </span>
                      </td>
                      <td className={`px-6 py-3 text-sm font-mono font-bold ${
                        alert.severity === 'critical' ? 'text-rose-400' : alert.severity === 'warning' ? 'text-orange-400' : 'text-slate-300'
                      }`}>
                        {alert.durationMinutes.toFixed(0)}m {alert.durationSeconds % 60}s
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => onSelectExtension(alert.extension)}
                          className="text-indigo-400 text-xs hover:underline font-medium"
                        >
                          Detalles
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
