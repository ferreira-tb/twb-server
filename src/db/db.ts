import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite',
    logging: false
});

const dbList = ['./models/village.js'];

Promise.all(dbList.map(db => import(db)))
    .then(() => sequelize.sync({ alter: true }))
    .catch((err) => console.log(err));