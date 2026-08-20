import { RawCDRRow } from '../types';

/**
 * Generates an extensive, highly realistic CDR dataset
 * Designed to accurately produce the metrics, top extensions, and alerts shown in the supervisor UI
 */
export function generateDefaultCDRDataset(): RawCDRRow[] {
  const dataset: RawCDRRow[] = [];
  const baseDate = '2026-08-19';

  // Helper to format ISO/date string
  const formatDateTime = (dateStr: string, hour: number, minute: number, second: number = 0) => {
    const h = String(hour).padStart(2, '0');
    const m = String(minute).padStart(2, '0');
    const s = String(second).padStart(2, '0');
    return `${dateStr} ${h}:${m}:${s}`;
  };

  // 1. OUTBOUND AGENTS - MORNING SHIFT (08:00 - 14:00)
  
  // Extension 3810 (Top in dead time with 13m pause at 10:42 -> 11:00)
  const ext3810Calls = [
    { h: 8, m: 5, dur: 180, to: '555010001' },
    { h: 8, m: 18, dur: 240, to: '555010002' }, // gap: 10m
    { h: 8, m: 35, dur: 120, to: '555010003' }, // gap: 13m
    { h: 8, m: 52, dur: 300, to: '555010004' }, // gap: 15m
    { h: 9, m: 10, dur: 180, to: '555010005' },
    { h: 9, m: 30, dur: 210, to: '555010006' },
    { h: 9, m: 55, dur: 190, to: '555010007' },
    { h: 10, m: 15, dur: 160, to: '555010008' },
    { h: 10, m: 38, dur: 240, to: '555010009' }, // ends at 10:42
    { h: 11, m: 0, dur: 200, to: '555010010' },  // gap: 13m (Alert 1)
    { h: 11, m: 20, dur: 180, to: '555010011' },
    { h: 11, m: 45, dur: 220, to: '555010012' },
    { h: 12, m: 10, dur: 150, to: '555010013' },
    { h: 12, m: 30, dur: 190, to: '555010014' },
    { h: 13, m: 5, dur: 250, to: '555010015' },  // gap: 31m (Alert / High peak at 13h)
    { h: 13, m: 40, dur: 180, to: '555010016' }
  ];
  ext3810Calls.forEach(c => {
    dataset.push({
      date_time: formatDateTime(baseDate, c.h, c.m, 0),
      duration: c.dur,
      calltype: 'Outgoing',
      from: '3810',
      to: c.to
    });
  });

  // Extension 3812 (Second worst dead time, pause at 10:44 -> 11:00 = 11m)
  const ext3812Calls = [
    { h: 8, m: 8, dur: 120, to: '555020001' },
    { h: 8, m: 22, dur: 180, to: '555020002' },
    { h: 8, m: 40, dur: 150, to: '555020003' },
    { h: 9, m: 5, dur: 200, to: '555020004' },
    { h: 9, m: 25, dur: 190, to: '555020005' },
    { h: 9, m: 48, dur: 210, to: '555020006' },
    { h: 10, m: 12, dur: 180, to: '555020007' },
    { h: 10, m: 39, dur: 300, to: '555020008' }, // ends at 10:44
    { h: 11, m: 0, dur: 180, to: '555020009' },  // gap: 11m (Alert 2)
    { h: 11, m: 18, dur: 210, to: '555020010' },
    { h: 11, m: 42, dur: 170, to: '555020011' },
    { h: 12, m: 15, dur: 190, to: '555020012' },
    { h: 12, m: 40, dur: 220, to: '555020013' },
    { h: 13, m: 12, dur: 160, to: '555020014' },
    { h: 13, m: 45, dur: 200, to: '555020015' }
  ];
  ext3812Calls.forEach(c => {
    dataset.push({
      date_time: formatDateTime(baseDate, c.h, c.m, 15),
      duration: c.dur,
      calltype: 'Outgoing',
      from: '3812',
      to: c.to
    });
  });

  // Extension 3845 (Pause at 10:46 -> 11:00 = 9m)
  const ext3845Calls = [
    { h: 8, m: 12, dur: 180, to: '555030001' },
    { h: 8, m: 30, dur: 210, to: '555030002' },
    { h: 8, m: 50, dur: 160, to: '555030003' },
    { h: 9, m: 15, dur: 220, to: '555030004' },
    { h: 9, m: 40, dur: 190, to: '555030005' },
    { h: 10, m: 5, dur: 180, to: '555030006' },
    { h: 10, m: 28, dur: 240, to: '555030007' },
    { h: 10, m: 43, dur: 180, to: '555030008' }, // ends at 10:46
    { h: 11, m: 0, dur: 190, to: '555030009' },  // gap: 9m (Alert 3)
    { h: 11, m: 22, dur: 160, to: '555030010' },
    { h: 11, m: 48, dur: 200, to: '555030011' },
    { h: 12, m: 20, dur: 180, to: '555030012' },
    { h: 12, m: 48, dur: 190, to: '555030013' },
    { h: 13, m: 20, dur: 210, to: '555030014' },
    { h: 13, m: 50, dur: 170, to: '555030015' }
  ];
  ext3845Calls.forEach(c => {
    dataset.push({
      date_time: formatDateTime(baseDate, c.h, c.m, 30),
      duration: c.dur,
      calltype: 'Outgoing',
      from: '3845',
      to: c.to
    });
  });

  // Extension 3801 (Pause at 10:47 -> 11:00 = 8m)
  const ext3801Calls = [
    { h: 8, m: 10, dur: 200, to: '555040001' },
    { h: 8, m: 28, dur: 190, to: '555040002' },
    { h: 8, m: 45, dur: 180, to: '555040003' },
    { h: 9, m: 10, dur: 220, to: '555040004' },
    { h: 9, m: 35, dur: 170, to: '555040005' },
    { h: 10, m: 2, dur: 190, to: '555040006' },
    { h: 10, m: 25, dur: 180, to: '555040007' },
    { h: 10, m: 44, dur: 180, to: '555040008' }, // ends at 10:47
    { h: 11, m: 0, dur: 210, to: '555040009' },  // gap: 8m (Alert 4)
    { h: 11, m: 25, dur: 180, to: '555040010' },
    { h: 11, m: 50, dur: 190, to: '555040011' },
    { h: 12, m: 18, dur: 200, to: '555040012' },
    { h: 12, m: 45, dur: 170, to: '555040013' },
    { h: 13, m: 15, dur: 220, to: '555040014' },
    { h: 13, m: 48, dur: 180, to: '555040015' }
  ];
  ext3801Calls.forEach(c => {
    dataset.push({
      date_time: formatDateTime(baseDate, c.h, c.m, 45),
      duration: c.dur,
      calltype: 'Outgoing',
      from: '3801',
      to: c.to
    });
  });

  // Extension 3822 (Pause at 10:48 -> 11:00 = 7m)
  const ext3822Calls = [
    { h: 8, m: 15, dur: 180, to: '555050001' },
    { h: 8, m: 35, dur: 190, to: '555050002' },
    { h: 8, m: 55, dur: 200, to: '555050003' },
    { h: 9, m: 20, dur: 170, to: '555050004' },
    { h: 9, m: 45, dur: 180, to: '555050005' },
    { h: 10, m: 10, dur: 210, to: '555050006' },
    { h: 10, m: 32, dur: 190, to: '555050007' },
    { h: 10, m: 46, dur: 120, to: '555050008' }, // ends at 10:48
    { h: 11, m: 0, dur: 180, to: '555050009' },  // gap: 7m (Alert 5)
    { h: 11, m: 22, dur: 190, to: '555050010' },
    { h: 11, m: 46, dur: 180, to: '555050011' },
    { h: 12, m: 10, dur: 200, to: '555050012' },
    { h: 12, m: 35, dur: 170, to: '555050013' },
    { h: 13, m: 8, dur: 190, to: '555050014' },
    { h: 13, m: 35, dur: 210, to: '555050015' }
  ];
  ext3822Calls.forEach(c => {
    dataset.push({
      date_time: formatDateTime(baseDate, c.h, c.m, 0),
      duration: c.dur,
      calltype: 'Outgoing',
      from: '3822',
      to: c.to
    });
  });

  // 2. INBOUND AGENTS - MORNING SHIFT (08:00 - 14:00)
  const inboundMorningAgents = [
    { ext: '4012', callCount: 45, avgDur: 217, shortCount: 4 },
    { ext: '4055', callCount: 40, avgDur: 213, shortCount: 3 },
    { ext: '4023', callCount: 38, avgDur: 232, shortCount: 5 },
    { ext: '4088', callCount: 35, avgDur: 224, shortCount: 2 },
    { ext: '4005', callCount: 32, avgDur: 226, shortCount: 3 }
  ];

  inboundMorningAgents.forEach((agent, aIdx) => {
    for (let i = 0; i < agent.callCount; i++) {
      // Distribute across 8h to 13h
      const h = 8 + Math.floor((i / agent.callCount) * 6);
      const m = (i * 7 + aIdx * 3) % 60;
      const s = (i * 13) % 60;
      
      const isShort = i < agent.shortCount;
      const dur = isShort ? Math.floor(10 + Math.random() * 18) : Math.floor(agent.avgDur + (Math.sin(i) * 60));

      dataset.push({
        date_time: formatDateTime(baseDate, h, m, s),
        duration: dur,
        calltype: 'Incoming',
        from: `55590${String(aIdx).padStart(2, '0')}${String(i).padStart(2, '0')}`,
        to: agent.ext
      });
    }
  });

  // Additional background morning inbound calls to populate traffic peaks (8h: 200, 9h: 450, 10h: 800, 11h: 950, 12h: 820, 13h: 900)
  const extraMorningAgents = ['4012', '4055', '4023', '4088', '4005', '3810', '3812', '3845'];
  for (let h = 8; h <= 13; h++) {
    const multiplier = h === 11 ? 40 : (h === 10 || h === 13 ? 35 : (h === 9 || h === 12 ? 25 : 15));
    for (let j = 0; j < multiplier; j++) {
      const ext = extraMorningAgents[j % extraMorningAgents.length];
      const m = Math.floor((j / multiplier) * 58);
      const dur = 40 + Math.floor(Math.random() * 240);
      dataset.push({
        date_time: formatDateTime(baseDate, h, m, j % 60),
        duration: dur,
        calltype: 'Incoming',
        from: `55577${String(h)}${String(j).padStart(2, '0')}`,
        to: ext
      });
    }
  }

  // 3. AFTERNOON SHIFT AGENTS (14:00 - 20:00)
  const afternoonAgents = [
    { ext: '4105', outCalls: 18, inCalls: 25, deadGap: 18 },
    { ext: '4122', outCalls: 16, inCalls: 22, deadGap: 15 },
    { ext: '4101', outCalls: 15, inCalls: 20, deadGap: 12 },
    { ext: '4205', outCalls: 14, inCalls: 18, deadGap: 10 },
    { ext: '4188', outCalls: 12, inCalls: 16, deadGap: 8 },
    { ext: '4102', outCalls: 10, inCalls: 32, deadGap: 6 },
    { ext: '4115', outCalls: 11, inCalls: 28, deadGap: 7 },
    { ext: '4144', outCalls: 9, inCalls: 26, deadGap: 6 }
  ];

  afternoonAgents.forEach((agent, aIdx) => {
    // Outbound calls for afternoon
    for (let i = 0; i < agent.outCalls; i++) {
      const h = 14 + Math.floor((i / agent.outCalls) * 6);
      const m = (i * 14 + aIdx * 5) % 60;
      const dur = 90 + Math.floor(Math.random() * 210);

      dataset.push({
        date_time: formatDateTime(baseDate, h, m, (i * 17) % 60),
        duration: dur,
        calltype: 'Outgoing',
        from: agent.ext,
        to: `55588${String(aIdx)}${String(i).padStart(2, '0')}`
      });
    }

    // Inbound calls for afternoon
    for (let i = 0; i < agent.inCalls; i++) {
      const h = 14 + Math.floor((i / agent.inCalls) * 6);
      const m = (i * 9 + aIdx * 7) % 60;
      const isShort = i < 3;
      const dur = isShort ? 15 + Math.floor(Math.random() * 12) : 180 + Math.floor(Math.random() * 160);

      dataset.push({
        date_time: formatDateTime(baseDate, h, m, (i * 23) % 60),
        duration: dur,
        calltype: 'Incoming',
        from: `55544${String(aIdx)}${String(i).padStart(2, '0')}`,
        to: agent.ext
      });
    }
  });

  return dataset;
}

/**
 * Generates sample data matching Campaign 2 ("Fecha", "Hora", "Origen", "Destino", "Duración", "Tipo", "File")
 */
export function generateCampaign2CDRDataset(): RawCDRRow[] {
  return [
    {
      Fecha: "18 Aug 2026",
      Hora: "10:06:04",
      Origen: "5005",
      Destino: "987589936",
      "Duración": "00:00:18",
      Tipo: "Saliente",
      File: "out-987589936-5005-20260818-100604-1787069164.135918.wav"
    },
    {
      Fecha: "18 Aug 2026",
      Hora: "10:05:41",
      Origen: "3011",
      Destino: "978348106",
      "Duración": "00:00:26",
      Tipo: "Saliente",
      File: "out-978348106-3011-20260818-100541-1787069141.135915.wav"
    },
    {
      Fecha: "18 Aug 2026",
      Hora: "10:05:22",
      Origen: "3001",
      Destino: "976361886",
      "Duración": "00:00:29",
      Tipo: "Saliente",
      File: "out-976361886-3001-20260818-100522-1787069122.135911.wav"
    },
    {
      Fecha: "18 Aug 2026",
      Hora: "10:05:09",
      Origen: "3001",
      Destino: "976892128",
      "Duración": "00:00:06",
      Tipo: "Saliente",
      File: "out-976892128-3001-20260818-100509-1787069109.135909.wav"
    },
    {
      Fecha: "18 Aug 2026",
      Hora: "10:04:27",
      Origen: "5001",
      Destino: "987622451",
      "Duración": "00:01:40",
      Tipo: "Saliente",
      File: "out-987622451-5001-20260818-100427-1787069067.135904.wav"
    },
    {
      Fecha: "18 Aug 2026",
      Hora: "10:04:18",
      Origen: "3002",
      Destino: "981898322",
      "Duración": "00:00:27",
      Tipo: "Saliente",
      File: "out-981898322-3002-20260818-100418-1787069058.135902.wav"
    },
    {
      Fecha: "18 Aug 2026",
      Hora: "10:04:08",
      Origen: "3011",
      Destino: "984769313",
      "Duración": "00:01:03",
      Tipo: "Saliente",
      File: "out-984769313-3011-20260818-100408-1787069048.135900.wav"
    },
    {
      Fecha: "18 Aug 2026",
      Hora: "10:03:51",
      Origen: "5016",
      Destino: "987880327",
      "Duración": "00:00:09",
      Tipo: "Saliente",
      File: "out-987880327-5016-20260818-100351-1787069031.135897.wav"
    },
    {
      Fecha: "18 Aug 2026",
      Hora: "10:03:43",
      Origen: "5004",
      Destino: "986502874",
      "Duración": "00:01:46",
      Tipo: "Saliente",
      File: "out-986502874-5004-20260818-100343-1787069023.135895.wav"
    },
    {
      Fecha: "18 Aug 2026",
      Hora: "10:03:37",
      Origen: "5016",
      Destino: "987880327",
      "Duración": "00:00:09",
      Tipo: "Saliente",
      File: "out-987880327-5016-20260818-100337-1787069017.135893.wav"
    },
    {
      Fecha: "18 Aug 2026",
      Hora: "10:03:19",
      Origen: "5007",
      Destino: "987880327",
      "Duración": "00:00:23",
      Tipo: "Saliente",
      File: "out-987880327-5007-20260818-100319-1787068999.135891.wav"
    },
    {
      Fecha: "18 Aug 2026",
      Hora: "10:02:40",
      Origen: "3006",
      Destino: "978348106",
      "Duración": "00:00:46",
      Tipo: "Saliente",
      File: "out-978348106-3006-20260818-100240-1787068960.135887.wav"
    },
    {
      Fecha: "18 Aug 2026",
      Hora: "10:02:18",
      Origen: "5007",
      Destino: "987880327",
      "Duración": "00:00:19",
      Tipo: "Saliente",
      File: "out-987880327-5007-20260818-100218-1787068938.135884.wav"
    },
    {
      Fecha: "18 Aug 2026",
      Hora: "10:01:21",
      Origen: "5010",
      Destino: "987880327",
      "Duración": "00:00:08",
      Tipo: "Saliente",
      File: "out-987880327-5010-20260818-100121-1787068881.135878.wav"
    },
    {
      Fecha: "18 Aug 2026",
      Hora: "10:00:47",
      Origen: "5006",
      Destino: "976361886",
      "Duración": "00:00:27",
      Tipo: "Saliente",
      File: "out-976361886-5006-20260818-100047-1787068847.135874.wav"
    },
    {
      Fecha: "18 Aug 2026",
      Hora: "10:00:10",
      Origen: "5015",
      Destino: "987880327",
      "Duración": "00:00:23",
      Tipo: "Saliente",
      File: "out-987880327-5015-20260818-100010-1787068810.135872.wav"
    },
    {
      Fecha: "18 Aug 2026",
      Hora: "09:59:58",
      Origen: "5003",
      Destino: "978348106",
      "Duración": "00:00:41",
      Tipo: "Saliente",
      File: "out-978348106-5003-20260818-095958-1787068798.135868.wav"
    },
    {
      Fecha: "18 Aug 2026",
      Hora: "09:58:39",
      Origen: "5009",
      Destino: "987880327",
      "Duración": "00:00:16",
      Tipo: "Saliente",
      File: "out-987880327-5009-20260818-095839-1787068719.135861.wav"
    },
    {
      Fecha: "18 Aug 2026",
      Hora: "09:57:37",
      Origen: "3012",
      Destino: "987880327",
      "Duración": "00:00:14",
      Tipo: "Saliente",
      File: "out-987880327-3012-20260818-095737-1787068657.135857.wav"
    },
    {
      Fecha: "18 Aug 2026",
      Hora: "09:56:56",
      Origen: "3004",
      Destino: "987880327",
      "Duración": "00:00:23",
      Tipo: "Saliente",
      File: "out-987880327-3004-20260818-095656-1787068616.135853.wav"
    },
    {
      Fecha: "18 Aug 2026",
      Hora: "09:55:04",
      Origen: "5510",
      Destino: "987880327",
      "Duración": "00:00:15",
      Tipo: "Saliente",
      File: "out-987880327-5510-20260818-095504-1787068504.135848.wav"
    },
    {
      Fecha: "18 Aug 2026",
      Hora: "09:54:39",
      Origen: "5002",
      Destino: "987880327",
      "Duración": "00:00:18",
      Tipo: "Saliente",
      File: "out-987880327-5002-20260818-095439-1787068479.135845.wav"
    },
    {
      Fecha: "18 Aug 2026",
      Hora: "09:53:23",
      Origen: "5013",
      Destino: "987880327",
      "Duración": "00:00:13",
      Tipo: "Saliente",
      File: "out-987880327-5013-20260818-095323-1787068403.135840.wav"
    },
    {
      Fecha: "18 Aug 2026",
      Hora: "09:52:43",
      Origen: "5011",
      Destino: "987880327",
      "Duración": "00:00:12",
      Tipo: "Saliente",
      File: "out-987880327-5011-20260818-095243-1787068363.135836.wav"
    },
    {
      Fecha: "17 Aug 2026",
      Hora: "17:52:54",
      Origen: "5007",
      Destino: "978348106",
      "Duración": "00:00:23",
      Tipo: "Saliente",
      File: "out-978348106-5007-20260817-175254-1787010774.135687.wav"
    },
    {
      Fecha: "17 Aug 2026",
      Hora: "17:50:35",
      Origen: "5006",
      Destino: "987622451",
      "Duración": "00:00:30",
      Tipo: "Saliente",
      File: "out-987622451-5006-20260817-175035-1787010635.135683.wav"
    },
    {
      Fecha: "17 Aug 2026",
      Hora: "17:47:04",
      Origen: "5016",
      Destino: "986502874",
      "Duración": "00:01:21",
      Tipo: "Saliente",
      File: "out-986502874-5016-20260817-174704-1787010424.135678.wav"
    },
    {
      Fecha: "17 Aug 2026",
      Hora: "17:34:04",
      Origen: "5004",
      Destino: "987880327",
      "Duración": "00:00:15",
      Tipo: "Saliente",
      File: "out-987880327-5004-20260817-173404-1787009644.135659.wav"
    },
    {
      Fecha: "15 Aug 2026",
      Hora: "13:54:05",
      Origen: "5002",
      Destino: "987589936",
      "Duración": "00:00:27",
      Tipo: "Saliente",
      File: "out-987589936-5002-20260815-135405-1786823645.133068.wav"
    },
    {
      Fecha: "15 Aug 2026",
      Hora: "13:48:47",
      Origen: "3006",
      Destino: "987880327",
      "Duración": "00:00:20",
      Tipo: "Saliente",
      File: "out-987880327-3006-20260815-134847-1786823327.133062.wav"
    },
    {
      Fecha: "14 Aug 2026",
      Hora: "17:45:44",
      Origen: "5016",
      Destino: "981898322",
      "Duración": "00:01:06",
      Tipo: "Saliente",
      File: "out-981898322-5016-20260814-174544-1786751144.132800.wav"
    },
    {
      Fecha: "14 Aug 2026",
      Hora: "17:44:27",
      Origen: "3011",
      Destino: "987622451",
      "Duración": "00:00:32",
      Tipo: "Saliente",
      File: "out-987622451-3011-20260814-174427-1786751067.132798.wav"
    },
    {
      Fecha: "14 Aug 2026",
      Hora: "17:42:01",
      Origen: "3001",
      Destino: "984769313",
      "Duración": "00:02:15",
      Tipo: "Saliente",
      File: "out-984769313-3001-20260814-174201-1786750921.132793.wav"
    },
    {
      Fecha: "14 Aug 2026",
      Hora: "08:16:43",
      Origen: "5005",
      Destino: "978348106",
      "Duración": "00:00:21",
      Tipo: "Saliente",
      File: "out-978348106-5005-20260814-081643-1786717003.131976.wav"
    }
  ];
}
