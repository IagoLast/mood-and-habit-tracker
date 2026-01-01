export interface HealthResponseDto {
  status: string;
  database: {
    connected: boolean;
    version?: string;
    responseTimeMs?: number;
    tablesCount?: number;
    totalConnections?: number;
    idleConnections?: number;
  };
  timestamp: string;
}
