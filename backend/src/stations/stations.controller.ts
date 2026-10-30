import { Body, Controller, Get, Query } from '@nestjs/common';
import { StationsService } from './stations.service';
import { IsNotEmpty, IsNumber, IsPositive, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class StationQueryDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty({ message: 'Lat option must be provided' })
  @Min(-90)
  @Max(90)
  lat: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty({ message: 'Long option must be provided' })
  @Min(-180)
  @Max(180)
  lon: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsNotEmpty({ message: 'Radius option must be provided' })
  // Radius in meters, e.g. 1km = 1000
  radiusM: number;

  @IsString()
  @IsNotEmpty({ message: 'Fuel option must be provided' })
  fuel: string;
}


@Controller('stations')
export class StationsController {
    constructor (private readonly stationService : StationsService) {}

    @Get('/nearest')
    getLowerFuelStationNearby(@Query() query : StationQueryDto) {
        return this.stationService.nearbyStationsPrice(query)
    }
}
