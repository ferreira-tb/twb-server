import { Model } from 'sequelize';
import { sequelize, fetchData } from '../db.js';

import type { InferAttributes, InferCreationAttributes } from 'sequelize';
import type { AllyModel } from './ally.js';
import type { PlayerModel } from './player.js';
import type { VillageModel } from './village.js';

export class Conquer {
    readonly village_id: number;
    readonly time: number;
    readonly new_owner_id: number;
    readonly old_owner_id: number;
    readonly old_tribe_id: number;
    readonly new_tribe_id: number;
    readonly points: number;

    constructor(data: string[]) {
        this.village_id = Number.parseInt(data[0], 10);
        // Unix Timestamp (em segundos).
        this.time = Number.parseInt(data[1], 10) * 1000;
        this.new_owner_id = Number.parseInt(data[2], 10);
        this.old_owner_id = Number.parseInt(data[3], 10);
        this.old_tribe_id = Number.parseInt(data[4], 10);
        this.new_tribe_id = Number.parseInt(data[5], 10);
        this.points = Number.parseInt(data[6], 10);
    };
};

export declare class ConquerModel extends Model {
    static updateDatabase(): Promise<void>

    readonly village_id: number;
    readonly time: number;
    readonly new_owner_id: number;
    readonly old_owner_id: number;
    readonly old_tribe_id: number;
    readonly new_tribe_id: number;
    readonly points: number;
};

export function createConquerTable(world: string) {
    return class extends Model<InferAttributes<ConquerModel>, InferCreationAttributes<ConquerModel>> {
        public static async updateDatabase() {
            const conquests: Conquer[] = [];
            for await (const rawData of fetchData(world, 'conquer_extended')) {
                if (rawData.length !== 7) continue;
                if (rawData.some(item => !item)) continue;
                
                const conquer = new Conquer(rawData);
                // Usa o horário da conquista para determinar se ela já está registrada.
                let conquerQuery = await this.findOne({ where: { time: conquer.time } }) as ConquerModel | null;
                // Verifica as outras informações para ter certeza que se trata da mesma conquista.
                if (conquerQuery) {
                    for (const [key, value] of Object.entries(conquer)) {
                        if (key === 'points') continue;

                        if (conquerQuery[key as keyof Conquer] !== value) {
                            conquerQuery = null;
                            break;
                        };
                    };
                };


                if (conquerQuery === null) conquests.push(conquer);
            };
    
            if (conquests.length > 0) {
                const transaction = await sequelize.transaction();
                try {
                    await this.bulkCreate(conquests, { transaction: transaction });
                    await transaction.commit();
                } catch (err) {
                    transaction.rollback();
                    if (err instanceof Error) throw err;
                };  
            };
    
            const date = new Date().toLocaleTimeString('pt-br');
            console.log(`${date} - MUNDO ${world.toUpperCase()}: Conquistas atualizadas (${conquests.length}).`);
        };
    };
};

type ConquestRecordData = [
    VillageModel | null | undefined,
    PlayerModel | null | undefined,
    PlayerModel | null | undefined,
    AllyModel | null | undefined,
    AllyModel | null | undefined
];

export class ConquestRecord {
    readonly time: string;
    readonly village: string | null;
    readonly village_points: string;
    readonly new_owner: string | null;
    readonly old_owner: string | null;
    readonly old_tribe: string | null;
    readonly new_tribe: string | null;
    readonly raw: Conquer;

    constructor(conquer: Conquer, data: ConquestRecordData) {
        const parseDate = () => {
            const date = new Date(conquer.time);
            const day = date.toLocaleDateString('pt-br');
            const hour = date.toLocaleTimeString('pt-br');
            return `${day} ${hour}`;
        };

        this.time = parseDate();
        this.village = data[0]?.name ?? null;
        this.village_points = conquer.points.toLocaleString('pt-br');
        this.new_owner = data[1]?.name ?? null;
        this.old_owner = data[2]?.name ?? ConquestRecord.isItBarbarian(conquer.old_owner_id, 'player');
        this.new_tribe = data[3]?.tag ?? ConquestRecord.isItBarbarian(conquer.old_owner_id, 'ally');
        this.old_tribe = data[4]?.tag ?? ConquestRecord.isItBarbarian(conquer.old_owner_id, 'ally');
        this.raw = conquer;

        for (const [key, value] of Object.entries(this)) {
            if (value === null && key !== 'old_tribe' && key !== 'new_tribe') {
                throw new Error('Dados inválidos.');
            };
        };
    };

    public static isItBarbarian(id: number, type: 'ally' | 'player') {
        if (id === 0 && type === 'player') return 'Bárbaros';
        return null;
    };
};