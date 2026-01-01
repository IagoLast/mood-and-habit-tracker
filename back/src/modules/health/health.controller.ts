import { Controller, Get } from '@nestjs/common';
import { HealthService } from './services/health.service';
import { HealthResponseDto } from './dto/health-response.dto';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth(): Promise<HealthResponseDto> {
    return this.healthService.execute();
  }
}
