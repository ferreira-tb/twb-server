import { Conquer, ConquestRecord } from  '../db/models/conquer.js';

import type { AllyModel } from '../db/models/ally.js';
import type { PlayerModel } from '../db/models/player.js';
import type { VillageModel } from '../db/models/village.js';

export async function getConquer(world: string, minutes: number = 5) {
    if (!world) return null;
    const { tables } = await import('../db/db.js');
    const AllyTable = tables.map.get(`ally_${world}`) as typeof AllyModel | undefined;
    const PlayerTable = tables.map.get(`player_${world}`) as typeof PlayerModel | undefined;
    const VillageTable = tables.map.get(`village_${world}`) as typeof VillageModel | undefined;

    const worldURL: WorldURL = `https://br${world}.tribalwars.com.br/`;
    const unixTimestamp = ((Date.now() / 1000) - (60 * minutes)).toFixed(0);
    const interfaceURL: WorldInterfaceURL = `${worldURL}interface.php?func=get_conquer_extended&since=${unixTimestamp}`;

    const response = await fetch(interfaceURL);
    const rawText = await response.text();

    const conquests: ConquestRecord[] = [];
    const lines = rawText.split(/\r?\n/);
    for (const rawLine of lines) {
        const line = rawLine.trim().split(',');
        if (line.length !== 7) continue;
        if (line.some(item => !item)) continue;

        const conquer = new Conquer(line);
        try {
            const data = await Promise.all([
                VillageTable?.findByPk(conquer.village_id),
                PlayerTable?.findByPk(conquer.new_owner_id),
                PlayerTable?.findByPk(conquer.old_owner_id),
                AllyTable?.findByPk(conquer.new_tribe_id),
                AllyTable?.findByPk(conquer.old_tribe_id)
            ]);

            const record = new ConquestRecord(conquer, data);
            conquests.push(record);

        } catch (err) {
            console.log(err);
            continue;
        };   
    };

    return conquests;
};