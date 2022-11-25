import { app } from '../main.js';
import { verifyWorld } from './index.js';

export function deployGameGetters() {
    // Perfil do jogador.
    app.get('/api/game/:world/player/:id(\\d+)/profile', verifyWorld, async (request, response) => {
        const { id, world } = request.params;
        const { getPlayerProfilePage } = await import('../game/profile.js');
        const targetPage = await getPlayerProfilePage(world, id);
        response.send(targetPage);
    });
    
    // Perfil da tribo.
    app.get('/api/game/:world/ally/:id(\\d+)/profile', verifyWorld, async (request, response) => {
        const { id, world } = request.params;
        const { getAllyProfilePage } = await import('../game/profile.js');
        const targetPage = await getAllyProfilePage(world, id);
        response.send(targetPage);
    });
};