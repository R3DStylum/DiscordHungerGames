import { SlashCommandBuilder, ChatInputCommandInteraction, CacheType, SlashCommandSubcommandBuilder } from "discord.js";
import { Command } from "./Command";
import { DHGManager } from "../../../../classes/DHGManager";

export class dhg extends Command{
    builder = new SlashCommandBuilder()
        .setName('dhg')
        .setDescription('commands relative to the discord hunger games bot')
        .addSubcommand( new SlashCommandSubcommandBuilder()
            .setName('init')
            .setDescription('Initializes the discord hunger games game')
        );


    handler: (interaction: ChatInputCommandInteraction<CacheType>) => void = (interaction:ChatInputCommandInteraction) => {
        console.log('DHG received command');
        if(interaction.options.getSubcommand() === 'init'){
            //DHGManager.initActiveManager();
            interaction.reply('DHG Initiated')
        }
    };
    
}