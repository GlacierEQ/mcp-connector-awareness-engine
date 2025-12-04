/**
 * MCP Connector Calibrator
 * Auto-discovers and maps user identity across all MCP platforms
 */

import { AsanaClient } from './connectors/asana';
import { LinearClient } from './connectors/linear';
import { GitHubClient } from './connectors/github';
import { NotionClient } from './connectors/notion';
import { CalibrationState, ConnectorStatus } from './types';
import { StateManager } from './state-manager';

export class MCPCalibrator {
  private asana: AsanaClient;
  private linear: LinearClient;
  private github: GitHubClient;
  private notion: NotionClient;
  private stateManager: StateManager;

  constructor() {
    this.asana = new AsanaClient();
    this.linear = new LinearClient();
    this.github = new GitHubClient();
    this.notion = new NotionClient();
    this.stateManager = new StateManager();
  }

  /**
   * Run full calibration across all connectors
   */
  async calibrate(): Promise<CalibrationState> {
    console.log('🔍 Starting MCP Connector Calibration...');

    const state: CalibrationState = {
      timestamp: new Date().toISOString(),
      connectors: {}
    };

    // Calibrate each connector in parallel
    const [asanaState, linearState, githubState, notionState] = await Promise.all([
      this.calibrateAsana(),
      this.calibrateLinear(),
      this.calibrateGitHub(),
      this.calibrateNotion()
    ]);

    state.connectors.asana = asanaState;
    state.connectors.linear = linearState;
    state.connectors.github = githubState;
    state.connectors.notion = notionState;

    // Persist calibration state
    await this.stateManager.save(state);

    console.log('✅ Calibration Complete');
    return state;
  }

  /**
   * Calibrate Asana connector
   */
  private async calibrateAsana(): Promise<ConnectorStatus> {
    try {
      console.log('  📋 Calibrating Asana...');
      
      const user = await this.asana.getCurrentUser();
      const workspaces = await this.asana.listWorkspaces();

      return {
        status: 'authenticated',
        user: {
          name: user.name,
          email: user.email,
          gid: user.gid
        },
        workspace: workspaces[0] ? {
          name: workspaces[0].name,
          gid: workspaces[0].gid,
          is_organization: workspaces[0].is_organization
        } : null,
        last_verified: new Date().toISOString()
      };
    } catch (error) {
      console.error('  ❌ Asana calibration failed:', error);
      return {
        status: 'failed',
        error: error.message,
        last_verified: new Date().toISOString()
      };
    }
  }

  /**
   * Calibrate Linear connector
   */
  private async calibrateLinear(): Promise<ConnectorStatus> {
    try {
      console.log('  📐 Calibrating Linear...');
      
      const user = await this.linear.getCurrentUser();
      const teams = await this.linear.getTeams();

      return {
        status: 'authenticated',
        user: {
          name: user.name,
          email: user.email,
          id: user.id,
          admin: user.admin
        },
        team: teams[0] ? {
          name: teams[0].name,
          key: teams[0].key,
          id: teams[0].id
        } : null,
        last_verified: new Date().toISOString()
      };
    } catch (error) {
      console.error('  ❌ Linear calibration failed:', error);
      return {
        status: 'failed',
        error: error.message,
        last_verified: new Date().toISOString()
      };
    }
  }

  /**
   * Calibrate GitHub connector
   */
  private async calibrateGitHub(): Promise<ConnectorStatus> {
    try {
      console.log('  🐙 Calibrating GitHub...');
      
      const user = await this.github.getAuthenticatedUser();
      const repos = await this.github.listRepositories();

      return {
        status: 'authenticated',
        user: {
          login: user.login,
          email: user.email,
          id: user.id,
          repos: user.public_repos + user.total_private_repos
        },
        stats: {
          public_repos: user.public_repos,
          private_repos: user.total_private_repos
        },
        last_verified: new Date().toISOString()
      };
    } catch (error) {
      console.error('  ❌ GitHub calibration failed:', error);
      return {
        status: 'failed',
        error: error.message,
        last_verified: new Date().toISOString()
      };
    }
  }

  /**
   * Calibrate Notion connector
   */
  private async calibrateNotion(): Promise<ConnectorStatus> {
    try {
      console.log('  📓 Calibrating Notion...');
      
      const bot = await this.notion.getBotUser();
      const workspace = bot.bot.workspace_name;
      const workspaceId = bot.bot.workspace_id;

      return {
        status: 'authenticated',
        workspace: {
          name: workspace,
          id: workspaceId,
          owner: bot.bot.owner.user.person.email,
          plan: bot.bot.workspace_limits ? 'Plus+AI' : 'Basic'
        },
        bot: {
          id: bot.id,
          name: bot.name
        },
        last_verified: new Date().toISOString()
      };
    } catch (error) {
      console.error('  ❌ Notion calibration failed:', error);
      return {
        status: 'failed',
        error: error.message,
        last_verified: new Date().toISOString()
      };
    }
  }

  /**
   * Verify existing calibration is still valid
   */
  async verify(): Promise<boolean> {
    console.log('🔍 Verifying calibration state...');
    
    const state = await this.stateManager.load();
    if (!state) {
      console.log('⚠️  No calibration state found');
      return false;
    }

    const verifications = await Promise.all([
      this.verifyAsana(),
      this.verifyLinear(),
      this.verifyGitHub(),
      this.verifyNotion()
    ]);

    const allValid = verifications.every(v => v);
    console.log(allValid ? '✅ All connectors verified' : '❌ Some connectors failed verification');
    
    return allValid;
  }

  private async verifyAsana(): Promise<boolean> {
    try {
      await this.asana.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  private async verifyLinear(): Promise<boolean> {
    try {
      await this.linear.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  private async verifyGitHub(): Promise<boolean> {
    try {
      await this.github.getAuthenticatedUser();
      return true;
    } catch {
      return false;
    }
  }

  private async verifyNotion(): Promise<boolean> {
    try {
      await this.notion.getBotUser();
      return true;
    } catch {
      return false;
    }
  }
}
