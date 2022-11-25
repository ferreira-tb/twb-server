import config from '../../config.json' assert { type: 'json' };
import type Express from 'express';
import { deployAllyGetters } from './ally.js';
import { deployGameGetters } from './game.js';
import { deployInterfaceGetters } from './interface.js';
import { deployPlayerGetters } from './player.js';
import { deployVillageGetters } from './village.js';

export function verifyWorld(request: Express.Request, response: Express.Response, next: Express.NextFunction) {
    const world = request.params.world;
    if (!config.worlds.includes(world)) {
        response.status(404).end();
        return;
    };

    next();
};

export function deployGetters() {
    deployAllyGetters();
    deployGameGetters();
    deployInterfaceGetters();
    deployPlayerGetters();
    deployVillageGetters();
};