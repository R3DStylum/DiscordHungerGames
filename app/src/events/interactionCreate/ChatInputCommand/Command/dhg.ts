import { SlashCommandBuilder, ChatInputCommandInteraction, CacheType, SlashCommandSubcommandBuilder } from "discord.js";
import { Command } from "./Command";
import { DHGManager } from "../../../../classes/DHGManager";

export class Dhg extends Command{
    builder = new SlashCommandBuilder()
        .setName('dhg')
        .addSubcommand( new SlashCommandSubcommandBuilder()
            .setName('init')
            .setDescription('Initializes the discord hunger games game')
        );


    handler: (interaction: ChatInputCommandInteraction<CacheType>) => void = (interaction:ChatInputCommandInteraction) => {
        DHGManager.initActiveManager();
    };
    
}