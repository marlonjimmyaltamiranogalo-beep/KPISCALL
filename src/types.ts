export type CallType = 'Outgoing' | 'Incoming' | 'Internal' | 'Transfer';

export interface RawCDRRow {
  date_time?: string;
  duration?: string | number;
  calltype?: string;
  from?: string | number;
  to?: string | number;
  [key: string]: any;
}

export interface CDRRecord {
  id: string;
  dateTime: Date;
  dateTimeString: string;
  durationSeconds: number;
  callType: 'Outgoing' | 'Incoming' | 'Internal';
  from: string;
  to: string;
  agentExtension: string;
  status?: string;
}

export interface InactivityAlert {
  id: string;
  extension: string;
  startTime: string;      // Start of inactivity (end of previous call)
  endTime: string;        // End of inactivity (start of next call)
  durationSeconds: number;
  durationMinutes: number;
  prevCallDuration: number;
  nextCallDuration: number;
  severity: 'critical' | 'warning' | 'normal';
}

export interface ExtensionInactivity {
  extension: string;
  totalDeadTimeMinutes: number;
  avgDeadTimeMinutes: number;
  pausesCount: number;
  criticalPausesCount: number;
  maxPauseMinutes: number;
  lastActiveTime?: string;
}

export interface OutboundExtensionStats {
  extension: string;
  totalCalls: number;
  totalDurationSeconds: number;
  avgDurationSeconds: number; // AHT
  effectiveCalls: number;      // > 60s
  effectiveRate: number;       // percentage
}

export interface InboundExtensionStats {
  extension: string;
  totalReceived: number;
  totalDurationSeconds: number;
  avgDurationSeconds: number; // TMO
  shortCalls: number;         // < 30s
  shortCallsRate: number;      // percentage
}

export interface HourlyDistribution {
  hour: number;
  label: string;
  deadTimeMinutes: number;
  outboundCalls: number;
  inboundCalls: number;
  totalCalls: number;
}

export type ShiftFilter = 'all' | 'morning' | 'afternoon' | 'night';

export interface FilterOptions {
  shift: ShiftFilter;
  date?: string;
  selectedDates?: string[];
  extension: string;
  excludedExtensions?: string[];
  selectedHours?: number[];
  excludedHours?: number[];
  searchQuery?: string;
}

export interface ColumnMapping {
  dateTimeCol?: string;
  dateCol?: string;
  timeCol?: string;
  durationCol: string;
  callTypeCol: string;
  fromCol: string;
  toCol: string;
}
