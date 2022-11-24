function getProfilePage(type: 'ally' | 'player') {
    return async function(world: string, id: string) {
        const response = await fetch(`https://br${world}.tribalwars.com.br/guest.php?screen=info_${type}&id=${id}`);
        return await response.text();
    };
};

export const getAllyProfilePage = getProfilePage('ally');
export const getPlayerProfilePage = getProfilePage('player');