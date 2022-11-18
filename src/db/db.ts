import { Sequelize } from 'sequelize';
import { VillageModel } from './models/village.js';
import * as attributes from './attributes.js';

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite',
    logging: false
});

VillageModel.init(attributes.village, {
    sequelize,
    tableName: 'villages_116'
});

await sequelize.sync();
await VillageModel.updateDatabase();