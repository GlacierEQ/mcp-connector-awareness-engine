/**
 * Type definitions for MCP Connector Awareness Engine
 */

export interface CalibrationState {
  timestamp: string;
  connectors: {
    asana?: ConnectorStatus;
    linear?: ConnectorStatus;
    github?: ConnectorStatus;
    notion?: ConnectorStatus;
  };
}

export interface ConnectorStatus {
  status: 'authenticated' | 'failed' | 'pending';
  user?: any;
  workspace?: any;
  team?: any;
  stats?: any;
  bot?: any;
  error?: string;
  last_verified: string;
}

export interface ToolCall {
  tool: string;
  params: any;
}

export interface EnforcementResult {
  original: ToolCall;
  enhanced: ToolCall;
  modifications: string[];
  enforce_pagination?: boolean;
  chain_operations?: ToolCall[];
}

export interface HealthStatus {
  timestamp: string;
  overall: 'healthy' | 'degraded' | 'warning';
  connectors: {
    asana?: ConnectorHealth;
    linear?: ConnectorHealth;
    github?: ConnectorHealth;
    notion?: ConnectorHealth;
  };
}

export interface ConnectorHealth {
  status: 'healthy' | 'failed' | 'warning';
  latency_ms: number;
  last_check: string;
  error?: string;
}

export interface AwarenessConfig {
  connectors: string[];
  calibration: CalibrationConfig;
  enforcement: EnforcementConfig;
  health: HealthConfig;
  storage: StorageConfig;
}

export interface CalibrationConfig {
  auto_run_on_start: boolean;
  verify_interval_hours: number;
  cache_ttl_hours: number;
}

export interface EnforcementConfig {
  require_pagination_completion: boolean;
  auto_resolve_ids: boolean;
  max_chain_depth: number;
  retry_failed_calls: boolean;
}

export interface HealthConfig {
  check_interval_minutes: number;
  alert_on_failure: boolean;
  create_linear_issues: boolean;
}

export interface StorageConfig {
  database: string;
  yaml_export: string;
  memory_plugin_sync: boolean;
  notion_dashboard_sync: boolean;
}
