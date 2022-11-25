import type { AllyModel } from "./src/db/models/ally";
import type { ConquerModel } from "./src/db/models/conquer";
import type { PlayerModel } from "./src/db/models/player";
import type { VillageModel } from "./src/db/models/village";

type WorldURL = `https://br${string}.tribalwars.com.br/`;

type WorldDataType = 'village' | 'ally' | 'player' | 'conquer' | 'conquer_extended';

type WorldKillType =
    | 'kill_att'
    | 'kill_def'
    | 'kill_sup'
    | 'kill_all'
    | 'kill_att_tribe'
    | 'kill_def_tribe'
    | 'kill_all_tribe';

type AllWorldFileTypes = WorldDataType | WorldKillType;

type WorldDataURL = `${WorldURL}map/${AllWorldFileTypes}.txt`;

type WorldInterface =
    | `interface.php?func=get_conquer&since=${string}`
    | `interface.php?func=get_conquer_extended&since=${string}`
    | 'interface.php?func=get_config'
    | 'interface.php?func=get_unit_info'
    | 'interface.php?func=get_building_info';

type WorldInterfaceURL = `${WorldURL}${WorldInterface}`;

type DBModel =
    | typeof AllyModel
    | typeof ConquerModel
    | typeof PlayerModel
    | typeof VillageModel;
    
type TableMap = Map<`${WorldDataType}_${string}`, DBModel>;