import { Conquer, ConquerInfo } from  '../db/models/conquer.js';

import type { AllyModel } from '../db/models/ally.js';
import type { PlayerModel } from '../db/models/player.js';
import type { VillageModel } from '../db/models/village.js';
import type { WorldURL, WorldInterfaceURL } from '../../index';

type ConquerInfoFromInterfaceData = [
    VillageModel | null,
    PlayerModel | null,
    PlayerModel | null,
    AllyModel | null,
    AllyModel | null
];

class ConquerInfoFromInterface implements ConquerInfo {
    readonly time: string;
    readonly village: string | null;
    readonly village_points: string;
    readonly new_owner: string;
    readonly old_owner: string;
    readonly new_tribe: string | null;
    readonly old_tribe: string | null;
    readonly raw: Conquer;

    constructor(conquer: Conquer, data: ConquerInfoFromInterfaceData) {
        this.time = ConquerInfo.parseDate(conquer.time);
        this.village = data[0]?.name ?? null;
        this.village_points = conquer.points.toLocaleString('pt-br');
        this.raw = conquer;
        
        if (!data[1]) throw new Error('Não foi possível determinar o novo proprietário da aldeia.');
        this.new_owner = data[1].name;
        this.old_owner = data[2]?.name ?? '—';
        this.new_tribe = data[3]?.tag ?? null;
        this.old_tribe = data[4]?.tag ?? null;
    };
};

export async function getConquestsFromInterface(world: string, minutes: number = 5) {
    const { tables } = await import('../db/db.js');
    const AllyTable = tables.map.get(`ally_${world}`) as typeof AllyModel | undefined;
    const PlayerTable = tables.map.get(`player_${world}`) as typeof PlayerModel | undefined;
    const VillageTable = tables.map.get(`village_${world}`) as typeof VillageModel | undefined;
    
    if (!AllyTable || !PlayerTable || !VillageTable ) return null;

    const worldURL: WorldURL = `https://br${world}.tribalwars.com.br/`;
    const unixTimestamp = ((Date.now() / 1000) - (60 * minutes)).toFixed(0);
    const interfaceURL: WorldInterfaceURL = `${worldURL}interface.php?func=get_conquer_extended&since=${unixTimestamp}`;

    const response = await fetch(interfaceURL);
    const rawText = await response.text();

    const conquests: ConquerInfo[] = [];
    const lines = rawText.split(/\r?\n/);
    for (const rawLine of lines) {
        const line = rawLine.trim().split(',');
        if (line.length !== 7) continue;
        if (line.some(item => !item)) continue;

        const conquer = new Conquer(line);
        try {
            const data = await Promise.all([
                VillageTable.findByPk(conquer.village_id),
                PlayerTable.findByPk(conquer.new_owner_id),
                PlayerTable.findByPk(conquer.old_owner_id),
                AllyTable.findByPk(conquer.new_tribe_id),
                AllyTable.findByPk(conquer.old_tribe_id)
            ]);

            const record = new ConquerInfoFromInterface(conquer, data);
            conquests.push(record);

        } catch (err) {
            console.log(err);
            continue;
        };   
    };

    return conquests;
};