import { app } from '../main.js';
import { verifyWorld } from './index.js';

export function deployPlayerGetters() {
    const playerQuery = '/api/query/:world/player';
    // Ranking de jogadores.
    app.get(playerQuery, verifyWorld, async (request, response) => {
        const { world } = request.params;
        const { getPlayerRanking } = await import('../db/models/player.js');
        const playerRanking = await getPlayerRanking(world);

        if (playerRanking === null) {
            response.status(204).end();
        } else {
            response.send(playerRanking);
        };
    });

    // Perfil do jogador.
    app.get(`${playerQuery}/:id(\\d+)`, verifyWorld, async (request, response) => {
        const { id, world } = request.params;
        const { getPlayerInfo } = await import('../db/models/player.js');
        const playerInfo = await getPlayerInfo(world, id);

        if (playerInfo === null) {
            response.status(204).end();
        } else {
            response.send(playerInfo);
        };
    });

    // Aldeias do jogador.
    app.get(`${playerQuery}/:id(\\d+)/villages`, verifyWorld, async (request, response) => {
        const { id, world } = request.params;
        const { getPlayerVillages } = await import('../db/models/village.js');
        const playerVillages = await getPlayerVillages(world, id);

        if (playerVillages === null) {
            response.status(204).end();
        } else {
            response.send(playerVillages);
        };
    });
};