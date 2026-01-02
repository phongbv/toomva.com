#!/usr/bin/env node

/**
 * Script to sync Prisma migrations to D1-compatible format
 * Converts Prisma migration folder structure to flat D1 migrations
 */

const fs = require('fs');
const path = require('path');

const PRISMA_MIGRATIONS_DIR = path.join(__dirname, '..', 'prisma', 'migrations');
const D1_MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

function syncMigrations() {
  console.log('🔄 Syncing Prisma migrations to D1 format...\n');

  // Ensure D1 migrations directory exists
  if (!fs.existsSync(D1_MIGRATIONS_DIR)) {
    fs.mkdirSync(D1_MIGRATIONS_DIR, { recursive: true });
  }

  // Read Prisma migrations directory
  if (!fs.existsSync(PRISMA_MIGRATIONS_DIR)) {
    console.error('❌ Prisma migrations directory not found!');
    process.exit(1);
  }

  const migrations = fs.readdirSync(PRISMA_MIGRATIONS_DIR)
    .filter(dir => dir !== 'migration_lock.toml')
    .sort();

  if (migrations.length === 0) {
    console.log('⚠️  No Prisma migrations found');
    return;
  }

  console.log(`Found ${migrations.length} Prisma migration(s):\n`);

  migrations.forEach((migrationDir, index) => {
    const migrationPath = path.join(PRISMA_MIGRATIONS_DIR, migrationDir, 'migration.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.log(`⚠️  Skipping ${migrationDir} (no migration.sql found)`);
      return;
    }

    // Extract migration name from folder (format: YYYYMMDDHHMMSS_name)
    const parts = migrationDir.split('_');
    const name = parts.slice(1).join('_') || 'migration';
    
    // Create D1 migration filename (format: 0001_name.sql)
    const d1MigrationNumber = String(index + 1).padStart(4, '0');
    const d1MigrationName = `${d1MigrationNumber}_${name}.sql`;
    const d1MigrationPath = path.join(D1_MIGRATIONS_DIR, d1MigrationName);

    // Copy migration content
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    fs.writeFileSync(d1MigrationPath, migrationSQL);

    console.log(`✅ ${migrationDir} → ${d1MigrationName}`);
  });

  console.log(`\n✨ Successfully synced ${migrations.length} migration(s) to D1 format`);
  console.log(`📁 D1 migrations location: ${D1_MIGRATIONS_DIR}\n`);
  console.log('Next steps:');
  console.log('  1. Review migrations in the "migrations" folder');
  console.log('  2. Run: npm run d1:migrate');
}

try {
  syncMigrations();
} catch (error) {
  console.error('❌ Error syncing migrations:', error.message);
  process.exit(1);
}
