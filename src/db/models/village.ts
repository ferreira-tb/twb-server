import { Model, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from '../db.js';

class Village {
    readonly id: number;
    readonly name: string;
    readonly x: number;
    readonly y: number;
    readonly player: number;
    readonly points: number;
    readonly rank: number;

    constructor(data: string[]) {
        this.id = Number.parseInt(data[0], 10);
        this.name = decodeURIComponent(data[1].replace(/\+/g, ' '));
        this.x = Number.parseInt(data[2], 10);
        this.y = Number.parseInt(data[3], 10);
        this.player = Number.parseInt(data[4], 10);
        this.points = Number.parseInt(data[5], 10);
        this.rank = Number.parseInt(data[6], 10)
    };
};

export class VillageModel extends Model<InferAttributes<VillageModel>, InferCreationAttributes<VillageModel>> {
    declare readonly id: number;
    declare readonly name: string;
    declare readonly x: number;
    declare readonly y: number;
    declare readonly player: number;
    declare readonly points: number;
    declare readonly rank: number;

    private static async *fetchVillageData() {
        const worldURL: WorldURL = 'https://br116.tribalwars.com.br/';
        const villageDataURL: WorldDataURL = `${worldURL}map/village.txt`;

        const villageData = await fetch(villageDataURL);
        const rawText = await villageData.text();

        const villages = rawText.split(/\r?\n/);
        for (const village of villages) {
            yield village.split(',');
        };
    };

    public static async updateDatabase() {
        const newVillages: Village[] = [];
        for await (const rawData of this.fetchVillageData()) {
            // Ignora a aldeia caso haja algum dado inválido.
            if (rawData.length !== 7) continue
            if (rawData.some(item => !item)) continue;
            
            const village = new Village(rawData);
            const villageQuery = await this.findOne({ where: { id: village.id } });

            if (villageQuery === null) {
                newVillages.push(village);
            } else {
                villageQuery.set(village);
                await villageQuery.save();
            };
        };

        if (newVillages.length > 0) {
            const transaction = await sequelize.transaction();
            try {
                await this.bulkCreate(newVillages, { transaction: transaction });
                await transaction.commit();
            } catch (err) {
                transaction.rollback();
                if (err instanceof Error) throw err;
            };  
        };
    };
};