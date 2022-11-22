import config from '../../config.json' assert { type: 'json' };
import * as attributes from './attributes.js';
import { sequelize } from './db.js';
import { createAllyTable, type AllyModel } from './models/ally.js';
import { createConquerTable, type ConquerModel } from './models/conquer.js';
import { createPlayerTable, type PlayerModel } from './models/player.js';
import { createVillageTable, type VillageModel } from './models/village.js';

export type DBModel =
    | typeof AllyModel
    | typeof ConquerModel
    | typeof PlayerModel
    | typeof VillageModel;

export async function initTables() {
    const tableMap: Map<`${WorldDataType}_${string}`, DBModel> = new Map();

    for (const world of config.worlds) {
        const newName = (old: string) => `${old}${world.toUpperCase()}`;

        const AllyTable = createAllyTable(world) as typeof AllyModel;
        Object.defineProperty(AllyTable, 'name', { value: newName('AllyTable') });
        AllyTable.init(attributes.ally, {
            sequelize: sequelize,
            tableName: `ally_${world}`
        });

        const ConquerTable = createConquerTable(world) as typeof ConquerModel;
        Object.defineProperty(ConquerTable, 'name', { value: newName('ConquerTable') });
        ConquerTable.init(attributes.conquer, {
            sequelize: sequelize,
            tableName: `conquer_${world}`
        });

        const PlayerTable = createPlayerTable(world) as typeof PlayerModel;
        Object.defineProperty(PlayerTable, 'name', { value: newName('PlayerTable') });
        PlayerTable.init(attributes.player, {
            sequelize: sequelize,
            tableName: `player_${world}`
        });

        const VillageTable = createVillageTable(world) as typeof VillageModel;
        Object.defineProperty(VillageTable, 'name', { value: newName('VillageTable') });
        VillageTable.init(attributes.village, {
            sequelize: sequelize,
            tableName: `village_${world}`
        });
        
        // Salva as classes no mapa.
        tableMap.set(`ally_${world}`, AllyTable);
        tableMap.set(`conquer_${world}`, ConquerTable);
        tableMap.set(`player_${world}`, PlayerTable);
        tableMap.set(`village_${world}`, VillageTable);
    };

    await sequelize.sync();
    return tableMap;
};