import { Model } from 'sequelize';
import { sequelize, fetchData } from '../db.js';

import type { InferAttributes, InferCreationAttributes } from 'sequelize';

class Ally {
    readonly id: number;
    readonly name: string;
    readonly tag: string;
    readonly members: number;
    readonly villages: number;
    readonly points: number;
    readonly all_points: number;
    readonly rank: number;

    constructor(data: string[]) {
        this.id = Number.parseInt(data[0], 10);
        this.name = decodeURIComponent(data[1].replace(/\+/g, ' '));
        this.tag = decodeURIComponent(data[2].replace(/\+/g, ' '));
        this.members = Number.parseInt(data[3], 10);
        this.villages = Number.parseInt(data[4], 10);
        this.points = Number.parseInt(data[5], 10);
        this.all_points = Number.parseInt(data[6], 10);
        this.rank = Number.parseInt(data[7], 10);
    };
};

export class AllyModel extends Model<InferAttributes<AllyModel>, InferCreationAttributes<AllyModel>>  {
    declare readonly id: number;
    declare readonly name: string;
    declare readonly tag: string;
    declare readonly members: number;
    declare readonly villages: number;
    declare readonly points: number;
    declare readonly all_points: number;
    declare readonly rank: number;

    public static async updateDatabase() {
        const allies: Ally[] = [];
        for await (const rawData of fetchData('ally')) {
            // Ignora a aldeia caso haja algum dado inválido.
            if (rawData.length !== 8) continue;
            if (rawData.some(item => !item)) continue;
            
            allies.push(new Ally(rawData));
        };

        if (allies.length > 0) {
            const transaction = await sequelize.transaction();
            try {
                const keys = Object.keys(allies[0]) as (keyof Ally)[];
                await this.bulkCreate(allies, { updateOnDuplicate: keys, transaction: transaction });
                await transaction.commit();
            } catch (err) {
                transaction.rollback();
                if (err instanceof Error) throw err;
            };  
        };

        const date = new Date().toLocaleTimeString('pt-br');
        console.log(`${date} - MUNDO 116: Tribos atualizadas (${allies.length}).`);
    };
};