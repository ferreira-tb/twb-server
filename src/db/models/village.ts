import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';
import config from '../../../config.json' assert { type: 'json' };

class Village {
    readonly id: number;
    readonly name: string;
    readonly x: number;
    readonly y: number;
    readonly player: number;
    readonly points: number;
    readonly type: number;

    constructor(data: string[]) {
        this.id = Number.parseInt(data[0], 10);
        this.name = decodeURIComponent(data[1].replace(/\+/g, ' '));
        this.x = Number.parseInt(data[2], 10);
        this.y = Number.parseInt(data[3], 10);
        this.player = Number.parseInt(data[4], 10);
        this.points = Number.parseInt(data[5], 10);
        this.type = Number.parseInt(data[6], 10)
    };
};

class VillageModels {
    [index: string]: any;

    constructor() {
        config.worlds.forEach((world) => {
            this[world] = VillageModels.defineModel(world);
        });
    };

    private static async *fetchVillageData() {
        /*const worldURL: WorldURL = `https://br${world}.tribalwars.com.br/`;
        const villageDataURL: WorldDataURL = `${worldURL}map/village.txt`;*/

        try {
            const villageData = await fetch('http://127.0.0.1:3000/api/village');
            const rawText = await villageData.text();

            const villages = rawText.split(/\r?\n/);
            for (const village of villages) {
                yield village.split(',');;
            };

        } catch (err) {
            console.log(err);
            throw err;
        };
    };

    public static async updateDatabase(world: string) {
        for await (const rawData of this.fetchVillageData()) {
            await new Promise<void>((resolve, reject) => {
                // Ignora a aldeia caso haja algum dado inválido.
                if (rawData.some(item => !item)) return resolve();

                if (!models[world]) return reject(new ReferenceError(`Não existe modelo para o mundo ${world}.`));
                models[world].create(new Village(rawData))
                    .then(() => resolve())
                    .catch((err: unknown) => reject(err));
            });
        };
    };

    public static defineModel(world: string) {
        const validate = { isInt: true };
        return sequelize.define(`villages_${world}`, {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: true,
                primaryKey: true,
                validate
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            x: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate
            },
            y: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate
            },
            player: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate
            },
            points: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate
            },
            type: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate
            }
        }, {
            freezeTableName: true
        });
    };
};

const models = new VillageModels();
VillageModels.updateDatabase('115');