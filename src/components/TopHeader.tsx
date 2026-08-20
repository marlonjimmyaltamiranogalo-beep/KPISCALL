import React from 'react';
import { 
  Upload, 
  RotateCcw, 
  Download, 
  RefreshCw, 
  Menu, 
  X, 
  Clock, 
  CalendarDays,
  Utensils,
  ChevronDown,
  Ban
} from 'lucide-react';
import { ShiftFilter } from '../types';

interface TopHeaderProps {
  activeTab: 'tiempos-muertos' | 'outbound' | 'inbound';
  setActiveTab: (tab: 'tiempos-muertos' | 'outbound' | 'inbound') => void;
  shift: ShiftFilter;
  setShift: (shift: ShiftFilter) => void;
  selectedExtension: string;
  setSelectedExtension: (ext: string) => void;
  availableExtensions: string[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedDates: string[];
  onOpenDateModal: () => void;
  availableDates: string[];
  selectedHours: number[];
  excludedHours: number[];
  onOpenHourlyLunchModal: () => void;
  excludedExtensions: string[];
  onOpenExclusionModal: () => void;
  onClearExcluded: () => void;
  onRemoveExcluded: (ext: string) => void;
  onOpenUpload: () => void;
  onDownloadTemplate: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenMobileNav: () => void;
  filteredCallsCount: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  setActiveTab,
  shift,
  setShift,
  selectedExtension,
  setSelectedExtension,
  availableExtensions,
  selectedDate,
  setSelectedDate,
  selectedDates,
  onOpenDateModal,
  availableDates,
  selectedHours,
  excludedHours,
  onOpenHourlyLunchModal,
  excludedExtensions,
  onOpenExclusionModal,
  onClearExcluded,
  onRemoveExcluded,
  onOpenUpload,
  onDownloadTemplate,
  onRefresh,
  isRefreshing,
  onOpenMobileNav,
  filteredCallsCount
}) => {
  const isMultiDateActive = selectedDates.length > 0 && !selectedDates.includes('all') && selectedDates.length < availableDates.length;
  const isLunchExcluded = excludedHours.length > 0;
  const isCustomHoursActive = selectedHours.length > 0 && selectedHours.length < 24;

  const handleResetAllFilters = () => {
    setShift('all');
    setSelectedExtension('all');
    setSelectedDate('all');
    onClearExcluded();
  };

  return (
    <header 
      id="top-app-bar"
      className="fixed top-0 w-full lg:w-[calc(100%-280px)] lg:ml-[280px] z-30 border-b border-slate-800 bg-[#0d0d10]/95 backdrop-blur-md shadow-2xl"
    >
      <div className="flex flex-col w-full max-w-[1440px] mx-auto">
        {/* Main Bar */}
        <div className="flex items-center justify-between px-4 lg:px-8 h-20">
          <div className="flex items-center gap-3">
            <button 
              id="btn-mobile-menu"
              onClick={onOpenMobileNav}
              className="lg:hidden p-2 rounded-lg text-indigo-400 hover:bg-[#1a1a20] transition-colors"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg lg:text-xl font-bold tracking-tight text-white">
                  Call center Expresso <span className="text-indigo-400 font-semibold text-sm lg:text-base">- Netmobile</span>
                </h1>
                <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-[10px] font-semibold uppercase tracking-wider">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>En Línea</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold hidden sm:block">
                Control de Tiempos Muertos & KPIs
              </p>
            </div>
          </div>

          {/* Module Tabs (Desktop Header View) & Action Tools */}
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Segmented Module Switcher */}
            <div className="hidden md:flex bg-[#16161a] border border-slate-700 rounded-lg p-1">
              <button
                id="tab-tiempos-muertos"
                onClick={() => setActiveTab('tiempos-muertos')}
                className={`px-3.5 py-1.5 rounded-md text-xs lg:text-sm font-medium transition-all ${
                  activeTab === 'tiempos-muertos'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tiempos Muertos
              </button>

              <button
                id="tab-outbound"
                onClick={() => setActiveTab('outbound')}
                className={`px-3.5 py-1.5 rounded-md text-xs lg:text-sm font-medium transition-all ${
                  activeTab === 'outbound'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Outbound
              </button>

              <button
                id="tab-inbound"
                onClick={() => setActiveTab('inbound')}
                className={`px-3.5 py-1.5 rounded-md text-xs lg:text-sm font-medium transition-all ${
                  activeTab === 'inbound'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Inbound
              </button>
            </div>

            <div className="hidden lg:block h-8 w-px bg-slate-800"></div>

            <button
              id="btn-upload-top"
              onClick={onOpenUpload}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors border border-indigo-400/20 shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Subir Reporte CSV</span>
              <span className="sm:hidden">Subir</span>
            </button>

            <button
              id="btn-download-template"
              onClick={onDownloadTemplate}
              title="Descargar Plantilla CSV de prueba"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a1a20] transition-colors border border-slate-800"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              id="btn-refresh-data"
              onClick={onRefresh}
              title="Recalcular métricas"
              className={`p-2 rounded-lg text-indigo-400 hover:bg-[#1a1a20] transition-colors border border-slate-800 ${
                isRefreshing ? 'animate-spin text-emerald-400' : ''
              }`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Module Navigation Tab Row */}
        <div className="flex md:hidden items-center justify-around px-4 border-t border-slate-800 bg-[#0d0d10] py-2 text-xs">
          <button
            onClick={() => setActiveTab('tiempos-muertos')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'tiempos-muertos'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tiempos Muertos
          </button>
          <button
            onClick={() => setActiveTab('outbound')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'outbound'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Outbound
          </button>
          <button
            onClick={() => setActiveTab('inbound')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'inbound'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Inbound
          </button>
        </div>

        {/* Global Filters Sub-Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 lg:px-8 py-2.5 bg-[#0a0a0c] border-t border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            {/* Shift Filter Toggle (Mañana / Tarde / Todo) */}
            <div className="flex items-center bg-[#16161a] rounded-lg p-1 border border-slate-700">
              <button
                id="btn-shift-all"
                onClick={() => setShift('all')}
                className={`px-2.5 py-1 rounded-md font-medium text-xs transition-colors ${
                  shift === 'all'
                    ? 'bg-slate-800 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todo el día
              </button>

              <button
                id="btn-shift-morning"
                onClick={() => setShift('morning')}
                className={`px-2.5 py-1 rounded-md font-medium text-xs transition-colors ${
                  shift === 'morning'
                    ? 'bg-slate-800 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Mañana (08-14h)
              </button>

              <button
                id="btn-shift-afternoon"
                onClick={() => setShift('afternoon')}
                className={`px-2.5 py-1 rounded-md font-medium text-xs transition-colors ${
                  shift === 'afternoon'
                    ? 'bg-slate-800 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tarde (14-20h)
              </button>
            </div>

            {/* Multi-Date Filter Trigger Button */}
            <button
              id="btn-open-date-multiselect"
              type="button"
              onClick={onOpenDateModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                isMultiDateActive
                  ? 'bg-indigo-950/40 text-indigo-300 border-indigo-500/60 shadow-sm'
                  : 'bg-[#131317] text-slate-300 border-slate-700 hover:text-white hover:bg-[#1a1a20]'
              }`}
              title="Filtrar por una o múltiples fechas del reporte"
            >
              <CalendarDays className={`w-3.5 h-3.5 ${isMultiDateActive ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>
                {isMultiDateActive 
                  ? `Fechas (${selectedDates.length} sel.)`
                  : availableDates.length === 1 
                  ? availableDates[0]
                  : 'Filtrar Fechas (Múltiple)'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {/* Hourly Schedule & Lunch Exclusion Filter Button */}
            <button
              id="btn-open-lunch-schedule-modal"
              type="button"
              onClick={onOpenHourlyLunchModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                isLunchExcluded
                  ? 'bg-amber-950/40 text-amber-300 border-amber-500/60 shadow-sm'
                  : isCustomHoursActive
                  ? 'bg-indigo-950/40 text-indigo-300 border-indigo-500/60 shadow-sm'
                  : 'bg-[#131317] text-slate-300 border-slate-700 hover:text-white hover:bg-[#1a1a20]'
              }`}
              title="Excluir horarios de almuerzo o franjas horarias específicas"
            >
              {isLunchExcluded ? (
                <Utensils className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>
                {isLunchExcluded
                  ? `Almuerzo Excluido (${excludedHours.map(h => `${h}h`).join(',')})`
                  : isCustomHoursActive
                  ? `Horarios (${selectedHours.length} hrs)`
                  : 'Horarios / Excluir Almuerzos'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {/* Extension Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#131317] border border-slate-700 rounded-lg px-2.5 py-1.5">
              <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">AGENTE:</span>
              <select
                id="select-extension-filter"
                value={selectedExtension}
                onChange={(e) => setSelectedExtension(e.target.value)}
                className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer pr-2"
              >
                <option value="all" className="bg-[#131317] text-slate-200">Todas las Extensiones</option>
                {availableExtensions.map(ext => (
                  <option key={ext} value={ext} className="bg-[#131317] text-slate-200">
                    Ext. {ext}
                  </option>
                ))}
              </select>
            </div>

            {/* Excluded Extensions Filter Button */}
            <button
              id="btn-open-exclusion-modal"
              type="button"
              onClick={onOpenExclusionModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                excludedExtensions.length > 0
                  ? 'bg-rose-950/40 text-rose-300 border-rose-700/60 hover:bg-rose-900/50 shadow-sm'
                  : 'bg-[#131317] text-slate-300 border-slate-700 hover:text-white hover:bg-[#1a1a20]'
              }`}
            >
              <Ban className={`w-3.5 h-3.5 ${excludedExtensions.length > 0 ? 'text-rose-400' : 'text-slate-400'}`} />
              <span>Excluir Extensiones</span>
              {excludedExtensions.length > 0 && (
                <span className="bg-rose-600 text-white font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {excludedExtensions.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center text-xs text-slate-500 font-mono">
              <span className="font-semibold text-indigo-400">{filteredCallsCount.toLocaleString()}</span>&nbsp;llamadas
            </div>

            {(selectedExtension !== 'all' || shift !== 'all' || isMultiDateActive || isLunchExcluded || isCustomHoursActive || excludedExtensions.length > 0) && (
              <button
                id="btn-clear-filters"
                onClick={handleResetAllFilters}
                className="text-indigo-400 hover:text-indigo-300 hover:underline text-xs flex items-center gap-1 font-medium cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer Todo</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Excluded Extensions & Lunch Chips Sub-bar */}
        {(excludedExtensions.length > 0 || isLunchExcluded || isMultiDateActive) && (
          <div className="flex items-center justify-between gap-2 px-4 lg:px-8 py-1.5 bg-[#0e0e12] border-t border-slate-800 text-xs">
            <div className="flex items-center gap-3 flex-wrap overflow-x-auto py-0.5">
              {/* Lunch excluded badge */}
              {isLunchExcluded && (
                <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-700/50 text-amber-300 px-2 py-0.5 rounded text-[11px]">
                  <Utensils className="w-3 h-3 text-amber-400" />
                  <span>Almuerzo excluido: {excludedHours.map(h => `${h}:00-${h + 1}:00`).join(', ')}</span>
                  <button
                    type="button"
                    onClick={onOpenHourlyLunchModal}
                    className="text-amber-400 hover:text-white font-bold ml-1 text-xs cursor-pointer"
                    title="Editar horario de almuerzo"
                  >
                    Editar
                  </button>
                </div>
              )}

              {/* Multi-date badge */}
              {isMultiDateActive && (
                <div className="flex items-center gap-1.5 bg-indigo-950/40 border border-indigo-700/50 text-indigo-300 px-2 py-0.5 rounded text-[11px]">
                  <CalendarDays className="w-3 h-3 text-indigo-400" />
                  <span>{selectedDates.length} fechas activas</span>
                  <button
                    type="button"
                    onClick={onOpenDateModal}
                    className="text-indigo-400 hover:text-white font-bold ml-1 text-xs cursor-pointer"
                  >
                    Editar
                  </button>
                </div>
              )}

              {/* Excluded extensions */}
              {excludedExtensions.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1 whitespace-nowrap">
                    <Ban className="w-3 h-3" />
                    <span>Ext. Excluidas ({excludedExtensions.length}):</span>
                  </span>
                  {excludedExtensions.map(ext => (
                    <span
                      key={ext}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-900/50 text-rose-200 border border-rose-700/50 text-[10px] font-mono"
                    >
                      <span>Ext. {ext}</span>
                      <button
                        type="button"
                        onClick={() => onRemoveExcluded(ext)}
                        className="text-rose-400 hover:text-white cursor-pointer"
                        title={`Quitar exclusión de Ext. ${ext}`}
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onClearExcluded}
              className="text-[11px] text-slate-400 hover:text-white underline whitespace-nowrap font-medium ml-2 cursor-pointer"
            >
              Restablecer Exclusiones
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
