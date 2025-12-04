/**
 * MCP Usage Enforcer
 * Intercepts and enhances tool calls to ensure proper MCP usage
 */

import { StateManager } from './state-manager';
import { ToolCall, EnforcementResult } from './types';

export class MCPEnforcer {
  private stateManager: StateManager;
  private maxPaginationAttempts = 100;
  private maxChainDepth = 5;

  constructor() {
    this.stateManager = new StateManager();
  }

  /**
   * Enforce proper tool call execution
   */
  async enforce(toolCall: ToolCall): Promise<EnforcementResult> {
    console.log(`🛡️  Enforcing tool call: ${toolCall.tool}`);

    // Load calibration state
    const state = await this.stateManager.load();

    // Apply enforcement rules
    const result: EnforcementResult = {
      original: toolCall,
      enhanced: { ...toolCall },
      modifications: []
    };

    // Rule 1: Auto-inject workspace/team IDs
    this.injectIdentifiers(result, state);

    // Rule 2: Resolve names to IDs if needed
    await this.resolveIdentifiers(result);

    // Rule 3: Enforce pagination completion
    if (this.requiresPagination(toolCall)) {
      result.enforce_pagination = true;
      result.modifications.push('Pagination enforcement enabled');
    }

    // Rule 4: Chain dependent operations
    if (this.requiresChaining(toolCall)) {
      result.chain_operations = await this.buildOperationChain(toolCall);
      result.modifications.push('Operation chaining configured');
    }

    return result;
  }

  /**
   * Auto-inject workspace/team identifiers from calibration state
   */
  private injectIdentifiers(result: EnforcementResult, state: any): void {
    const { tool, params } = result.enhanced;

    // Asana workspace injection
    if (tool.startsWith('asana') && !params.workspace && state?.connectors?.asana?.workspace) {
      result.enhanced.params.workspace = state.connectors.asana.workspace.gid;
      result.modifications.push('Injected Asana workspace ID');
    }

    // Linear team injection
    if (tool.startsWith('linear') && !params.teamId && state?.connectors?.linear?.team) {
      result.enhanced.params.teamId = state.connectors.linear.team.id;
      result.modifications.push('Injected Linear team ID');
    }

    // Notion workspace injection
    if (tool.startsWith('notion') && !params.workspace_id && state?.connectors?.notion?.workspace) {
      result.enhanced.params.workspace_id = state.connectors.notion.workspace.id;
      result.modifications.push('Injected Notion workspace ID');
    }

    // GitHub user injection
    if (tool.startsWith('github') && !params.owner && state?.connectors?.github?.user) {
      result.enhanced.params.owner = state.connectors.github.user.login;
      result.modifications.push('Injected GitHub owner');
    }
  }

  /**
   * Resolve names to IDs by calling search/list tools first
   */
  private async resolveIdentifiers(result: EnforcementResult): Promise<void> {
    const { tool, params } = result.enhanced;

    // If tool requires ID but has name instead, resolve it
    if (this.hasNameInsteadOfId(params)) {
      const resolved = await this.searchForId(tool, params);
      if (resolved) {
        Object.assign(result.enhanced.params, resolved);
        result.modifications.push('Resolved name to ID');
      }
    }
  }

  /**
   * Check if params contain name instead of required ID
   */
  private hasNameInsteadOfId(params: any): boolean {
    // Simple heuristic: if we have a 'name' field but missing typical ID fields
    return (
      (params.name && !params.id && !params.gid && !params.teamId) ||
      (params.teamName && !params.teamId) ||
      (params.projectName && !params.projectId)
    );
  }

  /**
   * Search for ID based on name
   */
  private async searchForId(tool: string, params: any): Promise<any> {
    // This would call appropriate search/list MCP tools
    // For now, returning null (to be implemented with actual MCP calls)
    console.log(`  🔍 Would search for ID matching: ${params.name || params.teamName || params.projectName}`);
    return null;
  }

  /**
   * Check if tool call requires pagination
   */
  private requiresPagination(toolCall: ToolCall): boolean {
    const paginationTools = [
      'list_tasks', 'list_projects', 'list_issues', 'get_issues',
      'list_pull_requests', 'list_commits', 'search_',
      'get_comments', 'list_cycles'
    ];

    return paginationTools.some(pattern => toolCall.tool.includes(pattern));
  }

  /**
   * Check if tool call requires operation chaining
   */
  private requiresChaining(toolCall: ToolCall): boolean {
    const chainingPatterns = [
      'create_issue', 'create_task', 'create_project'
    ];

    return chainingPatterns.some(pattern => toolCall.tool.includes(pattern));
  }

  /**
   * Build chain of dependent operations
   */
  private async buildOperationChain(toolCall: ToolCall): Promise<ToolCall[]> {
    // Example: create_issue might chain with add_labels, add_assignee, etc.
    const chain: ToolCall[] = [toolCall];

    // Add dependent operations based on tool type
    if (toolCall.tool.includes('create_issue') && toolCall.params.labels) {
      chain.push({
        tool: 'add_labels',
        params: { labels: toolCall.params.labels }
      });
    }

    return chain;
  }

  /**
   * Execute tool with pagination enforcement
   */
  async executeWithPagination(toolCall: ToolCall): Promise<any[]> {
    const results: any[] = [];
    let hasMore = true;
    let cursor = null;
    let attempts = 0;

    while (hasMore && attempts < this.maxPaginationAttempts) {
      const params = { ...toolCall.params };
      if (cursor) {
        params.cursor = cursor;
        params.after = cursor;
        params.offset = cursor;
      }

      // This would call actual MCP tool
      console.log(`  📄 Fetching page ${attempts + 1}...`);
      
      // Simulated response structure
      const response = await this.executeTool({ ...toolCall, params });
      
      if (Array.isArray(response)) {
        results.push(...response);
        hasMore = false; // No pagination info in simple array
      } else if (response.nodes) {
        results.push(...response.nodes);
        hasMore = response.pageInfo?.hasNextPage || false;
        cursor = response.pageInfo?.endCursor;
      } else if (response.data) {
        results.push(...response.data);
        cursor = response.next_page;
        hasMore = !!cursor;
      }

      attempts++;
    }

    console.log(`  ✅ Pagination complete: ${results.length} total items`);
    return results;
  }

  /**
   * Execute actual tool call (interface with MCP)
   */
  private async executeTool(toolCall: ToolCall): Promise<any> {
    // This would interface with actual MCP tool execution
    // For now, returning mock data
    return { nodes: [], pageInfo: { hasNextPage: false } };
  }
}
