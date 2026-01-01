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
  environment: {
    NODE_ENV: string;
    PORT: string;
    DB_HOST: string;
    DB_PORT: string;
    DB_NAME: string;
    DB_USER: string;
    DB_PASSWORD: string;
    JWT_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
  };
  timestamp: string;
}
