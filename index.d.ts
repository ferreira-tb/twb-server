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
    | `interface.php?func=conquer_extended&since=${string}`
    | 'interface.php?func=get_config'
    | 'interface.php?func=get_unit_info'
    | 'interface.php?func=get_building_info';

type WorldInterfaceURL = `${WorldURL}${WorldInterface}`;