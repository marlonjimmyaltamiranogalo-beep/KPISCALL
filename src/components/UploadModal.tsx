import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { 
  Upload, 
  X, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  RotateCcw, 
  FileText, 
  ArrowRight,
  HelpCircle,
  Database
} from 'lucide-react';
import { RawCDRRow, ColumnMapping } from '../types';
import { generateSampleCsvString, generateSampleCampaign2CsvString } from '../utils/cdrEngine';
import { generateDefaultCDRDataset, generateCampaign2CDRDataset } from '../data/mockCdrData';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (rows: RawCDRRow[], mapping?: Partial<ColumnMapping>) => void;
  onResetDemo: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded,
  onResetDemo
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<RawCDRRow[]>([]);
  const [availableHeaders, setAvailableHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    dateTimeCol: '',
    dateCol: '',
    timeCol: '',
    durationCol: '',
    callTypeCol: '',
    fromCol: '',
    toCol: ''
  });
  const [isSeparateDateTime, setIsSeparateDateTime] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showMappingConfig, setShowMappingConfig] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const autoDetectColumns = (headers: string[]) => {
    const cleanStr = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');

    const findMatch = (terms: string[]) => {
      return headers.find(h => {
        const clean = cleanStr(h);
        return terms.some(t => clean === t || clean.includes(t));
      }) || '';
    };

    const fechaCol = findMatch(['fecha', 'date', 'day', 'dia']);
    const horaCol = findMatch(['hora', 'time', 'hour', 'horainicio']);
    const combinedCol = findMatch(['datetime', 'timestamp', 'fechahora', 'fechayhora', 'date_time']);

    const hasSeparate = Boolean(fechaCol && horaCol && fechaCol !== horaCol);
    setIsSeparateDateTime(hasSeparate);

    const detected: ColumnMapping = {
      dateTimeCol: combinedCol || (hasSeparate ? fechaCol : (headers[0] || '')),
      dateCol: fechaCol || headers[0] || '',
      timeCol: horaCol || (headers.length > 1 ? headers[1] : ''),
      durationCol: findMatch(['duracion', 'duration', 'duracionseg', 'talktime', 'tiempo', 'segundos', 'billsec']) || headers[1] || '',
      callTypeCol: findMatch(['tipo', 'calltype', 'tipollamada', 'direction', 'sentido', 'tipo_llamada', 'type']) || headers[2] || '',
      fromCol: findMatch(['origen', 'from', 'caller', 'src', 'extension', 'agent', 'de', 'source']) || headers[3] || '',
      toCol: findMatch(['destino', 'to', 'callee', 'dst', 'receptor', 'para', 'target', 'destination']) || headers[4] || ''
    };

    setMapping(detected);
  };

  const handleFile = (file: File) => {
    setErrorMsg(null);
    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + ' KB');

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      Papa.parse<RawCDRRow>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const headers = results.meta.fields || Object.keys(results.data[0] || {});
            setAvailableHeaders(headers);
            setParsedRows(results.data);
            autoDetectColumns(headers);
            setShowMappingConfig(true);
          } else {
            setErrorMsg('El archivo CSV está vacío o no contiene filas válidas.');
          }
        },
        error: (err) => {
          setErrorMsg(`Error al parsear CSV: ${err.message}`);
        }
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json<RawCDRRow>(worksheet, { defval: '' });

          if (json && json.length > 0) {
            const headers = Object.keys(json[0]);
            setAvailableHeaders(headers);
            setParsedRows(json);
            autoDetectColumns(headers);
            setShowMappingConfig(true);
          } else {
            setErrorMsg('La hoja de Excel está vacía.');
          }
        } catch (err: any) {
          setErrorMsg(`Error al leer archivo Excel: ${err.message || err}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setErrorMsg('Formato no compatible. Por favor sube un archivo .CSV o .XLSX/.XLS');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleApply = () => {
    if (parsedRows.length === 0) {
      setErrorMsg('No hay filas cargadas para procesar.');
      return;
    }
    onDataLoaded(parsedRows, mapping);
    onClose();
  };

  const handleDownloadTemplate = (format: 1 | 2 = 1) => {
    const csvContent = format === 1 ? generateSampleCsvString() : generateSampleCampaign2CsvString();
    const fileName = format === 1 ? 'plantilla_cdr_campana_home.csv' : 'plantilla_cdr_campana_pospago.csv';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoadPreset = (campaignType: 1 | 2) => {
    setErrorMsg(null);
    if (campaignType === 1) {
      const data = generateDefaultCDRDataset();
      setFileName('campana_home_cdr.csv');
      setFileSize('12.4 KB');
      const headers = ['date_time', 'duration', 'calltype', 'from', 'to'];
      setAvailableHeaders(headers);
      setParsedRows(data);
      autoDetectColumns(headers);
      setShowMappingConfig(true);
    } else {
      const data = generateCampaign2CDRDataset();
      setFileName('campana_pospago_cdr.csv');
      setFileSize('8.6 KB');
      const headers = ['Fecha', 'Hora', 'Origen', 'Destino', 'Duración', 'Tipo', 'File'];
      setAvailableHeaders(headers);
      setParsedRows(data);
      autoDetectColumns(headers);
      setShowMappingConfig(true);
    }
  };

  return (
    <div 
      id="modal-upload-cdr"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-[#131317] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-[#0d0d10] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Cargar Archivo de Reportes Telefónicos (CDR)
              </h3>
              <p className="text-xs text-slate-400">
                Soporta archivos CSV y hojas de cálculo Excel (.xlsx, .xls)
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
              isDragging
                ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
                : 'border-slate-800 bg-[#0a0a0c] hover:border-indigo-500/50 hover:bg-[#111114]'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              accept=".csv, .xlsx, .xls"
              className="hidden" 
            />

            <div className="w-12 h-12 rounded-full bg-[#1a1a20] border border-slate-800 flex items-center justify-center text-indigo-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">
                Arrastra tu archivo CSV o Excel aquí, o haz <span className="text-indigo-400 underline">clic para buscar</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Columnas esperadas: date_time, duration, calltype, from, to
              </p>
            </div>

            {fileName && (
              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg border border-emerald-500/20 text-xs font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{fileName} ({fileSize}) - {parsedRows.length} filas detectadas</span>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="bg-rose-500/10 text-rose-400 p-3 rounded-lg border border-rose-500/20 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Column Mapper if File Loaded */}
          {showMappingConfig && availableHeaders.length > 0 && (
            <div className="bg-[#0d0d10] rounded-xl p-4 border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Mapeo de Columnas Detectadas
                </span>
                <span className="text-[11px] text-slate-500">
                  Verifica la correspondencia de campos
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-300">Modo de Fecha y Hora:</span>
                  <div className="flex items-center bg-[#1a1a20] rounded-md p-0.5 border border-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setIsSeparateDateTime(false)}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        !isSeparateDateTime ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Columna Única
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSeparateDateTime(true)}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        isSeparateDateTime ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Fecha + Hora Separadas
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-1">
                  {!isSeparateDateTime ? (
                    <div>
                      <label className="text-[11px] text-slate-400 font-mono block mb-1">Fecha y Hora (date_time / timestamp):</label>
                      <select
                        value={mapping.dateTimeCol}
                        onChange={(e) => setMapping({ ...mapping, dateTimeCol: e.target.value })}
                        className="w-full bg-[#1a1a20] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                      >
                        {availableHeaders.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="text-[11px] text-slate-400 font-mono block mb-1">Columna Fecha (ej. Fecha / Date):</label>
                        <select
                          value={mapping.dateCol || mapping.dateTimeCol}
                          onChange={(e) => setMapping({ ...mapping, dateCol: e.target.value })}
                          className="w-full bg-[#1a1a20] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                        >
                          {availableHeaders.map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 font-mono block mb-1">Columna Hora (ej. Hora / Time):</label>
                        <select
                          value={mapping.timeCol}
                          onChange={(e) => setMapping({ ...mapping, timeCol: e.target.value })}
                          className="w-full bg-[#1a1a20] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                        >
                          {availableHeaders.map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="text-[11px] text-slate-400 font-mono block mb-1">Duración (segundos / mm:ss / Duración):</label>
                    <select
                      value={mapping.durationCol}
                      onChange={(e) => setMapping({ ...mapping, durationCol: e.target.value })}
                      className="w-full bg-[#1a1a20] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                    >
                      {availableHeaders.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-mono block mb-1">Tipo de llamada (calltype / Tipo):</label>
                    <select
                      value={mapping.callTypeCol}
                      onChange={(e) => setMapping({ ...mapping, callTypeCol: e.target.value })}
                      className="w-full bg-[#1a1a20] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                    >
                      {availableHeaders.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-mono block mb-1">Origen (From / Extensión / Origen):</label>
                    <select
                      value={mapping.fromCol}
                      onChange={(e) => setMapping({ ...mapping, fromCol: e.target.value })}
                      className="w-full bg-[#1a1a20] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                    >
                      {availableHeaders.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-mono block mb-1">Destino (To / Receptor / Destino):</label>
                    <select
                      value={mapping.toCol}
                      onChange={(e) => setMapping({ ...mapping, toCol: e.target.value })}
                      className="w-full bg-[#1a1a20] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                    >
                      {availableHeaders.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="mt-2 border-t border-slate-800 pt-3">
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                  Previsualización de datos mapeados (primeras 3 filas):
                </span>
                <div className="overflow-x-auto bg-[#0a0a0c] rounded-lg p-2 text-[10px] font-mono text-slate-300">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-indigo-400">
                        <th className="p-1">Fecha / Hora</th>
                        <th className="p-1">Duración</th>
                        <th className="p-1">Tipo</th>
                        <th className="p-1">Origen</th>
                        <th className="p-1">Destino</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.slice(0, 3).map((r, i) => {
                        const dateText = isSeparateDateTime
                          ? `${String(r[mapping.dateCol || ''] || '')} ${String(r[mapping.timeCol || ''] || '')}`.trim()
                          : String(r[mapping.dateTimeCol || ''] || '');
                        return (
                          <tr key={i} className="border-b border-slate-800/50">
                            <td className="p-1 text-slate-200">{dateText || '-'}</td>
                            <td className="p-1 text-emerald-400">{String(r[mapping.durationCol] || '')}</td>
                            <td className="p-1 text-indigo-300">{String(r[mapping.callTypeCol] || '')}</td>
                            <td className="p-1 text-white">{String(r[mapping.fromCol] || '')}</td>
                            <td className="p-1 text-slate-300">{String(r[mapping.toCol] || '')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions & Campaign Presets */}
          <div className="flex flex-col gap-3 text-xs border-t border-slate-800 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-400">Cargar Campaña de Ejemplo:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleLoadPreset(1)}
                  className="px-2.5 py-1 rounded bg-[#1a1a20] hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Campaña Home</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadPreset(2)}
                  className="px-2.5 py-1 rounded bg-[#1a1a20] hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Campaña Pospago</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-slate-400">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate(1)}
                  className="text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Plantilla Campaña Home (.csv)</span>
                </button>
                <span className="text-slate-600">|</span>
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate(2)}
                  className="text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Plantilla Campaña Pospago (.csv)</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  onResetDemo();
                  onClose();
                }}
                className="text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer Todo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0d0d10] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>

          <button
            disabled={parsedRows.length === 0}
            onClick={handleApply}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              parsedRows.length > 0
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>Procesar y Visualizar ({parsedRows.length} filas)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
