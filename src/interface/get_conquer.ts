import { Conquer } from  '../db/models/conquer.js';
import { AllyModel } from '../db/models/ally.js';
import { PlayerModel } from '../db/models/player.js';
import { VillageModel } from  '../db/models/village.js';

class ConquestRecord {
    readonly time: number;
    readonly village: string;
    readonly village_points: number;
    readonly new_owner: string;
    readonly old_owner: string;

    constructor(conquer: Conquer, village: string, newOwner: string, oldOwner: string) {
        this.time = conquer.time;
        this.village = village;
        this.village_points = conquer.points;
        this.new_owner = newOwner;
        this.old_owner = oldOwner;
    };
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
            const village = (await VillageModel.findByPk(conquer.village_id))?.name;
            const newOwner = (await PlayerModel.findByPk(conquer.new_owner))?.name;
            const oldOwner = (await PlayerModel.findByPk(conquer.old_owner))?.name;
            const newAlly = (await AllyModel.findByPk(conquer.new_tribe_id))?.tag;
            const oldAlly = (await AllyModel.findByPk(conquer.old_tribe_id))?.tag;

            if (!village || !newOwner || !oldOwner || !newAlly || !oldAlly) continue;

            const newOwnerInfo = `${newOwner} (${newAlly})`;
            const oldOwnerInfo = `${oldOwner} (${oldAlly})`;

            const record = new ConquestRecord(conquer, village, newOwnerInfo, oldOwnerInfo);
            conquests.push(record);

        } catch (err) {
            console.log(err);
            continue;
        };   
    };

    return conquests;
};