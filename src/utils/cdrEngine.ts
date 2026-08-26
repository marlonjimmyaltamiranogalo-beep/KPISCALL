import {
  CDRRecord,
  RawCDRRow,
  InactivityAlert,
  ExtensionInactivity,
  OutboundExtensionStats,
  InboundExtensionStats,
  HourlyDistribution,
  FilterOptions,
  ColumnMapping,
  DatasetDateBounds
} from '../types';

const MONTHS_SPANISH_ENGLISH: Record<string, number> = {
  // English
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
  // Spanish
  ene: 0, enero: 0,
  febr: 1, febrero: 1,
  marz: 2, marzo: 2,
  abr: 3, abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  ago: 7, agosto: 7,
  set: 8, setiembre: 8, septiembre: 8,
  octubre: 9,
  novi: 10, noviembre: 10,
  dic: 11, dici: 11, diciembre: 11
};

/**
 * Formats a Date object into a standard 'YYYY-MM-DD' key using local calendar date values,
 * strictly preventing timezone skew / day-shift artifacts.
 */
export function formatDateKey(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Formats a 'YYYY-MM-DD' string or Date object into human-readable Spanish text.
 * e.g. "18 Ago 2026" or "Martes, 18 de agosto de 2026"
 */
export function formatDateDisplay(dateInput: string | Date, mode: 'short' | 'medium' | 'long' = 'medium'): string {
  let dateObj: Date;
  if (typeof dateInput === 'string') {
    const parts = dateInput.split('-');
    if (parts.length === 3) {
      dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      dateObj = new Date(dateInput);
    }
  } else {
    dateObj = dateInput;
  }

  if (!dateObj || isNaN(dateObj.getTime())) {
    return typeof dateInput === 'string' ? dateInput : '';
  }

  if (mode === 'short') {
    const d = String(dateObj.getDate()).padStart(2, '0');
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    return `${d}/${m}`;
  }

  if (mode === 'long') {
    return dateObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  return dateObj.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Checks if a list of sorted YYYY-MM-DD strings forms an uninterrupted daily sequence.
 */
function checkDateContinuity(sortedDates: string[]): boolean {
  if (sortedDates.length <= 1) return true;
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const [y1, m1, d1] = sortedDates[i].split('-').map(Number);
    const [y2, m2, d2] = sortedDates[i + 1].split('-').map(Number);
    const cur = new Date(y1, m1 - 1, d1).getTime();
    const next = new Date(y2, m2 - 1, d2).getTime();
    const diffDays = Math.round((next - cur) / (1000 * 60 * 60 * 24));
    if (diffDays !== 1) return false;
  }
  return true;
}

/**
 * Analyzes the real minimum and maximum dates across parsed CDR records,
 * guarantees complete extraction of availableDates without truncation or omission,
 * and returns a detailed date boundary summary.
 */
export function analyzeDatasetDateBounds(records: CDRRecord[]): DatasetDateBounds {
  if (!records || records.length === 0) {
    return {
      minDate: null,
      maxDate: null,
      minDateStr: null,
      maxDateStr: null,
      minDateFormatted: undefined,
      maxDateFormatted: undefined,
      availableDates: [],
      totalUniqueDates: 0,
      dateCounts: {},
      totalRecordsProcessed: 0,
      validDateRecordsCount: 0,
      invalidDateRecordsCount: 0,
      isContinuous: false
    };
  }

  const dateCountMap: Record<string, number> = {};
  let minTimestamp = Infinity;
  let maxTimestamp = -Infinity;
  let minDateObj: Date | null = null;
  let maxDateObj: Date | null = null;
  let validCount = 0;
  let invalidCount = 0;

  records.forEach(r => {
    if (r.dateTime instanceof Date && !isNaN(r.dateTime.getTime())) {
      validCount++;
      const time = r.dateTime.getTime();
      if (time < minTimestamp) {
        minTimestamp = time;
        minDateObj = r.dateTime;
      }
      if (time > maxTimestamp) {
        maxTimestamp = time;
        maxDateObj = r.dateTime;
      }

      const dateKey = formatDateKey(r.dateTime);
      if (dateKey) {
        dateCountMap[dateKey] = (dateCountMap[dateKey] || 0) + 1;
      }
    } else {
      invalidCount++;
    }
  });

  // Extract and strictly sort all unique dates chronologically (earliest to latest)
  const uniqueDates = Object.keys(dateCountMap).sort();
  const minDateStr = uniqueDates.length > 0 ? uniqueDates[0] : null;
  const maxDateStr = uniqueDates.length > 0 ? uniqueDates[uniqueDates.length - 1] : null;

  return {
    minDate: minDateObj,
    maxDate: maxDateObj,
    minDateStr,
    maxDateStr,
    minDateFormatted: minDateStr ? formatDateDisplay(minDateStr, 'medium') : undefined,
    maxDateFormatted: maxDateStr ? formatDateDisplay(maxDateStr, 'medium') : undefined,
    availableDates: uniqueDates,
    totalUniqueDates: uniqueDates.length,
    dateCounts: dateCountMap,
    totalRecordsProcessed: records.length,
    validDateRecordsCount: validCount,
    invalidDateRecordsCount: invalidCount,
    isContinuous: checkDateContinuity(uniqueDates)
  };
}

/**
 * Extracts unique available dates in 'YYYY-MM-DD' format sorted chronologically.
 */
export function extractUniqueAvailableDates(records: CDRRecord[]): string[] {
  return analyzeDatasetDateBounds(records).availableDates;
}

/**
 * Parses various date-time formats safely, handling both single combined fields
 * and separate Date + Time values, with support for English and Spanish month names.
 */
export function parseDateTime(dateVal: any, timeVal?: any): Date | null {
  if (!dateVal && !timeVal) return null;

  // If already a Date object
  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    if (timeVal && typeof timeVal === 'string') {
      const tMatch = timeVal.trim().match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
      if (tMatch) {
        const d = new Date(dateVal.getTime());
        d.setHours(parseInt(tMatch[1], 10), parseInt(tMatch[2], 10), tMatch[3] ? parseInt(tMatch[3], 10) : 0);
        return d;
      }
    }
    return dateVal;
  }

  // Handle Excel serial date numbers
  if (typeof dateVal === 'number') {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    let ms = dateVal * 86400 * 1000;
    if (typeof timeVal === 'number') {
      ms += timeVal * 86400 * 1000;
    }
    const d = new Date(excelEpoch.getTime() + ms);
    if (!isNaN(d.getTime())) return d;
  }

  const dateStr = String(dateVal || '').trim().replace(/^["']|["']$/g, '');
  const timeStr = String(timeVal || '').trim().replace(/^["']|["']$/g, '');

  let combined = timeStr ? `${dateStr} ${timeStr}` : dateStr;
  combined = combined.trim();

  // Extract time parts from combined or timeStr
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  const timeMatch = combined.match(/(?:^|\s|T)(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\s*(am|pm))?/i);
  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10);
    minutes = parseInt(timeMatch[2], 10);
    seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
    const ampm = timeMatch[4] ? timeMatch[4].toLowerCase() : null;
    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
  }

  // Date portion only
  const dateOnlyStr = combined.replace(/(?:T|\s+)\d{1,2}:\d{1,2}(?::\d{1,2})?(?:\s*(?:am|pm))?/i, '').trim();

  // 1. Text Month Pattern (e.g. "18 Aug 2026", "18-Ago-2026", "18 de Agosto de 2026", "18/Ago/2026")
  const textMonthMatch = dateOnlyStr.match(/^(\d{1,2})[\s\-/.de]+([a-zA-ZáéíóúÁÉÍÓÚ]{3,15})[\s\-/.de]+(\d{2,4})/i);
  if (textMonthMatch) {
    const day = parseInt(textMonthMatch[1], 10);
    const mStr = textMonthMatch[2].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").slice(0, 4);
    let month = -1;
    for (const [k, v] of Object.entries(MONTHS_SPANISH_ENGLISH)) {
      if (k === mStr || mStr.startsWith(k) || k.startsWith(mStr)) {
        month = v;
        break;
      }
    }
    let year = parseInt(textMonthMatch[3], 10);
    if (year < 100) year += 2000;
    if (month !== -1) {
      const parsed = new Date(year, month, day, hours, minutes, seconds);
      if (!isNaN(parsed.getTime())) return parsed;
    }
  }

  // 2. Month Text First (e.g. "Aug 18, 2026" or "Agosto 18 2026" or "August 18 2026")
  const monthTextFirstMatch = dateOnlyStr.match(/^([a-zA-ZáéíóúÁÉÍÓÚ]{3,15})[\s\-/.de]+(\d{1,2})(?:st|nd|rd|th)?,?[\s\-/.de]+(\d{2,4})/i);
  if (monthTextFirstMatch) {
    const mStr = monthTextFirstMatch[1].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").slice(0, 4);
    const day = parseInt(monthTextFirstMatch[2], 10);
    let month = -1;
    for (const [k, v] of Object.entries(MONTHS_SPANISH_ENGLISH)) {
      if (k === mStr || mStr.startsWith(k) || k.startsWith(mStr)) {
        month = v;
        break;
      }
    }
    let year = parseInt(monthTextFirstMatch[3], 10);
    if (year < 100) year += 2000;
    if (month !== -1) {
      const parsed = new Date(year, month, day, hours, minutes, seconds);
      if (!isNaN(parsed.getTime())) return parsed;
    }
  }

  // 3. DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmyMatch = dateOnlyStr.match(/^(\d{1,2})[/\-. ](\d{1,2})[/\-. ](\d{2,4})/);
  if (dmyMatch) {
    let first = parseInt(dmyMatch[1], 10);
    let second = parseInt(dmyMatch[2], 10);
    let year = parseInt(dmyMatch[3], 10);
    if (year < 100) year += 2000;

    let day = first;
    let month = second - 1;

    // Disambiguate if first > 12 (must be day) or second > 12 (second must be day)
    if (second > 12 && first <= 12) {
      day = second;
      month = first - 1;
    }

    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const parsed = new Date(year, month, day, hours, minutes, seconds);
      if (!isNaN(parsed.getTime())) return parsed;
    }
  }

  // 4. YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
  const ymdMatch = dateOnlyStr.match(/^(\d{4})[/\-. ](\d{1,2})[/\-. ](\d{1,2})/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const parsed = new Date(year, month, day, hours, minutes, seconds);
      if (!isNaN(parsed.getTime())) return parsed;
    }
  }

  // 5. Standard JS Date constructor fallback
  const directDate = new Date(combined);
  if (!isNaN(directDate.getTime())) {
    return directDate;
  }

  return null;
}

/**
 * Parses duration in seconds from number, seconds string, or HH:MM:SS format
 */
export function parseDurationSeconds(val: any): number {
  if (typeof val === 'number') return Math.max(0, Math.round(val));
  if (!val) return 0;
  
  const str = String(val).trim().replace(/^["']|["']$/g, '');
  
  // If numeric string like "120" or "18.5"
  if (/^\d+(\.\d+)?$/.test(str)) {
    return Math.max(0, Math.round(parseFloat(str)));
  }

  // If time format HH:MM:SS or MM:SS
  const parts = str.split(':').map(p => parseFloat(p));
  if (parts.length === 3 && !parts.some(isNaN)) {
    return Math.round(parts[0] * 3600 + parts[1] * 60 + parts[2]);
  } else if (parts.length === 2 && !parts.some(isNaN)) {
    return Math.round(parts[0] * 60 + parts[1]);
  }

  return 0;
}

/**
 * Normalizes calltype
 */
export function normalizeCallType(val: any): 'Outgoing' | 'Incoming' | 'Internal' {
  if (!val) return 'Outgoing';
  const str = String(val).trim().toLowerCase();
  
  if (str.includes('out') || str.includes('sal') || str.includes('emi') || str === 'o' || str === 'saliente') {
    return 'Outgoing';
  }
  if (str.includes('in') || str.includes('ent') || str.includes('rec') || str === 'i' || str === 'entrante') {
    return 'Incoming';
  }
  if (str.includes('int') || str.includes('loc') || str === 'internal') {
    return 'Internal';
  }
  return 'Outgoing';
}

/**
 * Formats seconds into MM:SS or HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const s = Math.round(seconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Formats time (e.g. 10:42)
 */
export function formatTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Converts raw uploaded rows into normalized CDRRecords
 */
export function processRawCDRRows(
  rows: RawCDRRow[],
  mapping?: Partial<ColumnMapping>
): CDRRecord[] {
  if (!rows || rows.length === 0) return [];

  const firstRow = rows[0] || {};
  const rawKeys = Object.keys(firstRow);
  const keys = rawKeys.filter(k => k && k.trim().length > 0);

  const cleanStr = (s: string) => {
    return s.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, '');
  };

  const findKey = (candidates: string[]) => {
    return keys.find(k => {
      const clean = cleanStr(k);
      return candidates.some(c => clean === c || clean.includes(c));
    });
  };

  // Separate Date and Time columns (e.g., "Fecha" and "Hora")
  const dateKey = mapping?.dateCol || findKey(['fecha', 'date', 'day', 'dia']);
  const timeKey = mapping?.timeCol || findKey(['hora', 'time', 'hour', 'horainicio']);
  const dateTimeKey = mapping?.dateTimeCol || findKey(['datetime', 'timestamp', 'fechahora', 'fechayhora', 'date_time']);

  const durationKey = mapping?.durationCol || findKey(['duracion', 'duration', 'duracionseg', 'talktime', 'tiempo', 'segundos', 'billsec']) || 'duration';
  const calltypeKey = mapping?.callTypeCol || findKey(['tipo', 'calltype', 'tipollamada', 'direction', 'sentido', 'tipo_llamada', 'type']) || 'calltype';
  const fromKey = mapping?.fromCol || findKey(['origen', 'from', 'caller', 'src', 'extension', 'agent', 'de', 'source']) || 'from';
  const toKey = mapping?.toCol || findKey(['destino', 'to', 'callee', 'dst', 'receptor', 'para', 'target', 'destination']) || 'to';

  const records: CDRRecord[] = [];

  rows.forEach((row, idx) => {
    let parsedDate: Date | null = null;

    // 1. Separate Date and Time columns (e.g., "Fecha" = "18 Aug 2026", "Hora" = "10:06:04")
    if (dateKey && timeKey && dateKey !== timeKey && row[dateKey] !== undefined && row[timeKey] !== undefined) {
      parsedDate = parseDateTime(row[dateKey], row[timeKey]);
    } else if (dateTimeKey && row[dateTimeKey] !== undefined) {
      // 2. If dateTimeKey provided, check if there's also a separate timeKey
      if (timeKey && dateKey && dateTimeKey === dateKey && row[timeKey]) {
        parsedDate = parseDateTime(row[dateTimeKey], row[timeKey]);
      } else {
        parsedDate = parseDateTime(row[dateTimeKey]);
      }
    } else if (dateKey && row[dateKey] !== undefined) {
      parsedDate = parseDateTime(row[dateKey]);
    }

    // 3. Fallback: check file name or any column containing timestamp
    if (!parsedDate) {
      for (const k of keys) {
        if (row[k]) {
          parsedDate = parseDateTime(row[k]);
          if (parsedDate) break;
        }
      }
    }

    if (!parsedDate) return;

    const duration = parseDurationSeconds(row[durationKey]);
    const callType = normalizeCallType(row[calltypeKey]);
    const from = String(row[fromKey] !== undefined ? row[fromKey] : '').trim();
    const to = String(row[toKey] !== undefined ? row[toKey] : '').trim();

    // Agent extension is caller for Outgoing, callee for Incoming
    let agentExtension = callType === 'Outgoing' ? from : to;
    if (!agentExtension) {
      agentExtension = from || to || 'Ext-101';
    }

    records.push({
      id: `cdr-${idx}-${parsedDate.getTime()}`,
      dateTime: parsedDate,
      dateTimeString: parsedDate.toISOString(),
      durationSeconds: duration,
      callType,
      from,
      to,
      agentExtension,
      status: row.status ? String(row.status) : (duration > 0 ? 'ANSWERED' : 'NO ANSWER')
    });
  });

  // Sort all records chronologically
  records.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

  return records;
}

/**
 * Filter CDR records based on Shift, Multi-Date / Date, Extension, and Hourly / Lunch exclusions
 */
export function filterCDRRecords(records: CDRRecord[], filters: FilterOptions): CDRRecord[] {
  const hasDateList = filters.selectedDates && filters.selectedDates.length > 0 && !filters.selectedDates.includes('all');
  const singleDate = filters.date && filters.date !== 'all' ? filters.date : null;

  const hasExcludedHours = filters.excludedHours && filters.excludedHours.length > 0;
  const hasSelectedHours = filters.selectedHours && filters.selectedHours.length > 0 && filters.selectedHours.length < 24;

  return records.filter(record => {
    const dateObj = record.dateTime;
    const hour = dateObj.getHours();

    // 1. Shift filter (applied if no explicit custom selected hours are given)
    if (!hasSelectedHours) {
      if (filters.shift === 'morning') {
        if (hour < 8 || hour >= 14) return false;
      } else if (filters.shift === 'afternoon') {
        if (hour < 14 || hour >= 20) return false;
      } else if (filters.shift === 'night') {
        if (hour >= 8 && hour < 20) return false;
      }
    }

    // 2. Custom Hourly Selection / Lunch Exclusion
    if (hasExcludedHours && filters.excludedHours!.includes(hour)) {
      return false;
    }
    if (hasSelectedHours && !filters.selectedHours!.includes(hour)) {
      return false;
    }

    // 3. Multi-Date or Single Date filter
    const recordDateStr = formatDateKey(dateObj);

    if (hasDateList) {
      if (!filters.selectedDates!.includes(recordDateStr)) {
        return false;
      }
    } else if (singleDate) {
      if (recordDateStr !== singleDate) {
        return false;
      }
    }

    // 4. Extension filter
    if (filters.extension && filters.extension !== 'all') {
      if (record.agentExtension !== filters.extension && record.from !== filters.extension && record.to !== filters.extension) {
        return false;
      }
    }

    // 5. Excluded Extensions filter
    if (filters.excludedExtensions && filters.excludedExtensions.length > 0) {
      const isExcluded = filters.excludedExtensions.some(ext => 
        record.agentExtension === ext || record.from === ext || record.to === ext
      );
      if (isExcluded) return false;
    }

    return true;
  });
}

/**
 * Calculates Dead Time (Inactivity) and Critical Alerts
 * Rule: Gap = next_start - (prev_start + prev_duration)
 * Ignore gaps > 2 hours (120 minutes = 7200 seconds)
 * Critical alerts: gap > 5 minutes (300 seconds)
 */
export function calculateInactivityAnalysis(records: CDRRecord[]): {
  overallAvgDeadTimeMinutes: number;
  worstExtension: { extension: string; deadTimeMinutes: number };
  totalCallsProcessed: number;
  criticalAlertsCount: number;
  extensionDeadTimes: ExtensionInactivity[];
  top5DeadTimes: ExtensionInactivity[];
  alerts: InactivityAlert[];
  hourlyDistribution: { hour: number; label: string; deadTimeMinutes: number; callsCount: number }[];
} {
  const totalCallsProcessed = records.length;
  if (totalCallsProcessed === 0) {
    return {
      overallAvgDeadTimeMinutes: 0,
      worstExtension: { extension: 'N/A', deadTimeMinutes: 0 },
      totalCallsProcessed: 0,
      criticalAlertsCount: 0,
      extensionDeadTimes: [],
      top5DeadTimes: [],
      alerts: [],
      hourlyDistribution: []
    };
  }

  // Group records by agent extension
  const byExtension = new Map<string, CDRRecord[]>();
  records.forEach(r => {
    const ext = r.agentExtension;
    if (!byExtension.has(ext)) {
      byExtension.set(ext, []);
    }
    byExtension.get(ext)!.push(r);
  });

  const alerts: InactivityAlert[] = [];
  const extensionStatsMap = new Map<string, {
    totalDeadSeconds: number;
    pauseCount: number;
    criticalCount: number;
    maxPauseSeconds: number;
  }>();

  // Hourly dead time accumulator: 0 to 23
  const hourlyDeadSeconds = new Array(24).fill(0);
  const hourlyCalls = new Array(24).fill(0);

  records.forEach(r => {
    const h = r.dateTime.getHours();
    hourlyCalls[h]++;
  });

  byExtension.forEach((extRecords, ext) => {
    // Sort chronologically
    extRecords.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

    let totalDeadSec = 0;
    let pauseCount = 0;
    let criticalCount = 0;
    let maxPauseSec = 0;

    for (let i = 0; i < extRecords.length - 1; i++) {
      const currentCall = extRecords[i];
      const nextCall = extRecords[i + 1];

      const currentEndMs = currentCall.dateTime.getTime() + (currentCall.durationSeconds * 1000);
      const nextStartMs = nextCall.dateTime.getTime();

      const deadMs = nextStartMs - currentEndMs;
      const deadSec = Math.floor(deadMs / 1000);

      // Ignore negative (overlapping)
      if (deadSec <= 0) continue;

      // Ignore pauses > 2 hours (7200 seconds) - lunch, shift change, or next day
      if (deadSec > 7200) continue;

      totalDeadSec += deadSec;
      pauseCount++;
      if (deadSec > maxPauseSec) maxPauseSec = deadSec;

      // Hourly accumulation based on currentEnd time
      const endHour = new Date(currentEndMs).getHours();
      hourlyDeadSeconds[endHour] += deadSec;

      // Critical alert if > 5 minutes (300 seconds)
      if (deadSec >= 300) {
        criticalCount++;
        const deadMinutes = parseFloat((deadSec / 60).toFixed(1));
        const severity = deadMinutes >= 15 ? 'critical' : (deadMinutes >= 10 ? 'warning' : 'normal');

        alerts.push({
          id: `alert-${ext}-${i}-${currentEndMs}`,
          extension: ext,
          startTime: formatTime(new Date(currentEndMs)),
          endTime: formatTime(nextCall.dateTime),
          durationSeconds: deadSec,
          durationMinutes: deadMinutes,
          prevCallDuration: currentCall.durationSeconds,
          nextCallDuration: nextCall.durationSeconds,
          severity
        });
      }
    }

    extensionStatsMap.set(ext, {
      totalDeadSeconds: totalDeadSec,
      pauseCount,
      criticalCount,
      maxPauseSeconds: maxPauseSec
    });
  });

  // Compile extension list
  const extensionDeadTimes: ExtensionInactivity[] = [];
  let totalAllDeadSeconds = 0;
  let totalAllPauses = 0;

  extensionStatsMap.forEach((stats, ext) => {
    totalAllDeadSeconds += stats.totalDeadSeconds;
    totalAllPauses += stats.pauseCount;
    const avgMinutes = stats.pauseCount > 0 ? (stats.totalDeadSeconds / stats.pauseCount / 60) : 0;

    extensionDeadTimes.push({
      extension: ext,
      totalDeadTimeMinutes: parseFloat((stats.totalDeadSeconds / 60).toFixed(1)),
      avgDeadTimeMinutes: parseFloat(avgMinutes.toFixed(1)),
      pausesCount: stats.pauseCount,
      criticalPausesCount: stats.criticalCount,
      maxPauseMinutes: parseFloat((stats.maxPauseSeconds / 60).toFixed(1))
    });
  });

  // Sort top extension by total dead time
  extensionDeadTimes.sort((a, b) => b.totalDeadTimeMinutes - a.totalDeadTimeMinutes);

  const top5DeadTimes = extensionDeadTimes.slice(0, 5);

  const worstExtension = top5DeadTimes.length > 0
    ? { extension: top5DeadTimes[0].extension, deadTimeMinutes: top5DeadTimes[0].totalDeadTimeMinutes }
    : { extension: 'N/A', deadTimeMinutes: 0 };

  const overallAvgDeadTimeMinutes = totalAllPauses > 0
    ? parseFloat((totalAllDeadSeconds / totalAllPauses / 60).toFixed(1))
    : 0;

  // Sort alerts descending by duration
  alerts.sort((a, b) => b.durationSeconds - a.durationSeconds);

  // Hourly distribution
  const hourlyDistribution = [];
  for (let h = 8; h <= 20; h++) {
    hourlyDistribution.push({
      hour: h,
      label: `${h}h`,
      deadTimeMinutes: parseFloat((hourlyDeadSeconds[h] / 60).toFixed(1)),
      callsCount: hourlyCalls[h]
    });
  }

  return {
    overallAvgDeadTimeMinutes,
    worstExtension,
    totalCallsProcessed,
    criticalAlertsCount: alerts.length,
    extensionDeadTimes,
    top5DeadTimes,
    alerts,
    hourlyDistribution
  };
}

/**
 * Calculates Outbound KPIs
 * Filter: calltype === 'Outgoing'
 * KPIs: Total llamadas salientes, AHT promedio, Contactos Efectivos (> 1 min), % Efectividad
 */
export function calculateOutboundAnalysis(records: CDRRecord[]): {
  totalOutboundCalls: number;
  totalDurationSeconds: number;
  avgHandlingTimeSeconds: number; // AHT
  effectiveContacts: number;     // > 60s
  effectiveRate: number;         // percentage
  extensionStats: OutboundExtensionStats[];
  top5ExtensionsByVolume: OutboundExtensionStats[];
  durationDistribution: { range: string; count: number; percentage: number }[];
  hourlyDistribution: { hour: number; label: string; calls: number; effectiveCalls: number }[];
} {
  const outboundRecords = records.filter(r => r.callType === 'Outgoing');
  const totalOutboundCalls = outboundRecords.length;

  if (totalOutboundCalls === 0) {
    return {
      totalOutboundCalls: 0,
      totalDurationSeconds: 0,
      avgHandlingTimeSeconds: 0,
      effectiveContacts: 0,
      effectiveRate: 0,
      extensionStats: [],
      top5ExtensionsByVolume: [],
      durationDistribution: [
        { range: '< 30s', count: 0, percentage: 0 },
        { range: '30s - 1m', count: 0, percentage: 0 },
        { range: '1m - 3m', count: 0, percentage: 0 },
        { range: '3m - 5m', count: 0, percentage: 0 },
        { range: '> 5m', count: 0, percentage: 0 }
      ],
      hourlyDistribution: []
    };
  }

  let totalDurationSeconds = 0;
  let effectiveContacts = 0;

  const durationBins = {
    under30: 0,
    under60: 0,
    under180: 0,
    under300: 0,
    over300: 0
  };

  const byExtension = new Map<string, {
    totalCalls: number;
    totalDuration: number;
    effectiveCalls: number;
  }>();

  const hourlyCalls = new Array(24).fill(0);
  const hourlyEffective = new Array(24).fill(0);

  outboundRecords.forEach(r => {
    const dur = r.durationSeconds;
    totalDurationSeconds += dur;
    const isEffective = dur > 60;
    if (isEffective) effectiveContacts++;

    // Duration bins
    if (dur < 30) durationBins.under30++;
    else if (dur <= 60) durationBins.under60++;
    else if (dur <= 180) durationBins.under180++;
    else if (dur <= 300) durationBins.under300++;
    else durationBins.over300++;

    // Hourly
    const h = r.dateTime.getHours();
    hourlyCalls[h]++;
    if (isEffective) hourlyEffective[h]++;

    // Extension stats
    const ext = r.from || r.agentExtension;
    if (!byExtension.has(ext)) {
      byExtension.set(ext, { totalCalls: 0, totalDuration: 0, effectiveCalls: 0 });
    }
    const extStat = byExtension.get(ext)!;
    extStat.totalCalls++;
    extStat.totalDuration += dur;
    if (isEffective) extStat.effectiveCalls++;
  });

  const avgHandlingTimeSeconds = Math.round(totalDurationSeconds / totalOutboundCalls);
  const effectiveRate = parseFloat(((effectiveContacts / totalOutboundCalls) * 100).toFixed(1));

  const extensionStats: OutboundExtensionStats[] = [];
  byExtension.forEach((stats, ext) => {
    const avg = stats.totalCalls > 0 ? Math.round(stats.totalDuration / stats.totalCalls) : 0;
    const effRate = stats.totalCalls > 0 ? parseFloat(((stats.effectiveCalls / stats.totalCalls) * 100).toFixed(1)) : 0;
    extensionStats.push({
      extension: ext,
      totalCalls: stats.totalCalls,
      totalDurationSeconds: stats.totalDuration,
      avgDurationSeconds: avg,
      effectiveCalls: stats.effectiveCalls,
      effectiveRate: effRate
    });
  });

  // Sort by total calls descending
  extensionStats.sort((a, b) => b.totalCalls - a.totalCalls);
  const top5ExtensionsByVolume = extensionStats.slice(0, 5);

  const durationDistribution = [
    { range: '< 30s', count: durationBins.under30, percentage: parseFloat(((durationBins.under30 / totalOutboundCalls) * 100).toFixed(1)) },
    { range: '30s - 1m', count: durationBins.under60, percentage: parseFloat(((durationBins.under60 / totalOutboundCalls) * 100).toFixed(1)) },
    { range: '1m - 3m', count: durationBins.under180, percentage: parseFloat(((durationBins.under180 / totalOutboundCalls) * 100).toFixed(1)) },
    { range: '3m - 5m', count: durationBins.under300, percentage: parseFloat(((durationBins.under300 / totalOutboundCalls) * 100).toFixed(1)) },
    { range: '> 5m', count: durationBins.over300, percentage: parseFloat(((durationBins.over300 / totalOutboundCalls) * 100).toFixed(1)) }
  ];

  const hourlyDistribution = [];
  for (let h = 8; h <= 20; h++) {
    hourlyDistribution.push({
      hour: h,
      label: `${h}h`,
      calls: hourlyCalls[h],
      effectiveCalls: hourlyEffective[h]
    });
  }

  return {
    totalOutboundCalls,
    totalDurationSeconds,
    avgHandlingTimeSeconds,
    effectiveContacts,
    effectiveRate,
    extensionStats,
    top5ExtensionsByVolume,
    durationDistribution,
    hourlyDistribution
  };
}

/**
 * Calculates Inbound KPIs
 * Filter: calltype === 'Incoming'
 * KPIs: Total llamadas entrantes, TMO promedio, Llamadas cortas (< 30s), Tasa abandono / calidad
 */
export function calculateInboundAnalysis(records: CDRRecord[]): {
  totalInboundCalls: number;
  totalDurationSeconds: number;
  avgDurationSeconds: number; // TMO
  shortCalls: number;         // < 30s
  shortCallsRate: number;     // percentage
  extensionStats: InboundExtensionStats[];
  top5ExtensionsByVolume: InboundExtensionStats[];
  hourlyDistribution: { hour: number; label: string; calls: number; shortCalls: number }[];
} {
  const inboundRecords = records.filter(r => r.callType === 'Incoming');
  const totalInboundCalls = inboundRecords.length;

  if (totalInboundCalls === 0) {
    return {
      totalInboundCalls: 0,
      totalDurationSeconds: 0,
      avgDurationSeconds: 0,
      shortCalls: 0,
      shortCallsRate: 0,
      extensionStats: [],
      top5ExtensionsByVolume: [],
      hourlyDistribution: []
    };
  }

  let totalDurationSeconds = 0;
  let shortCalls = 0;

  const byExtension = new Map<string, {
    totalReceived: number;
    totalDuration: number;
    shortCalls: number;
  }>();

  const hourlyCalls = new Array(24).fill(0);
  const hourlyShort = new Array(24).fill(0);

  inboundRecords.forEach(r => {
    const dur = r.durationSeconds;
    totalDurationSeconds += dur;
    const isShort = dur < 30;
    if (isShort) shortCalls++;

    const h = r.dateTime.getHours();
    hourlyCalls[h]++;
    if (isShort) hourlyShort[h]++;

    const ext = r.to || r.agentExtension;
    if (!byExtension.has(ext)) {
      byExtension.set(ext, { totalReceived: 0, totalDuration: 0, shortCalls: 0 });
    }
    const extStat = byExtension.get(ext)!;
    extStat.totalReceived++;
    extStat.totalDuration += dur;
    if (isShort) extStat.shortCalls++;
  });

  const avgDurationSeconds = Math.round(totalDurationSeconds / totalInboundCalls);
  const shortCallsRate = parseFloat(((shortCalls / totalInboundCalls) * 100).toFixed(1));

  const extensionStats: InboundExtensionStats[] = [];
  byExtension.forEach((stats, ext) => {
    const avg = stats.totalReceived > 0 ? Math.round(stats.totalDuration / stats.totalReceived) : 0;
    const rate = stats.totalReceived > 0 ? parseFloat(((stats.shortCalls / stats.totalReceived) * 100).toFixed(1)) : 0;
    extensionStats.push({
      extension: ext,
      totalReceived: stats.totalReceived,
      totalDurationSeconds: stats.totalDuration,
      avgDurationSeconds: avg,
      shortCalls: stats.shortCalls,
      shortCallsRate: rate
    });
  });

  extensionStats.sort((a, b) => b.totalReceived - a.totalReceived);
  const top5ExtensionsByVolume = extensionStats.slice(0, 5);

  const hourlyDistribution = [];
  for (let h = 8; h <= 20; h++) {
    hourlyDistribution.push({
      hour: h,
      label: `${h}h`,
      calls: hourlyCalls[h],
      shortCalls: hourlyShort[h]
    });
  }

  return {
    totalInboundCalls,
    totalDurationSeconds,
    avgDurationSeconds,
    shortCalls,
    shortCallsRate,
    extensionStats,
    top5ExtensionsByVolume,
    hourlyDistribution
  };
}

/**
 * Generate downloadable CSV sample template (Format 1: Combined date_time)
 */
export function generateSampleCsvString(): string {
  const headers = 'date_time,duration,calltype,from,to\n';
  const rows = [
    '2026-08-19 08:05:12,180,Outgoing,3810,555102030',
    '2026-08-19 08:18:00,240,Outgoing,3810,555102031',
    '2026-08-19 08:35:00,120,Outgoing,3810,555102032',
    '2026-08-19 08:06:00,195,Incoming,555909090,4012',
    '2026-08-19 08:15:30,225,Incoming,555909091,4012',
    '2026-08-19 08:25:00,18,Incoming,555909092,4012',
    '2026-08-19 08:10:00,90,Outgoing,3812,555203040',
    '2026-08-19 08:30:00,150,Outgoing,3812,555203041',
    '2026-08-19 08:50:00,210,Outgoing,3812,555203042',
    '2026-08-19 08:12:00,180,Incoming,555808080,4055',
    '2026-08-19 08:22:00,310,Incoming,555808081,4055',
    '2026-08-19 08:45:00,45,Incoming,555808082,4055'
  ];
  return headers + rows.join('\n');
}

