import { app } from '../main.js';
import { verifyWorld } from './index.js';

export function deployInterfaceGetters() {
    // Conquistas recentes.
    app.get('/api/interface/:world/get_conquer', verifyWorld, async (request, response) => {
        const world = request.params.world;
        const { getConquestsFromInterface } = await import('../game/get_conquer.js');
        const conquests = await getConquestsFromInterface(world, 60);
    
        if (Array.isArray(conquests)) {
            if (conquests.length > 1) {
                conquests.sort((a, b) => b.raw.time - a.raw.time);
            };   
            response.send(conquests);
        } else {
            response.status(204).end();
        };
    });
};