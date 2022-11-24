import { Model } from 'sequelize';
import { sequelize, fetchData } from '../db.js';

import type { InferAttributes, InferCreationAttributes } from 'sequelize';

class Ally {
    readonly ally_id: number;
    readonly name: string;
    readonly tag: string;
    readonly member_amount: number;
    readonly village_amount: number;
    readonly points: number;
    readonly all_points: number;
    readonly rank: number;

    constructor(data: string[]) {
        this.ally_id = Number.parseInt(data[0], 10);
        this.name = decodeURIComponent(data[1].replace(/\+/g, ' '));
        this.tag = decodeURIComponent(data[2].replace(/\+/g, ' '));
        this.member_amount = Number.parseInt(data[3], 10);
        this.village_amount = Number.parseInt(data[4], 10);
        this.points = Number.parseInt(data[5], 10);
        this.all_points = Number.parseInt(data[6], 10);
        this.rank = Number.parseInt(data[7], 10);
    };
};

export declare class AllyModel extends Model {
    static updateDatabase(): Promise<void>

    readonly ally_id: number;
    readonly name: string;
    readonly tag: string;
    readonly member_amount: number;
    readonly village_amount: number;
    readonly points: number;
    readonly all_points: number;
    readonly rank: number;
};

export function createAllyTable(world: string) {
    return class extends Model<InferAttributes<AllyModel>, InferCreationAttributes<AllyModel>> {
        public static async updateDatabase() {
            const allies: Ally[] = [];
            for await (const rawData of fetchData(world, 'ally')) {
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
            console.log(`${date} - MUNDO ${world.toUpperCase()}: Tribos atualizadas (${allies.length}).`);
        };
    };
};

class AllyInfo implements Ally {
    readonly ally_id: number;
    readonly name: string;
    readonly tag: string;
    readonly member_amount: number;
    readonly village_amount: number;
    readonly points: number;
    readonly all_points: number;
    readonly rank: number;

    readonly points_per_member: number;
    readonly points_per_village: number;

    constructor(ally: AllyModel) {
        this.ally_id = ally.ally_id;
        this.name = ally.name;
        this.tag = ally.tag;
        this.member_amount = ally.member_amount;
        this.village_amount = ally.village_amount;
        this.points = ally.points;
        this.all_points = ally.all_points;
        this.rank = ally.rank;

        // Se o denominador for igual a zero, o resultado não será finito.
        // Não é possível serializar números não-finitos, como NaN ou Infinity.
        // Caso tente, será obtido null, o que pode gerar erros no cliente.
        const pointsPerMember = Math.round(this.all_points / this.member_amount);
        this.points_per_member = Number.isFinite(pointsPerMember) ? pointsPerMember : 0;

        const pointsPerVillage = Math.round(this.all_points / this.village_amount);
        this.points_per_village = Number.isFinite(pointsPerVillage) ? pointsPerVillage : 0;
    };
};

export async function getAllyInfo(world: string, id: string) {
    const { tables } = await import('../db.js');
    const AllyTable = tables.map.get(`ally_${world}`) as typeof AllyModel | undefined;
    if (!AllyTable) return null;

    const parsedID = Number.parseInt(id, 10);
    if (Number.isNaN(parsedID)) return null;

    const ally = await AllyTable.findByPk(parsedID);
    if (!ally) return null;

    return new AllyInfo(ally);
};

export async function getAllyRanking(world: string) {
    const { tables } = await import('../db.js');
    const AllyTable = tables.map.get(`ally_${world}`) as typeof AllyModel | undefined;
    if (!AllyTable) return null;

    const allies = await AllyTable.findAll();
    if (allies.length === 0) return null;

    allies.sort((a, b) => a.rank - b.rank);
    while (allies.length > 100) allies.pop();

    const extendedAllies = allies.map((ally) => new AllyInfo(ally));
    return extendedAllies;
};