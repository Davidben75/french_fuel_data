import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { StationsService } from './stations/stations.service';
import { StationsController } from './stations/stations.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({
    envFilePath : ['../.env', '.env']
  })],
  controllers: [StationsController],
  providers: [AppService, StationsService],
})
export class AppModule {}
