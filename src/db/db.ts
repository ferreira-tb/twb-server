import { Sequelize } from 'sequelize';
import * as attributes from './attributes.js';
import { AllyModel } from './models/ally.js';
import { ConquerModel } from './models/conquer.js';
import { PlayerModel } from './models/player.js';
import { VillageModel } from './models/village.js';

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite',
    logging: false
});

export async function start() {
    AllyModel.init(attributes.ally, {
        sequelize: sequelize,
        tableName: 'allies_116'
    });

    ConquerModel.init(attributes.conquer, {
        sequelize: sequelize,
        tableName: 'conquers_116'
    });

    PlayerModel.init(attributes.player, {
        sequelize: sequelize,
        tableName: 'players_116'
    });

    VillageModel.init(attributes.village, {
        sequelize: sequelize,
        tableName: 'villages_116'
    });
    
    await sequelize.sync();
    updateAllDatabases();
};

function updateAllDatabases() {
    VillageModel.updateDatabase()
        .then(() => PlayerModel.updateDatabase())
        .then(() => AllyModel.updateDatabase())
        .then(() => ConquerModel.updateDatabase())
        .then(() => setTimeout(() => updateAllDatabases(), 3600000 * 1.2))
        .catch((err) => console.log(err));
};

export async function* fetchData(type: AllWorldFileTypes) {
    const worldURL: WorldURL = 'https://br116.tribalwars.com.br/';
    const dataURL: WorldDataURL = `${worldURL}map/${type}.txt`;

    const response = await fetch(dataURL);
    const rawText = await response.text();

    const lines = rawText.split(/\r?\n/);
    for (const line of lines) {
        yield line.split(',');
    };
};