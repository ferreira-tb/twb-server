import { Model } from 'sequelize';
import { sequelize, fetchData } from '../db.js';

import type { InferAttributes, InferCreationAttributes } from 'sequelize';

class Conquer {
    readonly village_id: number;
    readonly time: number;
    readonly new_owner: number;
    readonly old_owner: number;

    constructor(data: string[]) {
        this.village_id = Number.parseInt(data[0], 10);
        this.time = Number.parseInt(data[1], 10);
        this.new_owner = Number.parseInt(data[2], 10);
        this.old_owner = Number.parseInt(data[3], 10);
    };
};

export class ConquerModel extends Model<InferAttributes<ConquerModel>, InferCreationAttributes<ConquerModel>>  {
    declare readonly village_id: number;
    declare readonly time: number;
    declare readonly new_owner: number;
    declare readonly old_owner: number;

    public static async updateDatabase() {
        const conquers: Conquer[] = [];
        for await (const rawData of fetchData('conquer')) {
            // Ignora a aldeia caso haja algum dado inválido.
            if (rawData.length !== 4) continue;
            if (rawData.some(item => !item)) continue;
            
            const conquer = new Conquer(rawData);
            const conquerQuery = await this.findOne({ where: { ...conquer }});
            if (conquerQuery === null) conquers.push(conquer);
        };

        if (conquers.length > 0) {
            const transaction = await sequelize.transaction();
            try {
                await this.bulkCreate(conquers, { transaction: transaction });
                await transaction.commit();
            } catch (err) {
                transaction.rollback();
                if (err instanceof Error) throw err;
            };  
        };

        const date = new Date().toLocaleTimeString('pt-br');
        console.log(`${date} - MUNDO 116: Conquistas atualizadas (${conquers.length}).`);
    };
};