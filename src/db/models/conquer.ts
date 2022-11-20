import { Model } from 'sequelize';
import { sequelize, fetchData } from '../db.js';

import type { InferAttributes, InferCreationAttributes } from 'sequelize';

export class Conquer {
    readonly village_id: number;
    readonly time: number;
    readonly new_owner: number;
    readonly old_owner: number;
    readonly old_tribe_id: number;
    readonly new_tribe_id: number;
    readonly points: number;

    constructor(data: string[]) {
        this.village_id = Number.parseInt(data[0], 10);
        // Unix Timestamp (em segundos).
        this.time = Number.parseInt(data[1], 10) * 1000;
        this.new_owner = Number.parseInt(data[2], 10);
        this.old_owner = Number.parseInt(data[3], 10);
        this.old_tribe_id = Number.parseInt(data[4], 10);
        this.new_tribe_id = Number.parseInt(data[5], 10);
        this.points = Number.parseInt(data[6], 10);
    };
};

export class ConquerModel extends Model<InferAttributes<ConquerModel>, InferCreationAttributes<ConquerModel>>  {
    declare readonly village_id: number;
    declare readonly time: number;
    declare readonly new_owner: number;
    declare readonly old_owner: number;
    declare readonly old_tribe_id: number;
    declare readonly new_tribe_id: number;
    declare readonly points: number;

    public static async updateDatabase() {
        const conquests: Conquer[] = [];
        for await (const rawData of fetchData('conquer_extended')) {
            if (rawData.length !== 7) continue;
            if (rawData.some(item => !item)) continue;
            
            const conquer = new Conquer(rawData);
            const conquerQuery = await this.findOne({ where: { ...conquer }});
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
        console.log(`${date} - MUNDO 116: Conquistas atualizadas (${conquests.length}).`);
    };
};