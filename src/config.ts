import * as fs from 'node:fs/promises';

class TWBServerConfig {
    readonly worlds = ['115', '116'];

    public stringify() {
        return JSON.stringify(this);
    };
};

async function setConfig() {
    const configPath = 'config.json';
    const defaultConfig = new TWBServerConfig().stringify();

    try {
        await fs.access(configPath, fs.constants.R_OK);        
    } catch {
        await fs.writeFile(configPath, defaultConfig, { encoding: 'utf8', mode: 0o666 });
    };
};

setConfig().catch(err => console.log(err));