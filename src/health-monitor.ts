/**
 * MCP Health Monitor
 * Continuous verification of connector health and performance
 */

import { MCPCalibrator } from './calibrator';
import { StateManager } from './state-manager';
import { HealthStatus, ConnectorHealth } from './types';

export class HealthMonitor {
  private calibrator: MCPCalibrator;
  private stateManager: StateManager;
  private checkIntervalMs: number;
  private monitoringActive = false;

  constructor(checkIntervalMinutes: number = 30) {
    this.calibrator = new MCPCalibrator();
    this.stateManager = new StateManager();
    this.checkIntervalMs = checkIntervalMinutes * 60 * 1000;
  }

  /**
   * Start continuous health monitoring
   */
  start(): void {
    if (this.monitoringActive) {
      console.log('⚠️  Health monitoring already active');
      return;
    }

    console.log('🏥 Starting health monitoring...');
    this.monitoringActive = true;

    // Run initial check
    this.runHealthCheck();

    // Schedule periodic checks
    setInterval(() => {
      if (this.monitoringActive) {
        this.runHealthCheck();
      }
    }, this.checkIntervalMs);
  }

  /**
   * Stop health monitoring
   */
  stop(): void {
    console.log('🛑 Stopping health monitoring...');
    this.monitoringActive = false;
  }

  /**
   * Run comprehensive health check
   */
  private async runHealthCheck(): Promise<HealthStatus> {
    console.log('🔍 Running health check...');

    const timestamp = new Date().toISOString();
    const health: HealthStatus = {
      timestamp,
      overall: 'healthy',
      connectors: {}
    };

    // Check each connector
    const checks = await Promise.all([
      this.checkAsana(),
      this.checkLinear(),
      this.checkGitHub(),
      this.checkNotion()
    ]);

    health.connectors.asana = checks[0];
    health.connectors.linear = checks[1];
    health.connectors.github = checks[2];
    health.connectors.notion = checks[3];

    // Determine overall health
    const statuses = Object.values(health.connectors).map(c => c.status);
    if (statuses.every(s => s === 'healthy')) {
      health.overall = 'healthy';
    } else if (statuses.some(s => s === 'failed')) {
      health.overall = 'degraded';
    } else {
      health.overall = 'warning';
    }

    // Log results
    this.logHealthStatus(health);

    // Alert on failures
    if (health.overall !== 'healthy') {
      await this.alertOnFailure(health);
    }

    // Persist health status
    await this.stateManager.saveHealth(health);

    return health;
  }

  /**
   * Check Asana connector health
   */
  private async checkAsana(): Promise<ConnectorHealth> {
    const start = Date.now();
    try {
      const valid = await this.calibrator['verifyAsana']();
      const latency = Date.now() - start;

      return {
        status: valid ? 'healthy' : 'failed',
        latency_ms: latency,
        last_check: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'failed',
        latency_ms: Date.now() - start,
        last_check: new Date().toISOString(),
        error: error.message
      };
    }
  }

  /**
   * Check Linear connector health
   */
  private async checkLinear(): Promise<ConnectorHealth> {
    const start = Date.now();
    try {
      const valid = await this.calibrator['verifyLinear']();
      const latency = Date.now() - start;

      return {
        status: valid ? 'healthy' : 'failed',
        latency_ms: latency,
        last_check: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'failed',
        latency_ms: Date.now() - start,
        last_check: new Date().toISOString(),
        error: error.message
      };
    }
  }

  /**
   * Check GitHub connector health
   */
  private async checkGitHub(): Promise<ConnectorHealth> {
    const start = Date.now();
    try {
      const valid = await this.calibrator['verifyGitHub']();
      const latency = Date.now() - start;

      return {
        status: valid ? 'healthy' : 'failed',
        latency_ms: latency,
        last_check: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'failed',
        latency_ms: Date.now() - start,
        last_check: new Date().toISOString(),
        error: error.message
      };
    }
  }

  /**
   * Check Notion connector health
   */
  private async checkNotion(): Promise<ConnectorHealth> {
    const start = Date.now();
    try {
      const valid = await this.calibrator['verifyNotion']();
      const latency = Date.now() - start;

      return {
        status: valid ? 'healthy' : 'failed',
        latency_ms: latency,
        last_check: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'failed',
        latency_ms: Date.now() - start,
        last_check: new Date().toISOString(),
        error: error.message
      };
    }
  }

  /**
   * Log health status to console
   */
  private logHealthStatus(health: HealthStatus): void {
    const icon = health.overall === 'healthy' ? '✅' : health.overall === 'degraded' ? '⚠️' : '❌';
    console.log(`${icon} Overall Health: ${health.overall.toUpperCase()}`);
    
    Object.entries(health.connectors).forEach(([name, status]) => {
      const connectorIcon = status.status === 'healthy' ? '✅' : '❌';
      console.log(`  ${connectorIcon} ${name}: ${status.status} (${status.latency_ms}ms)`);
      if (status.error) {
        console.log(`    Error: ${status.error}`);
      }
    });
  }

  /**
   * Alert on connector failures
   */
  private async alertOnFailure(health: HealthStatus): Promise<void> {
    console.log('🚨 ALERT: Connector health degraded!');
    
    // This would integrate with Linear to create issues
    const failedConnectors = Object.entries(health.connectors)
      .filter(([_, status]) => status.status === 'failed')
      .map(([name]) => name);

    if (failedConnectors.length > 0) {
      console.log(`  Failed connectors: ${failedConnectors.join(', ')}`);
      // TODO: Create Linear issue for tracking
      // TODO: Send notification via configured channels
    }
  }

  /**
   * Get current health status
   */
  async getStatus(): Promise<HealthStatus | null> {
    return await this.stateManager.loadHealth();
  }
}
