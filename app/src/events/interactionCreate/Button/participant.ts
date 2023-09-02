import { ButtonInteraction, CacheType, Guild, GuildMember } from "discord.js";
import { ButtonHandler } from "./ButtonHandler";
import { DHGManager } from "../../../classes/DHGManager";


export class participant extends ButtonHandler{
    handler: (interaction: ButtonInteraction<CacheType>) => void = (interaction: ButtonInteraction) => {
        interaction.deferReply({ephemeral: true})
        const participantIdentifier = interaction.customId.split(":")[1].split("-");
        const district = Number(participantIdentifier[0]);
        const participantNumber = Number(participantIdentifier[1]);
        const manager = DHGManager.getManagerByGuildId(interaction.guild?.id as string);
        if (manager === undefined){interaction.reply({ephemeral:true, content:'could not find a manager for this game, try DHG init'}); return}
        manager.registerPlayer(interaction.member as GuildMember, district, participantNumber).then((success) => {
            if(success){
                interaction.editReply({ content:'you are now registered'});
                interaction.message.edit({ content: interaction.message.content + " : <@" + interaction.member + ">", components:[]});
            }else{
                interaction.editReply({ content:'you are already registered'});
            }
        });
    }
}