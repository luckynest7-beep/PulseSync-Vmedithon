import { Reading, Profile, AiInsight } from './types';
import { computeFlag } from './thresholds';

export const INITIAL_PROFILE: Profile = {
  userId: 'usr_vmed_2026',
  displayName: 'Dheeraj Kumar',
  age: 48,
  gender: 'Male',
  medicalId: 'VMED-8829-HYP',
  glucoseUnit: 'mg/dL',
  reminderTime: '20:00',
};

// Generate timestamps relative to today
const now = new Date();
const getPastDate = (daysAgo: number, hours: number, minutes: number = 0): string => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

export const INITIAL_READINGS: Reading[] = [
  // Today (Day 0) - Evening BP (Consecutive High #2 -> triggers F8 Med Nudge)
  {
    id: 'rd_001',
    userId: 'usr_vmed_2026',
    type: 'bp',
    systolic: 148,
    diastolic: 94,
    pulse: 82,
    source: 'camera',
    flag: computeFlag('bp', { systolic: 148, diastolic: 94 }),
    takenAt: getPastDate(0, 18, 30),
    createdAt: getPastDate(0, 18, 32),
    notes: 'Taken after evening walk, felt slight headache',
  },
  // Today (Day 0) - Morning BP (Consecutive High #1)
  {
    id: 'rd_002',
    userId: 'usr_vmed_2026',
    type: 'bp',
    systolic: 142,
    diastolic: 91,
    pulse: 76,
    source: 'camera',
    flag: computeFlag('bp', { systolic: 142, diastolic: 91 }),
    takenAt: getPastDate(0, 8, 15),
    createdAt: getPastDate(0, 8, 16),
    notes: 'Morning routine before breakfast',
  },
  // Today (Day 0) - Morning Fasting Glucose
  {
    id: 'rd_003',
    userId: 'usr_vmed_2026',
    type: 'glucose',
    glucose: 124,
    source: 'voice',
    flag: computeFlag('glucose', { glucose: 124 }),
    takenAt: getPastDate(0, 7, 45),
    createdAt: getPastDate(0, 7, 46),
    notes: 'Fasting 10 hrs',
  },

  // Yesterday (Day 1) - Post-dinner Glucose
  {
    id: 'rd_004',
    userId: 'usr_vmed_2026',
    type: 'glucose',
    glucose: 195,
    source: 'camera',
    flag: computeFlag('glucose', { glucose: 195 }), // High (>180)
    takenAt: getPastDate(1, 21, 10),
    createdAt: getPastDate(1, 21, 12),
    notes: '2 hrs post dinner (rice & lentils)',
  },
  // Yesterday (Day 1) - Morning BP (Normal)
  {
    id: 'rd_005',
    userId: 'usr_vmed_2026',
    type: 'bp',
    systolic: 132,
    diastolic: 84,
    pulse: 72,
    source: 'camera',
    flag: computeFlag('bp', { systolic: 132, diastolic: 84 }),
    takenAt: getPastDate(1, 8, 0),
    createdAt: getPastDate(1, 8, 2),
    notes: 'Calm morning reading',
  },

  // 2 Days Ago (Day 2)
  {
    id: 'rd_006',
    userId: 'usr_vmed_2026',
    type: 'glucose',
    glucose: 110,
    source: 'voice',
    flag: computeFlag('glucose', { glucose: 110 }),
    takenAt: getPastDate(2, 12, 30),
    createdAt: getPastDate(2, 12, 31),
    notes: 'Pre-lunch check',
  },
  {
    id: 'rd_007',
    userId: 'usr_vmed_2026',
    type: 'bp',
    systolic: 128,
    diastolic: 82,
    pulse: 70,
    source: 'manual',
    flag: computeFlag('bp', { systolic: 128, diastolic: 82 }),
    takenAt: getPastDate(2, 8, 20),
    createdAt: getPastDate(2, 8, 21),
  },

  // 3 Days Ago (Day 3) - Low Glucose Episode
  {
    id: 'rd_008',
    userId: 'usr_vmed_2026',
    type: 'glucose',
    glucose: 64,
    source: 'camera',
    flag: computeFlag('glucose', { glucose: 64 }), // Low (<70)
    takenAt: getPastDate(3, 16, 45),
    createdAt: getPastDate(3, 16, 47),
    notes: 'Felt slight dizziness before afternoon snack. Had orange juice.',
  },
  {
    id: 'rd_009',
    userId: 'usr_vmed_2026',
    type: 'bp',
    systolic: 130,
    diastolic: 85,
    pulse: 74,
    source: 'camera',
    flag: computeFlag('bp', { systolic: 130, diastolic: 85 }),
    takenAt: getPastDate(3, 8, 10),
    createdAt: getPastDate(3, 8, 12),
  },

  // 4 Days Ago (Day 4)
  {
    id: 'rd_010',
    userId: 'usr_vmed_2026',
    type: 'glucose',
    glucose: 135,
    source: 'manual',
    flag: computeFlag('glucose', { glucose: 135 }),
    takenAt: getPastDate(4, 20, 0),
    createdAt: getPastDate(4, 20, 2),
  },
  {
    id: 'rd_011',
    userId: 'usr_vmed_2026',
    type: 'bp',
    systolic: 126,
    diastolic: 80,
    pulse: 68,
    source: 'camera',
    flag: computeFlag('bp', { systolic: 126, diastolic: 80 }),
    takenAt: getPastDate(4, 7, 50),
    createdAt: getPastDate(4, 7, 52),
  },

  // 5 Days Ago (Day 5)
  {
    id: 'rd_012',
    userId: 'usr_vmed_2026',
    type: 'bp',
    systolic: 134,
    diastolic: 86,
    pulse: 78,
    source: 'camera',
    flag: computeFlag('bp', { systolic: 134, diastolic: 86 }),
    takenAt: getPastDate(5, 19, 15),
    createdAt: getPastDate(5, 19, 16),
  },
  {
    id: 'rd_013',
    userId: 'usr_vmed_2026',
    type: 'glucose',
    glucose: 118,
    source: 'voice',
    flag: computeFlag('glucose', { glucose: 118 }),
    takenAt: getPastDate(5, 8, 10),
    createdAt: getPastDate(5, 8, 11),
  },

  // 7 Days Ago (Day 7)
  {
    id: 'rd_014',
    userId: 'usr_vmed_2026',
    type: 'bp',
    systolic: 124,
    diastolic: 78,
    pulse: 69,
    source: 'camera',
    flag: computeFlag('bp', { systolic: 124, diastolic: 78 }),
    takenAt: getPastDate(7, 8, 30),
    createdAt: getPastDate(7, 8, 31),
  },
  {
    id: 'rd_015',
    userId: 'usr_vmed_2026',
    type: 'glucose',
    glucose: 105,
    source: 'camera',
    flag: computeFlag('glucose', { glucose: 105 }),
    takenAt: getPastDate(7, 8, 0),
    createdAt: getPastDate(7, 8, 1),
  },

  // 10 Days Ago (Day 10)
  {
    id: 'rd_016',
    userId: 'usr_vmed_2026',
    type: 'bp',
    systolic: 138,
    diastolic: 88,
    pulse: 75,
    source: 'camera',
    flag: computeFlag('bp', { systolic: 138, diastolic: 88 }),
    takenAt: getPastDate(10, 8, 15),
    createdAt: getPastDate(10, 8, 17),
  },
  {
    id: 'rd_017',
    userId: 'usr_vmed_2026',
    type: 'glucose',
    glucose: 142,
    source: 'manual',
    flag: computeFlag('glucose', { glucose: 142 }),
    takenAt: getPastDate(10, 19, 45),
    createdAt: getPastDate(10, 19, 46),
  },

  // 13 Days Ago (Day 13)
  {
    id: 'rd_018',
    userId: 'usr_vmed_2026',
    type: 'bp',
    systolic: 125,
    diastolic: 80,
    pulse: 71,
    source: 'camera',
    flag: computeFlag('bp', { systolic: 125, diastolic: 80 }),
    takenAt: getPastDate(13, 8, 0),
    createdAt: getPastDate(13, 8, 1),
  },
  {
    id: 'rd_019',
    userId: 'usr_vmed_2026',
    type: 'glucose',
    glucose: 112,
    source: 'voice',
    flag: computeFlag('glucose', { glucose: 112 }),
    takenAt: getPastDate(13, 8, 10),
    createdAt: getPastDate(13, 8, 11),
  },
];

export const INITIAL_AI_INSIGHT: AiInsight = {
  id: 'ins_init_001',
  text: 'Your blood pressure has trended upward over the last 48 hours, with recent readings averaging 145/92 mmHg compared to your 14-day baseline of 131/83 mmHg. Glucose values remain predominantly stable (avg 121 mg/dL) aside from a single post-prandial spike.',
  direction: 'rising',
  generatedAt: new Date().toISOString(),
  disclaimer: 'Not medical advice — discuss trend changes and medication adherence with your doctor.',
};
