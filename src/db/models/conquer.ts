import { Model } from 'sequelize';
import { sequelize, fetchData } from '../db.js';

import type { InferAttributes, InferCreationAttributes } from 'sequelize';
import type { AllyModel } from './ally.js';
import type { PlayerModel } from './player.js';
import type { VillageModel } from './village.js';
import type { TableMap } from '../../../index';

export class Conquer {
    readonly village_id: number;
    readonly time: number;
    readonly new_owner_id: number;
    readonly old_owner_id: number;
    readonly new_tribe_id: number;
    readonly old_tribe_id: number;
    readonly points: number;

    constructor(data: string[]) {
        this.village_id = Number.parseInt(data[0], 10);
        
        // Unix Timestamp (em segundos).
        const timestamp = Number.parseInt(data[1], 10);
        this.time = timestamp * 1000;

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
    readonly new_tribe_id: number;
    readonly old_tribe_id: number;
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
                        if (conquerQuery[key as keyof Conquer] !== value) {
                            if (key === 'points') continue;
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

interface ConquerInfoData {
    readonly village: string | null;
    readonly new_owner: string;
    readonly old_owner: string | null;
    readonly new_tribe: string | null;
    readonly old_tribe: string | null;
}

export class ConquerInfo {
    readonly time: string;
    readonly village: string | null;
    readonly village_points: string;
    readonly new_owner: string;
    readonly old_owner: string;
    readonly new_tribe: string | null;
    readonly old_tribe: string | null;
    readonly raw: Conquer;

    constructor(conquer: Conquer, data: ConquerInfoData) {
        this.time = ConquerInfo.parseDate(conquer.time);
        this.village = data.village;
        this.village_points = conquer.points.toLocaleString('pt-br');
        this.raw = conquer;

        this.new_owner = data.new_owner;
        this.old_owner = data.old_owner ?? '—';
        this.new_tribe = data.new_tribe;
        this.old_tribe = data.old_tribe;  
    };

    public static parseDate(time: number) {
        const date = new Date(time);
        const day = date.toLocaleDateString('pt-br');
        const hour = date.toLocaleTimeString('pt-br');
        return `${day} às ${hour}`;
    };
};

interface ParseConquerModelOptions {
    tableMap?: TableMap;
    village?: VillageModel | null;
}

/**
 * Transforma uma instância de `ConquerModel` em uma de `ConquerInfo`.
 * @param world Mundo.
 * @param conquer Instância de `ConquerModel`.
 */
async function parseConquerModel(world: string, conquer: ConquerModel, options?: ParseConquerModelOptions) {
    let tableMap = options?.tableMap;
    if (!tableMap) {
        const { tables } = await import('../db.js');
        tableMap = tables.map;
    };

    const AllyTable = tableMap.get(`ally_${world}`) as typeof AllyModel | undefined;
    const PlayerTable = tableMap.get(`player_${world}`) as typeof PlayerModel | undefined;
    const VillageTable = tableMap.get(`village_${world}`) as typeof VillageModel | undefined;

    if (!AllyTable || !PlayerTable || !VillageTable ) return null;

    const village = options?.village ?? await VillageTable.findByPk(conquer.village_id);
    if (!village) return null;

    const getAlly = async (allyID: number) => {
        if (allyID === 0) return null;
        const ally = await AllyTable.findByPk(allyID);
        if (!ally) return null;

        return ally;
    };

    const [oldOwner, newOwner, oldAlly, newAlly] = await Promise.all([
        PlayerTable.findByPk(conquer.old_owner_id),
        PlayerTable.findByPk(conquer.new_owner_id),
        getAlly(conquer.old_tribe_id),
        getAlly(conquer.new_tribe_id)
    ]);

    if (!newOwner) return null;

    const data: ConquerInfoData = {
        village: village.name,
        new_owner: newOwner.name,
        old_owner: oldOwner?.name ?? null,
        new_tribe: newAlly?.name ?? null,
        old_tribe: oldAlly?.name ?? null
    };

    return new ConquerInfo(conquer, data);
};

/**
 * Retorna uma array contendo o histórico de conquistas da aldeia indicada.
 * @param world Mundo.
 * @param id ID da aldeia.
 */
export async function getVillageConquestHistory(world: string, id: string) {
    const { tables } = await import('../db.js');
    const ConquerTable = tables.map.get(`conquer_${world}`) as typeof ConquerModel | undefined;
    const VillageTable = tables.map.get(`village_${world}`) as typeof VillageModel | undefined;
    if (!ConquerTable || !VillageTable) return null;

    const parsedID = Number.parseInt(id, 10);
    if (Number.isNaN(parsedID)) return null;

    const village = await VillageTable.findByPk(parsedID);
    if (!village) return null;

    const rawConquests = await ConquerTable.findAll({ where: { village_id: parsedID } });
    if (rawConquests.length === 0) return null;
    if (rawConquests.length > 1) rawConquests.sort((a, b) => b.time - a.time);

    const conquests = await Promise.all(rawConquests.map(async (conquer) => {
        const options = { tableMap: tables.map, village: village }
        return await parseConquerModel(world, conquer, options);
    }));
    
    return conquests;
};