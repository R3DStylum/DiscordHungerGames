import { ButtonInteraction, CacheType, Guild, GuildMember } from "discord.js";
import { ButtonHandler } from "./ButtonHandler";
import { DHGPlayer } from "../../../classes/DHGPlayer";
import { DHGManager } from "../../../classes/DHGManager";


export class participant extends ButtonHandler{
    handler: (interaction: ButtonInteraction<CacheType>) => void = (interaction: ButtonInteraction) => {
        const participantIdentifier = interaction.customId.split(":")[1].split("-");
        DHGPlayer.createPlayer(interaction.member as GuildMember, interaction.guild as Guild)
        .then((player:DHGPlayer) => {
            DHGManager.getManagerByGuildId(interaction.guild?.id as string)?.players.push(player);
            const row = interaction.message.components.find((actionrow) => {
                return actionrow.components.find((button) => {
                    return button.customId == interaction.customId;
                }) != undefined;
            })
        })
    }
}