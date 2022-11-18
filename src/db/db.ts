import { Sequelize } from 'sequelize';
import { VillageModel } from './models/village.js';
import * as attributes from './attributes.js';

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite',
    logging: false
});

export async function start() {
    VillageModel.init(attributes.village, {
        sequelize,
        tableName: 'villages_116'
    });
    
    await sequelize.sync();
    VillageModel.updateDatabase().then(() => {
        setInterval(() => {
            VillageModel.updateDatabase()
                .catch(err => console.log(err));
        }, 3600000 * 1.2);
    });
};