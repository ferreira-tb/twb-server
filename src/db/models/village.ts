import { Model } from 'sequelize';
import { sequelize, fetchData } from '../db.js';

import type { InferAttributes, InferCreationAttributes } from 'sequelize';
import type { AllyModel } from './ally.js';
import type { PlayerModel } from './player.js';

class Village {
    readonly village_id: number;
    readonly name: string;
    readonly x: number;
    readonly y: number;
    readonly player_id: number;
    readonly points: number;
    readonly type: number;

    constructor(data: string[]) {
        this.village_id = Number.parseInt(data[0], 10);
        this.name = decodeURIComponent(data[1].replace(/\+/g, ' '));
        this.x = Number.parseInt(data[2], 10);
        this.y = Number.parseInt(data[3], 10);
        this.player_id = Number.parseInt(data[4], 10);
        this.points = Number.parseInt(data[5], 10);
        this.type = Number.parseInt(data[6], 10);
    };
};

export declare class VillageModel extends Model {
    static updateDatabase(): Promise<void>

    readonly village_id: number;
    readonly name: string;
    readonly x: number;
    readonly y: number;
    readonly player_id: number;
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
            console.log(`${date} - MUNDO ${world.toUpperCase()}: Aldeias atualizadas (${villages.length}).`);
        };
    };
};

class VillageInfo implements Village {
    readonly village_id: number;
    readonly name: string;
    readonly x: number;
    readonly y: number;
    readonly coords: string;
    readonly player_id: number;
    readonly player_name: string | null;
    readonly points: number;
    readonly type: number;
    continent!: string;

    constructor(village: VillageModel, player_name: string | null) {
        this.village_id = village.village_id;
        this.name = village.name;
        this.x = village.x;
        this.y = village.y;
        this.player_id = village.player_id;
        this.player_name = player_name;
        this.points = village.points;
        this.type = village.type;

        const getCoords = () => {
            const x = this.x.toString(10).padStart(3, '0');
            const y = this.y.toString(10).padStart(3, '0');
            this.continent = `K${y[0]}${x[0]}`;
            return `${x}|${y}`;
        };

        this.coords = getCoords();
    };
};

/**
 * Retorna uma array contendo informações sobre as aldeias do jogador.
 * @param world Mundo.
 * @param id ID do jogador.
 */
export async function getPlayerVillages(world: string, id: string) {
    const { tables } = await import('../db.js');
    const VillageTable = tables.map.get(`village_${world}`) as typeof VillageModel | undefined;
    const PlayerTable = tables.map.get(`player_${world}`) as typeof PlayerModel | undefined;
    if (!VillageTable || !PlayerTable ) return null;

    const parsedID = Number.parseInt(id, 10);
    if (Number.isNaN(parsedID)) return null;

    const player = await PlayerTable.findByPk(parsedID);
    if (!player) return null;

    const villages = await VillageTable.findAll({ where: { player_id: parsedID } });
    const playerVillages = villages.map((village) => new VillageInfo(village, player.name));
    playerVillages.sort((a, b) => a.name.localeCompare(b.name, 'pt-br'));

    return playerVillages;
};

type AllyDetails = [number, string] | null;

class ExtendedVillageInfo extends VillageInfo {
    readonly ally_id: number | null;
    readonly ally_name: string | null;

    constructor(village: VillageModel, player: string | null, ally: AllyDetails) {
        super(village, player);

        this.ally_id = ally ? ally[0] : null;
        this.ally_name = ally ? ally[1] : null;
    };
};

/**
 * Obtém informações sobre a aldeia, incluindo dados sobre a tribo (se houver).
 * @param world Mundo.
 * @param id ID da aldeia.
 */
export async function getVillageInfo(world: string, id: string) {
    const { tables } = await import('../db.js');
    const PlayerTable = tables.map.get(`player_${world}`) as typeof PlayerModel | undefined;
    const VillageTable = tables.map.get(`village_${world}`) as typeof VillageModel | undefined;
    
    if (!PlayerTable || !VillageTable ) return null;

    const parsedID = Number.parseInt(id, 10);
    if (Number.isNaN(parsedID)) return null;

    const village = await VillageTable.findByPk(parsedID);
    if (!village) return null;

    const player = await PlayerTable.findByPk(village.player_id);
    const playerName = player?.name ?? null;

    /** A função precisa retornar `null` para `ally_id === 0` e `ally_id === undefined`. */
    const getAllyNameAndID = async (ally_id: number | undefined) => {
        const AllyTable = tables.map.get(`ally_${world}`) as typeof AllyModel | undefined;
        if (!AllyTable || !ally_id) return null;
        const ally = await AllyTable.findByPk(ally_id);
        if (!ally) return null;

        return [ally.ally_id, ally.name] as [number, string];
    };

    const allyNameAndID = await getAllyNameAndID(player?.ally_id);
    return new ExtendedVillageInfo(village, playerName, allyNameAndID);
};