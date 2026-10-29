import { Body, Controller, Get } from '@nestjs/common';
import { StationsService } from './stations.service';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class StationDto {
    @IsNumber()
    @IsNotEmpty({message : "Lat option must be provided"})
    lat: number;

    @IsNumber()
    @IsNotEmpty({message : "Long option must be provided"})
    lon: number; 

    @IsNumber()
    @IsNotEmpty({message : "Radius option must be provided"})
    //  Radius in meter : eg 1km = 1000M
    // radiusM = 1000
    radiusM: number;

    @IsString()
    @IsNotEmpty({message : "Fuel option must be provided"})
    fuel: string;
}

@Controller('stations')
export class StationsController {
    constructor (private readonly stationService : StationsService) {}

    @Get('/nearest')
    getLowerFuelStationNearby(@Body() stationDto : StationDto) {
        return this.stationService.nearbyStationsPrice(stationDto)
    }
}
