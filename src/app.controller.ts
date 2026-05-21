import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './common/prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getHello(): string {
    return 'Welcome to NalarGizi API!';
  }

  @Get('health')
  async checkHealth() {
    try {
      // Verify database connectivity
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'up',
        database: 'connected',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'down',
        database: 'disconnected',
        error:
          error instanceof Error ? error.message : 'Unknown database error',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      };
    }
  }
}
