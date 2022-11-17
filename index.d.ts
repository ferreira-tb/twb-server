type WorldURL = `https://br${string}.tribalwars.com.br/`;

type WorldDataType = 'village' | 'ally' | 'player' | 'conquer';

type WorldKillType =
    | 'kill_att'
    | 'kill_def'
    | 'kill_sup'
    | 'kill_all'
    | 'kill_att_tribe'
    | 'kill_def_tribe'
    | 'kill_all_tribe';

type WorldDataURL = `${WorldURL}map/${WorldDataType | WorldKillType}.txt`;

type WorldFunctions =
    | 'interface.php?func=get_conquer&since=unix_timestamp'
    | 'interface.php?func=get_config'
    | 'interface.php?func=get_unit_info'
    | 'interface.php?func=get_building_info';

type WorldFunctionsURL = `${WorldURL}${WorldFunctions}`;