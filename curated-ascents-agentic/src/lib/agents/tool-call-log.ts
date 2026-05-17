// Singleton tool call log — shared by tool-executor and database-tools
// to avoid a circular import between the two modules.

export interface ToolCallEntry {
  tool: string;
  success: boolean;
  timestamp: string;
  resultSummary?: string;
}

let _toolCallLog: ToolCallEntry[] = [];

export function getToolCallLog(): ToolCallEntry[] {
  return [..._toolCallLog];
}

export function resetToolCallLog(): void {
  _toolCallLog = [];
}

export function pushToolCallEntry(entry: ToolCallEntry): void {
  _toolCallLog.push(entry);
}
