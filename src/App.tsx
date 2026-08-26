import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { TiemposMuertosTab } from './components/TiemposMuertosTab';
import { OutboundTab } from './components/OutboundTab';
import { InboundTab } from './components/InboundTab';
import { UploadModal } from './components/UploadModal';
import { AllAlertsModal } from './components/AllAlertsModal';
import { ExtensionDetailModal } from './components/ExtensionDetailModal';
import { ExtensionExclusionModal } from './components/ExtensionExclusionModal';
import { DateMultiSelectModal } from './components/DateMultiSelectModal';
import { HourlyLunchFilterModal } from './components/HourlyLunchFilterModal';
import { MobileNav } from './components/MobileNav';
import { LoginScreen } from './components/LoginScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { generateDefaultCDRDataset } from './data/mockCdrData';
import { 
  processRawCDRRows, 
  filterCDRRecords, 
  calculateInactivityAnalysis, 
  calculateOutboundAnalysis, 
  calculateInboundAnalysis,
  generateSampleCsvString,
  analyzeDatasetDateBounds,
  formatDateDisplay,
  formatDateKey
} from './utils/cdrEngine';
import { RawCDRRow, CDRRecord, ShiftFilter, ColumnMapping, DatasetDateBounds } from './types';
import { 
  Activity, 
  Layers, 
  UserCheck, 
  Upload, 
  CheckCircle2,
  Headphones
} from 'lucide-react';

function DashboardApp() {
  const { user, loading } = useAuth();
  // 1. Raw and Parsed CDR Data State
  const [rawCDRData, setRawCDRData] = useState<RawCDRRow[]>(() => generateDefaultCDRDataset());
  const [cdrRecords, setCdrRecords] = useState<CDRRecord[]>(() => {
    const initialRaw = generateDefaultCDRDataset();
    return processRawCDRRows(initialRaw);
  });

  // 2. Navigation & UI State
  const [activeTab, setActiveTab] = useState<'tiempos-muertos' | 'outbound' | 'inbound'>('tiempos-muertos');
  const [activeSidebarView, setActiveSidebarView] = useState<string>('realtime');
  const [shift, setShift] = useState<ShiftFilter>('morning');
  const [selectedExtension, setSelectedExtension] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedHours, setSelectedHours] = useState<number[]>(() => Array.from({ length: 24 }, (_, i) => i));
  const [excludedHours, setExcludedHours] = useState<number[]>([]);
  const [excludedExtensions, setExcludedExtensions] = useState<string[]>([]);

  // 3. Modals State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAllAlertsModalOpen, setIsAllAlertsModalOpen] = useState(false);
  const [isExclusionModalOpen, setIsExclusionModalOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isHourlyLunchModalOpen, setIsHourlyLunchModalOpen] = useState(false);
  const [selectedDetailExtension, setSelectedDetailExtension] = useState<string | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto clear toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Extract all unique extensions and exact chronological date bounds from dataset
  const { availableExtensions, availableDates, totalUniqueAgents, dateBounds } = useMemo(() => {
    const bounds = analyzeDatasetDateBounds(cdrRecords);
    const exts = new Set<string>();

    cdrRecords.forEach(r => {
      if (r.agentExtension) exts.add(r.agentExtension);
      if (r.from && r.from.length <= 6) exts.add(r.from);
      if (r.to && r.to.length <= 6) exts.add(r.to);
    });

    const cleanExts = Array.from(exts).filter(e => {
      if (!e) return false;
      if (/^\d{7,}$/.test(e)) return false;
      return e.length <= 6;
    });
    cleanExts.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    return {
      availableExtensions: cleanExts,
      availableDates: bounds.availableDates,
      totalUniqueAgents: cleanExts.length,
      dateBounds: bounds
    };
  }, [cdrRecords]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return filterCDRRecords(cdrRecords, {
      shift,
      date: selectedDate,
      selectedDates,
      extension: selectedExtension,
      excludedExtensions,
      selectedHours,
      excludedHours
    });
  }, [cdrRecords, shift, selectedDate, selectedDates, selectedExtension, excludedExtensions, selectedHours, excludedHours]);

  // Calculations for Module 1: Tiempos Muertos
  const inactivityAnalysis = useMemo(() => {
    return calculateInactivityAnalysis(filteredRecords);
  }, [filteredRecords]);

  // Calculations for Module 2: Outbound
  const outboundAnalysis = useMemo(() => {
    return calculateOutboundAnalysis(filteredRecords);
  }, [filteredRecords]);

  // Calculations for Module 3: Inbound
  const inboundAnalysis = useMemo(() => {
    return calculateInboundAnalysis(filteredRecords);
  }, [filteredRecords]);

  // Handlers
  const handleDataLoaded = (rows: RawCDRRow[], mapping?: Partial<ColumnMapping>) => {
    const processed = processRawCDRRows(rows, mapping);
    const bounds = analyzeDatasetDateBounds(processed);

    setRawCDRData(rows);
    setCdrRecords(processed);
    setSelectedExtension('all');
    setSelectedDate('all');
    setSelectedDates([]);
    setSelectedHours(Array.from({ length: 24 }, (_, i) => i));
    setExcludedHours([]);
    setExcludedExtensions([]);

    if (bounds.availableDates.length > 1) {
      setToastMessage(
        `¡Dataset cargado con éxito! ${processed.length} llamadas procesadas del ${bounds.minDateStr} al ${bounds.maxDateStr} (${bounds.totalUniqueDates} días sin truncamiento).`
      );
    } else if (bounds.availableDates.length === 1) {
      setToastMessage(
        `¡Dataset cargado con éxito! ${processed.length} llamadas procesadas para la fecha ${bounds.minDateStr}.`
      );
    } else {
      setToastMessage(`¡Archivo procesado con éxito! Se cargaron ${processed.length} llamadas.`);
    }
  };

  const handleResetDemo = () => {
    const demo = generateDefaultCDRDataset();
    const processed = processRawCDRRows(demo);
    const bounds = analyzeDatasetDateBounds(processed);

    setRawCDRData(demo);
    setCdrRecords(processed);
    setShift('morning');
    setSelectedExtension('all');
    setSelectedDate('all');
    setSelectedDates([]);
    setSelectedHours(Array.from({ length: 24 }, (_, i) => i));
    setExcludedHours([]);
    setExcludedExtensions([]);
    setToastMessage(`Datos de demostración restaurados (${processed.length} llamadas, fecha ${bounds.minDateStr || '2026-08-19'}).`);
  };

  const handleToggleExcludeExtension = (ext: string) => {
    setExcludedExtensions(prev => {
      const exists = prev.includes(ext);
      const next = exists ? prev.filter(e => e !== ext) : [...prev, ext];
      setToastMessage(exists ? `Extensión ${ext} re-activada.` : `Extensión ${ext} excluida de las métricas.`);
      return next;
    });
  };

  const handleClearExcludedExtensions = () => {
    setExcludedExtensions([]);
    setSelectedDates([]);
    setExcludedHours([]);
    setSelectedHours(Array.from({ length: 24 }, (_, i) => i));
    setToastMessage('Filtros y exclusiones restablecidos.');
  };

  const handleRemoveExcluded = (ext: string) => {
    setExcludedExtensions(prev => prev.filter(e => e !== ext));
    setToastMessage(`Extensión ${ext} re-activada.`);
  };

  const handleToggleDate = (date: string) => {
    setSelectedDates(prev => {
      const exists = prev.includes(date);
      if (exists) {
        return prev.filter(d => d !== date);
      } else {
        return [...prev, date].sort();
      }
    });
  };

  const handleSetSelectedDates = (dates: string[]) => {
    setSelectedDates(dates);
    if (dates.length === 1) {
      setToastMessage(`Filtro aplicado: Fecha ${dates[0]}`);
    } else if (dates.length > 1) {
      setToastMessage(`Filtro aplicado: ${dates.length} fechas seleccionadas.`);
    } else {
      setToastMessage('Todas las fechas seleccionadas.');
    }
  };

  const handleSelectAllDates = () => {
    setSelectedDates([]);
    setToastMessage('Mostrando todas las fechas disponibles.');
  };

  const handleSetSelectedHours = (hours: number[]) => {
    setSelectedHours(hours);
  };

  const handleSetExcludedHours = (hours: number[]) => {
    setExcludedHours(hours);
    if (hours.length > 0) {
      setToastMessage(`Almuerzos/pausas (${hours.map(h => `${h}:00`).join(', ')}) excluidos del análisis.`);
    } else {
      setToastMessage('Horarios de almuerzo restablecidos.');
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = generateSampleCsvString();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_cdr_callcenter.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage('Descargando plantilla CSV de ejemplo...');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setToastMessage('Métricas recalculadas con éxito.');
    }, 400);
  };

  const shiftLabel = shift === 'morning'
    ? 'Picos de inactividad (8:00 - 14:00)'
    : shift === 'afternoon'
    ? 'Picos de inactividad (14:00 - 20:00)'
    : 'Picos de inactividad (24 Horas)';

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#0b0c10] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 animate-pulse">
          <Headphones className="w-6 h-6" />
        </div>
        <div className="text-white font-semibold text-sm mb-1">Cargando Call Center Expresso...</div>
        <div className="text-xs text-slate-500">Verificando sesión segura de Firebase</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] font-sans antialiased flex flex-col selection:bg-[#4d8eff]/30 selection:text-[#d8e2ff]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 lg:bottom-6 right-6 z-50 bg-[#171f33] border border-[#4edea3]/40 text-[#4edea3] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-fadeIn text-xs lg:text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Desktop Navigation Sidebar */}
      <Sidebar
        activeView={activeSidebarView}
        setActiveView={(view) => {
          setActiveSidebarView(view);
          if (view === 'alerts') {
            setIsAllAlertsModalOpen(true);
          }
        }}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onResetDemo={handleResetDemo}
        totalRecordsCount={cdrRecords.length}
        activeAgentsCount={totalUniqueAgents}
      />

      {/* Mobile Drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onResetDemo={handleResetDemo}
        totalCalls={cdrRecords.length}
        excludedCount={excludedExtensions.length}
        onOpenExclusionModal={() => setIsExclusionModalOpen(true)}
        onOpenDateModal={() => setIsDateModalOpen(true)}
        onOpenHourlyLunchModal={() => setIsHourlyLunchModalOpen(true)}
      />

      {/* Top Application Header */}
      <TopHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        shift={shift}
        setShift={setShift}
        selectedExtension={selectedExtension}
        setSelectedExtension={setSelectedExtension}
        availableExtensions={availableExtensions}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedDates={selectedDates}
        onOpenDateModal={() => setIsDateModalOpen(true)}
        availableDates={availableDates}
        selectedHours={selectedHours}
        excludedHours={excludedHours}
        onOpenHourlyLunchModal={() => setIsHourlyLunchModalOpen(true)}
        excludedExtensions={excludedExtensions}
        onOpenExclusionModal={() => setIsExclusionModalOpen(true)}
        onClearExcluded={handleClearExcludedExtensions}
        onRemoveExcluded={handleRemoveExcluded}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onDownloadTemplate={handleDownloadTemplate}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onOpenMobileNav={() => setIsMobileNavOpen(true)}
        filteredCallsCount={filteredRecords.length}
      />

      {/* Main Canvas */}
      <main className="pt-[160px] lg:pt-[150px] pb-[100px] lg:pb-[60px] px-4 lg:px-8 flex flex-col gap-6 max-w-7xl mx-auto w-full lg:ml-[280px] lg:w-[calc(100%-280px)]">
        {/* Module 1: Tiempos Muertos */}
        {activeTab === 'tiempos-muertos' && (
          <TiemposMuertosTab
            avgDeadTimeMinutes={inactivityAnalysis.overallAvgDeadTimeMinutes}
            worstExtension={inactivityAnalysis.worstExtension}
            totalCallsProcessed={inactivityAnalysis.totalCallsProcessed}
            criticalAlertsCount={inactivityAnalysis.criticalAlertsCount}
            top5Extensions={inactivityAnalysis.top5DeadTimes}
            hourlyDistribution={inactivityAnalysis.hourlyDistribution}
            alerts={inactivityAnalysis.alerts}
            onOpenAllAlerts={() => setIsAllAlertsModalOpen(true)}
            onSelectExtension={(ext) => setSelectedDetailExtension(ext)}
            shiftLabel={shiftLabel}
          />
        )}

        {/* Module 2: Outbound */}
        {activeTab === 'outbound' && (
          <OutboundTab
            totalOutboundCalls={outboundAnalysis.totalOutboundCalls}
            totalDurationSeconds={outboundAnalysis.totalDurationSeconds}
            avgHandlingTimeSeconds={outboundAnalysis.avgHandlingTimeSeconds}
            effectiveContacts={outboundAnalysis.effectiveContacts}
            effectiveRate={outboundAnalysis.effectiveRate}
            extensionStats={outboundAnalysis.extensionStats}
            top5Extensions={outboundAnalysis.top5ExtensionsByVolume}
            durationDistribution={outboundAnalysis.durationDistribution}
            hourlyDistribution={outboundAnalysis.hourlyDistribution}
            onSelectExtension={(ext) => setSelectedDetailExtension(ext)}
            shiftLabel={shiftLabel}
          />
        )}

        {/* Module 3: Inbound */}
        {activeTab === 'inbound' && (
          <InboundTab
            totalInboundCalls={inboundAnalysis.totalInboundCalls}
            totalDurationSeconds={inboundAnalysis.totalDurationSeconds}
            avgDurationSeconds={inboundAnalysis.avgDurationSeconds}
            shortCalls={inboundAnalysis.shortCalls}
            shortCallsRate={inboundAnalysis.shortCallsRate}
            extensionStats={inboundAnalysis.extensionStats}
            top5Extensions={inboundAnalysis.top5ExtensionsByVolume}
            hourlyDistribution={inboundAnalysis.hourlyDistribution}
            onSelectExtension={(ext) => setSelectedDetailExtension(ext)}
            shiftLabel={shiftLabel}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav 
        id="mobile-bottom-nav"
        className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 py-2 bg-[#111114]/95 backdrop-blur-lg border-t border-slate-800 shadow-[0_-8px_30px_rgb(0,0,0,0.6)] lg:hidden"
      >
        <button
          onClick={() => setActiveTab('tiempos-muertos')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all w-16 ${
            activeTab === 'tiempos-muertos'
              ? 'bg-indigo-600/10 text-indigo-400 font-bold border border-indigo-500/20'
              : 'text-slate-500 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4 text-rose-400" />
          <span className="text-[10px] mt-0.5">T. Muertos</span>
        </button>

        <button
          onClick={() => setActiveTab('outbound')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all w-16 ${
            activeTab === 'outbound'
              ? 'bg-indigo-600/10 text-indigo-400 font-bold border border-indigo-500/20'
              : 'text-slate-500 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] mt-0.5">Outbound</span>
        </button>

        <button
          onClick={() => setActiveTab('inbound')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all w-16 ${
            activeTab === 'inbound'
              ? 'bg-indigo-600/10 text-indigo-400 font-bold border border-indigo-500/20'
              : 'text-slate-500 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] mt-0.5">Inbound</span>
        </button>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl transition-all w-16 text-indigo-400 hover:text-indigo-300"
        >
          <Upload className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Cargar</span>
        </button>
      </nav>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDataLoaded={handleDataLoaded}
        onResetDemo={handleResetDemo}
      />

      <ExtensionExclusionModal
        isOpen={isExclusionModalOpen}
        onClose={() => setIsExclusionModalOpen(false)}
        availableExtensions={availableExtensions}
        excludedExtensions={excludedExtensions}
        onToggleExclude={handleToggleExcludeExtension}
        onSetExcluded={(exts) => setExcludedExtensions(exts)}
        onClearExcluded={handleClearExcludedExtensions}
        cdrRecords={cdrRecords}
      />

      <DateMultiSelectModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        availableDates={availableDates}
        selectedDates={selectedDates}
        onToggleDate={handleToggleDate}
        onSetSelectedDates={handleSetSelectedDates}
        onSelectAllDates={handleSelectAllDates}
        cdrRecords={cdrRecords}
        dateBounds={dateBounds}
      />

      <HourlyLunchFilterModal
        isOpen={isHourlyLunchModalOpen}
        onClose={() => setIsHourlyLunchModalOpen(false)}
        selectedHours={selectedHours}
        onSetSelectedHours={handleSetSelectedHours}
        excludedHours={excludedHours}
        onSetExcludedHours={handleSetExcludedHours}
        cdrRecords={cdrRecords}
      />

      <AllAlertsModal
        isOpen={isAllAlertsModalOpen}
        onClose={() => setIsAllAlertsModalOpen(false)}
        alerts={inactivityAnalysis.alerts}
        onSelectExtension={(ext) => setSelectedDetailExtension(ext)}
      />

      <ExtensionDetailModal
        extension={selectedDetailExtension}
        onClose={() => setSelectedDetailExtension(null)}
        records={filteredRecords}
        alerts={inactivityAnalysis.alerts}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DashboardApp />
    </AuthProvider>
  );
}
