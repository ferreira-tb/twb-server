import config from '../../config.json' assert { type: 'json' };
import { Sequelize } from 'sequelize';
import { initTables } from './tables.js';

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite',
    logging: false
});

export const tables = { map: await initTables() };

export async function updateAllDatabases() {
    for (const world of config.worlds) {
        await updateWorldDatabase(world);
    };
};

// A ordem é importante e não deve ser alterada.
function updateWorldDatabase(world: string) {
    return new Promise<void>((resolve, reject) => {
        const AllyTable = tables.map.get(`ally_${world}`);
        const PlayerTable = tables.map.get(`player_${world}`);
        const VillageTable = tables.map.get(`village_${world}`);
        const ConquerTable = tables.map.get(`conquer_${world}`);

        AllyTable?.updateDatabase()
            .then(() => PlayerTable?.updateDatabase())
            .then(() => VillageTable?.updateDatabase())
            .then(() => ConquerTable?.updateDatabase())
            .then(() => resolve())
            .then(() => setTimeout(() => updateWorldDatabase(world), 3600000 * 1.2))
            .catch((err: unknown) => reject(err));
    });
};

export async function* fetchData(world: string, type: AllWorldFileTypes) {
    const worldURL: WorldURL = `https://br${world}.tribalwars.com.br/`;
    const dataURL: WorldDataURL = `${worldURL}map/${type}.txt`;

    const response = await fetch(dataURL);
    const rawText = await response.text();

    const lines = rawText.split(/\r?\n/);
    for (const line of lines) {
        yield line.split(',');
    };
};