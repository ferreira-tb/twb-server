import { Conquer } from  '../db/models/conquer.js';

export async function getConquer(world: string = '116', minutes: number = 5) {
    const worldURL: WorldURL = `https://br${world}.tribalwars.com.br/`;
    const unixTimestamp = ((Date.now() / 1000) - (60 * minutes)).toFixed(0);
    const interfaceURL: WorldInterfaceURL = `${worldURL}interface.php?func=get_conquer_extended&since=${unixTimestamp}`;

    const response = await fetch(interfaceURL);
    const rawText = await response.text();

    const conquests: Conquer[] = [];
    const lines = rawText.split(/\r?\n/);
    for (const rawLine of lines) {
        const line = rawLine.trim().split(',');
        if (line.length !== 7) continue;
        if (line.some(item => !item)) continue;

        conquests.push(new Conquer(line));
    };

    return conquests;
};