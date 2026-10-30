import { BadRequestException, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { StationQueryDto } from './stations.controller';

export interface StationResult {
    id : number;
    adresse: string;
    cp: string;
    ville: string;
    price: number;
    updated_at: Date;
    distance_m: number;
    geojson: string;
}


@Injectable()
export class StationsService implements OnModuleDestroy{
    private readonly pool : Pool

    constructor () {
        this.pool = new Pool({
            connectionString : process.env.DATABASE_URL,
            max: 10,
            idleTimeoutMillis: 30_000,
            connectionTimeoutMillis: 5_000,
        })
    }
    async onModuleDestroy() {
        await this.pool.end()
    }

    async nearbyStationsPrice(query : StationQueryDto) {
        if (!query) {
            throw new BadRequestException('Some field are required')
        }

        const FUELS = ['gazole', 'sp95', 'e10', 'sp98', 'e85', 'gplc'];
        const {lat, lon, radiusM, fuel} = query


        if (!FUELS.includes(fuel)) {
        throw new BadRequestException('Carburant invalide');
        }

        const { rows } = await this.pool.query<StationResult>(
        `
        SELECT s.id, s.adresse, s.cp, s.ville,
                lp.price, lp.updated_at,
                ST_Distance(s.location, p.pt) AS distance_m,
                ST_AsGeoJSON(s.location)      AS geojson
        FROM stations s
        CROSS JOIN (
            SELECT ST_SetSRID(ST_MakePoint($1::float8, $2::float8), 4326)::geography AS pt
        ) p
        CROSS JOIN LATERAL (
            SELECT price, updated_at FROM prices
            WHERE station_id = s.id AND fuel = $3 AND price IS NOT NULL
            ORDER BY updated_at DESC LIMIT 1
        ) lp
        WHERE ST_DWithin(s.location, p.pt, $4::float8)
        ORDER BY lp.price ASC, distance_m ASC
        LIMIT 15
        `,
        [lon, lat, fuel, radiusM],
        );

        return rows;
    }
}
