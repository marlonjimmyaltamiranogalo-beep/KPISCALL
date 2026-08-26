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

