import { Conquer } from  '../db/models/conquer.js';
import { tables } from '../db/db.js';

import type { AllyModel } from '../db/models/ally.js';
import type { PlayerModel } from '../db/models/player.js';
import type { VillageModel } from '../db/models/village.js';

type ConquestRecordData = [
    VillageModel | null | undefined,
    PlayerModel | null | undefined,
    PlayerModel | null | undefined,
    AllyModel | null | undefined,
    AllyModel | null | undefined
];

class ConquestRecord {
    readonly time: string;
    readonly village: string | null;
    readonly village_points: string;
    readonly new_owner: string | null;
    readonly old_owner: string | null;
    readonly old_tribe: string | null;
    readonly new_tribe: string | null;
    readonly raw: Conquer;

    constructor(conquer: Conquer, data: ConquestRecordData) {
        const parseDate = () => {
            const date = new Date(conquer.time);
            const day = date.toLocaleDateString('pt-br');
            const hour = date.toLocaleTimeString('pt-br');
            return `${day} ${hour}`;
        };

        this.time = parseDate();
        this.village = data[0]?.name ?? null;
        this.village_points = conquer.points.toLocaleString('pt-br');
        this.new_owner = data[1]?.name ?? null;
        this.old_owner = data[2]?.name ?? isItBarbarian(conquer.old_owner, 'player');
        this.old_tribe = data[3]?.tag ?? isItBarbarian(conquer.old_owner, 'ally');
        this.new_tribe = data[4]?.tag ?? isItBarbarian(conquer.old_owner, 'ally');
        this.raw = conquer;

        for (const [key, value] of Object.entries(this)) {
            if (value === null && key !== 'old_tribe' && key !== 'new_tribe') {
                throw new Error('Dados inválidos.');
            };
        };
    };
};

function isItBarbarian(id: number, type: 'ally' | 'player') {
    if (id === 0 && type === 'player') return 'Bárbaros';
    return null;
};

export async function getConquer(world: string, minutes: number = 5) {
    if (!world) return;
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
                PlayerTable?.findByPk(conquer.new_owner),
                PlayerTable?.findByPk(conquer.old_owner),
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