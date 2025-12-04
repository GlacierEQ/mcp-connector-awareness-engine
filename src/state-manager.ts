/**
 * State Manager
 * Persists and retrieves calibration and health data
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { CalibrationState, HealthStatus } from './types';

export class StateManager {
  private calibrationPath: string;
  private healthPath: string;
  private yamlExportPath: string;

  constructor() {
    this.calibrationPath = path.join(process.cwd(), 'data', 'calibration.json');
    this.healthPath = path.join(process.cwd(), 'data', 'health.json');
    this.yamlExportPath = path.join(process.cwd(), 'calibration-state.yaml');
  }

  /**
   * Save calibration state
   */
  async save(state: CalibrationState): Promise<void> {
    try {
      // Ensure data directory exists
      await fs.mkdir(path.dirname(this.calibrationPath), { recursive: true });

      // Save JSON
      await fs.writeFile(
        this.calibrationPath,
        JSON.stringify(state, null, 2),
        'utf-8'
      );

      // Export YAML
      await this.exportYAML(state);

      console.log('✅ Calibration state saved');
    } catch (error) {
      console.error('❌ Failed to save calibration state:', error);
      throw error;
    }
  }

  /**
   * Load calibration state
   */
  async load(): Promise<CalibrationState | null> {
    try {
      const data = await fs.readFile(this.calibrationPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('⚠️  No calibration state found');
        return null;
      }
      console.error('❌ Failed to load calibration state:', error);
      throw error;
    }
  }

  /**
   * Export calibration state as YAML
   */
  private async exportYAML(state: CalibrationState): Promise<void> {
    try {
      const yamlContent = yaml.dump(state, {
        indent: 2,
        lineWidth: 120,
        noRefs: true
      });

      await fs.writeFile(this.yamlExportPath, yamlContent, 'utf-8');
      console.log('✅ YAML export created');
    } catch (error) {
      console.error('❌ Failed to export YAML:', error);
    }
  }

  /**
   * Save health status
   */
  async saveHealth(health: HealthStatus): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.healthPath), { recursive: true });

      await fs.writeFile(
        this.healthPath,
        JSON.stringify(health, null, 2),
        'utf-8'
      );

      console.log('✅ Health status saved');
    } catch (error) {
      console.error('❌ Failed to save health status:', error);
      throw error;
    }
  }

  /**
   * Load health status
   */
  async loadHealth(): Promise<HealthStatus | null> {
    try {
      const data = await fs.readFile(this.healthPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      console.error('❌ Failed to load health status:', error);
      throw error;
    }
  }

  /**
   * Get calibration age in hours
   */
  async getCalibrationAge(): Promise<number | null> {
    const state = await this.load();
    if (!state) return null;

    const timestamp = new Date(state.timestamp);
    const now = new Date();
    const ageMs = now.getTime() - timestamp.getTime();
    return ageMs / (1000 * 60 * 60);
  }

  /**
   * Check if recalibration is needed
   */
  async needsRecalibration(maxAgeHours: number = 24): Promise<boolean> {
    const age = await this.getCalibrationAge();
    if (age === null) return true;
    return age > maxAgeHours;
  }
}
