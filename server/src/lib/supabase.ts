import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Reading } from './types.js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const client: SupabaseClient | null = url && serviceKey ? createClient(url, serviceKey) : null;

export const isSupabaseConfigured = () => client !== null;

// In-memory fallback so the API works with zero cloud setup during a demo.
const memoryStore: Reading[] = [];

function toRow(r: Reading) {
  return {
    id: r.id,
    user_id: r.userId,
    type: r.type,
    systolic: r.systolic ?? null,
    diastolic: r.diastolic ?? null,
    pulse: r.pulse ?? null,
    glucose: r.glucose ?? null,
    source: r.source,
    flag: r.flag,
    taken_at: r.takenAt,
    created_at: r.createdAt,
    notes: r.notes ?? null,
  };
}

function fromRow(row: any): Reading {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    systolic: row.systolic,
    diastolic: row.diastolic,
    pulse: row.pulse,
    glucose: row.glucose,
    source: row.source,
    flag: row.flag,
    takenAt: row.taken_at,
    createdAt: row.created_at,
    notes: row.notes,
  };
}

export async function listReadings(userId: string): Promise<Reading[]> {
  if (!client) {
    return memoryStore.filter((r) => r.userId === userId);
  }
  const { data, error } = await client
    .from('readings')
    .select('*')
    .eq('user_id', userId)
    .order('taken_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function addReading(reading: Reading): Promise<Reading> {
  if (!client) {
    memoryStore.unshift(reading);
    return reading;
  }
  const { data, error } = await client.from('readings').insert(toRow(reading)).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function deleteReading(userId: string, id: string): Promise<void> {
  if (!client) {
    const idx = memoryStore.findIndex((r) => r.id === id && r.userId === userId);
    if (idx >= 0) memoryStore.splice(idx, 1);
    return;
  }
  const { error } = await client.from('readings').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
}
