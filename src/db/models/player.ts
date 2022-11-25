import { Model } from 'sequelize';
import { sequelize, fetchData } from '../db.js';

import type { InferAttributes, InferCreationAttributes } from 'sequelize';
import type { AllyModel } from './ally.js';

class Player {
    readonly player_id: number;
    readonly name: string;
    readonly ally_id: number;
    readonly village_amount: number;
    readonly points: number;
    readonly rank: number;
    readonly active: boolean = true;

    constructor(data: string[]) {
        this.player_id = Number.parseInt(data[0], 10);
        this.name = decodeURIComponent(data[1].replace(/\+/g, ' '));
        this.ally_id = Number.parseInt(data[2], 10);
        this.village_amount = Number.parseInt(data[3], 10);
        this.points = Number.parseInt(data[4], 10);
        this.rank = Number.parseInt(data[5], 10);
    };
};

export declare class PlayerModel extends Model {
    static updateDatabase(): Promise<void>

    readonly player_id: number;
    readonly name: string;
    readonly ally_id: number;
    readonly village_amount: number;
    readonly points: number;
    readonly rank: number;
    readonly active: boolean;
};

export function createPlayerTable(world: string) {
    return class extends Model<InferAttributes<PlayerModel>, InferCreationAttributes<PlayerModel>> {
        public static async updateDatabase() {
            const players: Player[] = [];
            for await (const rawData of fetchData(world, 'player')) {
                if (rawData.length !== 6) continue;
                if (rawData.some(item => !item)) continue;
                
                players.push(new Player(rawData));
            };
    
            if (players.length > 0) {
                const keys = ['name', 'ally_id', 'village_amount', 'points', 'rank'] as (keyof Player)[];
                const transaction = await sequelize.transaction();
                try {   
                    await this.bulkCreate(players, { updateOnDuplicate: keys , transaction: transaction });
                    await transaction.commit();
                } catch (err) {
                    transaction.rollback();
                    if (err instanceof Error) throw err;
                };
            };
    
            const date = new Date().toLocaleTimeString('pt-br');
            console.log(`${date} - MUNDO ${world.toUpperCase()}: Jogadores atualizados (${players.length}).`);
        };
    };
};

export class PlayerInfo {
    readonly player_id: number;
    readonly player_name: string;
    readonly ally_id: number | null;
    readonly ally_name: string | null;
    readonly ally_tag: string | null;
    readonly village_amount: number;
    readonly points: number;
    readonly mean_points: number;
    readonly rank: number;
    readonly active: boolean;

    constructor(player: PlayerModel, ally: AllyModel | null) {
        this.player_id = player.player_id;
        this.player_name = player.name;
        this.ally_id = ally?.ally_id ?? null;
        this.ally_name = ally?.name ?? null;
        this.ally_tag = ally?.tag ?? null;
        this.village_amount = player.village_amount;
        this.points = player.points;
        this.rank = player.rank;
        this.active = player.active;

        // Se o denominador for igual a zero, o resultado não será finito.
        // Não é possível serializar números não-finitos, como NaN ou Infinity.
        // Caso tente, será obtido null, o que pode gerar erros no cliente.
        const meanPoints = Math.round(this.points / this.village_amount);
        this.mean_points = Number.isFinite(meanPoints) ? meanPoints : 0;
    };
};

export async function getPlayerInfo(world: string, id: string) {
    const { tables } = await import('../db.js');
    const PlayerTable = tables.map.get(`player_${world}`) as typeof PlayerModel | undefined;
    if (!PlayerTable) return null;

    const parsedID = Number.parseInt(id, 10);
    if (Number.isNaN(parsedID)) return null;

    const player = await PlayerTable.findByPk(parsedID);
    if (!player) return null;

    const AllyTable = tables.map.get(`ally_${world}`) as typeof AllyModel | undefined;
    const getAlly = async () => {
        if (!AllyTable || player.ally_id === 0) return null;
        const ally = await AllyTable.findByPk(player.ally_id);
        if (!ally) return null;

        return ally;
    };

    return new PlayerInfo(player, await getAlly());
};

export async function getPlayerRanking(world: string) {
    const { tables } = await import('../db.js');
    const PlayerTable = tables.map.get(`player_${world}`) as typeof PlayerModel | undefined;
    if (!PlayerTable) return null;

    const players = await PlayerTable.findAll();
    if (players.length === 0) return null;

    players.sort((a, b) => a.rank - b.rank);
    while (players.length > 50) players.pop();

    const AllyTable = tables.map.get(`ally_${world}`) as typeof AllyModel | undefined;
    const getAlly = async (ally_id: number) => {
        if (!AllyTable || ally_id === 0) return null;
        const ally = await AllyTable.findByPk(ally_id);
        if (!ally) return null;

        return ally;
    };

    const extendedPlayers = await Promise.all(players.map(async (player) => {
        return new PlayerInfo(player, await getAlly(player.ally_id));
    }));

    return extendedPlayers;
};