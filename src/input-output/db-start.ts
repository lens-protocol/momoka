import { Level } from 'level';
import { getDb, setDb } from './db';
import { failedProofsPath, lensDAPath, pathResolver } from './paths';

/**
 * Starts the LevelDB database. - in a different folder due to browser and node support
 */
export const startDb = async (): Promise<void> => {
  if (getDb()) return;

  const path = await pathResolver();

  const lens__da = await lensDAPath();

  const fs = await import('fs');

  if (!fs.existsSync(lens__da)) {
    fs.mkdirSync(lens__da);
  }

  const failedProofs = await failedProofsPath();

  if (!fs.existsSync(failedProofs)) {
    fs.mkdirSync(failedProofs);
  }

  const dbPath = path.join(lens__da, 'database');

  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath);
  }

  setDb(new Level(dbPath));
};
