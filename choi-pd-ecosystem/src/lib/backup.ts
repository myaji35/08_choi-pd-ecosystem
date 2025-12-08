/**
 * Database Backup Utilities
 * Handles database backup and restore operations
 */

import { db } from './db';
import * as schema from './db/schema';
import fs from 'fs/promises';
import path from 'path';

export interface BackupMetadata {
  version: string;
  timestamp: string;
  tables: string[];
  recordCounts: Record<string, number>;
}

export interface BackupData {
  metadata: BackupMetadata;
  data: Record<string, any[]>;
}

/**
 * Create a full database backup
 */
export async function createBackup(): Promise<BackupData> {
  const tables = [
    { name: 'distributors', schema: schema.distributors },
    { name: 'distributor_activity_log', schema: schema.distributorActivityLog },
    { name: 'distributor_resources', schema: schema.distributorResources },
    { name: 'subscription_plans', schema: schema.subscriptionPlans },
    { name: 'payments', schema: schema.payments },
    { name: 'invoices', schema: schema.invoices },
    { name: 'sns_accounts', schema: schema.snsAccounts },
    { name: 'sns_scheduled_posts', schema: schema.snsScheduledPosts },
    { name: 'sns_post_history', schema: schema.snsPostHistory },
    { name: 'courses', schema: schema.courses },
    { name: 'posts', schema: schema.posts },
    { name: 'works', schema: schema.works },
    { name: 'inquiries', schema: schema.inquiries },
    { name: 'leads', schema: schema.leads },
    { name: 'admin_users', schema: schema.adminUsers },
    { name: 'settings', schema: schema.settings },
    { name: 'hero_images', schema: schema.heroImages },
  ];

  const data: Record<string, any[]> = {};
  const recordCounts: Record<string, number> = {};

  for (const table of tables) {
    try {
      const records = await db.select().from(table.schema).all();
      data[table.name] = records;
      recordCounts[table.name] = records.length;
    } catch (error) {
      console.error(`Failed to backup table ${table.name}:`, error);
      data[table.name] = [];
      recordCounts[table.name] = 0;
    }
  }

  const metadata: BackupMetadata = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    tables: tables.map(t => t.name),
    recordCounts,
  };

  return { metadata, data };
}

/**
 * Export backup to JSON file
 */
export async function exportBackupToFile(backup: BackupData, filename?: string): Promise<string> {
  const backupDir = path.join(process.cwd(), 'backups');

  try {
    await fs.mkdir(backupDir, { recursive: true });
  } catch (error) {
    // Directory already exists
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilename = filename || `backup-${timestamp}.json`;
  const filepath = path.join(backupDir, backupFilename);

  await fs.writeFile(filepath, JSON.stringify(backup, null, 2), 'utf-8');

  return filepath;
}

/**
 * Import backup from JSON file
 */
export async function importBackupFromFile(filepath: string): Promise<BackupData> {
  const content = await fs.readFile(filepath, 'utf-8');
  return JSON.parse(content);
}

/**
 * List all available backups
 */
export async function listBackups(): Promise<string[]> {
  const backupDir = path.join(process.cwd(), 'backups');

  try {
    const files = await fs.readdir(backupDir);
    return files.filter(f => f.endsWith('.json')).sort().reverse();
  } catch (error) {
    return [];
  }
}

/**
 * Delete old backups (keep only last N backups)
 */
export async function cleanupOldBackups(keepCount: number = 10): Promise<number> {
  const backups = await listBackups();

  if (backups.length <= keepCount) {
    return 0;
  }

  const backupDir = path.join(process.cwd(), 'backups');
  const toDelete = backups.slice(keepCount);

  let deletedCount = 0;
  for (const filename of toDelete) {
    try {
      await fs.unlink(path.join(backupDir, filename));
      deletedCount++;
    } catch (error) {
      console.error(`Failed to delete backup ${filename}:`, error);
    }
  }

  return deletedCount;
}

/**
 * Validate backup integrity
 */
export function validateBackup(backup: BackupData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!backup.metadata) {
    errors.push('Missing metadata');
  }

  if (!backup.data) {
    errors.push('Missing data');
  }

  if (!backup.metadata?.timestamp) {
    errors.push('Missing timestamp');
  }

  if (!backup.metadata?.tables || !Array.isArray(backup.metadata.tables)) {
    errors.push('Invalid tables list');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
