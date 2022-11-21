import { Conquer } from  '../db/models/conquer.js';
import { AllyModel } from '../db/models/ally.js';
import { PlayerModel } from '../db/models/player.js';
import { VillageModel } from  '../db/models/village.js';

import type { DBModels, WorldURL, WorldInterfaceURL } from '../../index';

class ConquestRecord {
    readonly time: string;
    readonly village: string | null;
    readonly village_points: string;
    readonly new_owner: string | null;
    readonly old_owner: string | null;
    readonly old_tribe: string | null;
    readonly new_tribe: string | null;
    readonly raw: Conquer;

    constructor(conquer: Conquer, data: (DBModels | null)[]) {
        const parseDate = () => {
            const date = new Date(conquer.time);
            const day = date.toLocaleDateString('pt-br');
            const hour = date.toLocaleTimeString('pt-br');
            return `${day} ${hour}`;
        };

        this.time = parseDate();
        this.village = data[0] instanceof VillageModel ? data[0].name : null;
        this.village_points = conquer.points.toLocaleString('pt-br');
        this.new_owner = data[1] instanceof PlayerModel ? data[1].name : null;
        this.old_owner = data[2] instanceof PlayerModel ? data[2].name : isItBarbarian(conquer.old_owner, 'player');
        this.old_tribe = data[3] instanceof AllyModel ? data[3].tag : isItBarbarian(conquer.old_owner, 'ally');
        this.new_tribe = data[4] instanceof AllyModel ? data[4].tag : isItBarbarian(conquer.old_owner, 'ally');
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

export async function getConquer(world: string = '116', minutes: number = 5) {
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
            const data: (DBModels | null)[] = await Promise.all([
                VillageModel.findByPk(conquer.village_id),
                PlayerModel.findByPk(conquer.new_owner),
                PlayerModel.findByPk(conquer.old_owner),
                AllyModel.findByPk(conquer.new_tribe_id),
                AllyModel.findByPk(conquer.old_tribe_id)
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