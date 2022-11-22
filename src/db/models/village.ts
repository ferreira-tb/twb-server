import { Model } from 'sequelize';
import { sequelize, fetchData } from '../db.js';

import type { InferAttributes, InferCreationAttributes } from 'sequelize';

class Village {
    readonly id: number;
    readonly name: string;
    readonly x: number;
    readonly y: number;
    readonly player: number;
    readonly points: number;
    readonly type: number;

    constructor(data: string[]) {
        this.id = Number.parseInt(data[0], 10);
        this.name = decodeURIComponent(data[1].replace(/\+/g, ' '));
        this.x = Number.parseInt(data[2], 10);
        this.y = Number.parseInt(data[3], 10);
        this.player = Number.parseInt(data[4], 10);
        this.points = Number.parseInt(data[5], 10);
        this.type = Number.parseInt(data[6], 10);
    };
};

export declare class VillageModel extends Model {
    static updateDatabase(): Promise<void>

    readonly id: number;
    readonly name: string;
    readonly x: number;
    readonly y: number;
    readonly player: number;
    readonly points: number;
    readonly type: number;
};

export function createVillageTable(world: string) {
    return class extends Model<InferAttributes<VillageModel>, InferCreationAttributes<VillageModel>> {
        public static async updateDatabase() {
            const villages: Village[] = [];
            for await (const rawData of fetchData(world, 'village')) {
                if (rawData.length !== 7) continue;
                if (rawData.some(item => !item)) continue;
                
                villages.push(new Village(rawData));
            };
    
            if (villages.length > 0) {
                const transaction = await sequelize.transaction();
                try {
                    const keys = Object.keys(villages[0]) as (keyof Village)[];
                    await this.bulkCreate(villages, { updateOnDuplicate: keys, transaction: transaction });
                    await transaction.commit();
                } catch (err) {
                    transaction.rollback();
                    if (err instanceof Error) throw err;
                };  
            };
    
            const date = new Date().toLocaleTimeString('pt-br');
            console.log(`${date} - MUNDO ${world}: Aldeias atualizadas (${villages.length}).`);
        };
    };
};