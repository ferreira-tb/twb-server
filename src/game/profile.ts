export async function getPlayerProfilePage(world: string, id: string) {
    const response = await fetch(`https://br${world}.tribalwars.com.br/guest.php?screen=info_player&id=${id}`);
    return await response.text();
};