import { Controller, Get } from '@nestjs/common';
import { StationsService } from './stations.service';

@Controller('stations')
export class StationsController {
    constructor (private readonly stationService : StationsService) {}

    @Get()
    async getLowerFuelStationNearby(geojson : any) {

    }
}
