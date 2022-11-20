import { Model } from 'sequelize';
import { sequelize, fetchData } from '../db.js';

import type { InferAttributes, InferCreationAttributes } from 'sequelize';

class Player {
    readonly id: number;
    readonly name: string;
    readonly ally: number;
    readonly villages: number;
    readonly points: number;
    readonly rank: number;

    constructor(data: string[]) {
        this.id = Number.parseInt(data[0], 10);
        this.name = decodeURIComponent(data[1].replace(/\+/g, ' '));
        this.ally = Number.parseInt(data[2], 10);
        this.villages = Number.parseInt(data[3], 10);
        this.points = Number.parseInt(data[4], 10);
        this.rank = Number.parseInt(data[5], 10);
    };
};

export class PlayerModel extends Model<InferAttributes<PlayerModel>, InferCreationAttributes<PlayerModel>>  {
    declare readonly id: number;
    declare readonly name: string;
    declare readonly ally: number;
    declare readonly villages: number;
    declare readonly points: number;
    declare readonly rank: number;

    public static async updateDatabase() {
        const players: Player[] = [];
        for await (const rawData of fetchData('player')) {
            if (rawData.length !== 6) continue;
            if (rawData.some(item => !item)) continue;
            
            players.push(new Player(rawData));
        };

        if (players.length > 0) {
            const transaction = await sequelize.transaction();
            try {
                const keys = Object.keys(players[0]) as (keyof Player)[];
                await this.bulkCreate(players, { updateOnDuplicate: keys , transaction: transaction });
                await transaction.commit();
            } catch (err) {
                transaction.rollback();
                if (err instanceof Error) throw err;
            };  
        };

        const date = new Date().toLocaleTimeString('pt-br');
        console.log(`${date} - MUNDO 116: Jogadores atualizados (${players.length}).`);
    };
};
