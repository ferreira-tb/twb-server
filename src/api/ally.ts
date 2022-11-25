import { app } from '../main.js';
import { verifyWorld } from './index.js';

export function deployAllyGetters() {
    const allyQuery = '/api/query/:world/ally';
    // Ranking de tribos
    app.get(allyQuery, verifyWorld, async (request, response) => {
        const { world } = request.params;
        const { getAllyRanking } = await import('../db/models/ally.js');
        const allyRanking = await getAllyRanking(world);

        if (allyRanking === null) {
            response.status(204).end();
        } else {
            response.send(allyRanking);
        };
    });

    // Perfil da tribo.
    app.get(`${allyQuery}/:id(\\d+)`, verifyWorld, async (request, response) => {
        const { id, world } = request.params;
        const { getAllyInfo } = await import('../db/models/ally.js');
        const allyInfo = await getAllyInfo(world, id);

        if (allyInfo === null) {
            response.status(204).end();
        } else {
            response.send(allyInfo);
        };
    });

    // Membros da tribo.
    app.get(`${allyQuery}/:id(\\d+)/members`, verifyWorld, async (request, response) => {
        const { id, world } = request.params;
        const { getAllyMembers } = await import('../db/models/ally.js');
        const allyMembers = await getAllyMembers(world, id);

        if (allyMembers === null) {
            response.status(204).end();
        } else {
            response.send(allyMembers);
        };
    });
};