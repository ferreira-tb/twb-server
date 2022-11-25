import { app } from '../main.js';
import { verifyWorld } from './index.js';

export function deployVillageGetters() {
    const villageQuery = '/api/query/:world/village';
    // Página da aldeia.
    app.get(`${villageQuery}/:id(\\d+)`, async (request, response) => {
        const { id, world } = request.params;
        const { getVillageInfo } = await import('../db/models/village.js');
        const villageInfo = await getVillageInfo(world, id);

        if (villageInfo === null) {
            response.status(204).end();
        } else {
            response.send(villageInfo);
        };
    });

    // Histórico de conquistas envolvendo a aldeia.
    app.get(`${villageQuery}/:id(\\d+)/conquests`, verifyWorld, async (request, response) => {
        const { id, world } = request.params;
        const { getVillageConquestHistory } = await import('../db/models/conquer.js');
        const conquestHistory = await getVillageConquestHistory(world, id);

        if (conquestHistory === null) {
            response.status(204).end();
        } else {
            response.send(conquestHistory);
        };
    });
};