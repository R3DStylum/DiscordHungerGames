import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder, ChatInputCommandInteraction, CacheType, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandBuilder, SlashCommandUserOption, SlashCommandStringOption } from "discord.js";
import { Command } from "./Command";


export class dhg extends Command{

    builder = new SlashCommandBuilder()
        .setName('dhg')
        .setDescription('commands related to the user/player side of the discord hunger games bot')
        .addSubcommandGroup(new SlashCommandSubcommandGroupBuilder()
            .setName('action')
            .setDescription('commands related to single actions players can take in the game')
            .addSubcommand(new SlashCommandSubcommandBuilder()
                .setName('attack')
                .setDescription('attack a playeur if you perceive him')
                .addUserOption(new SlashCommandUserOption()
                    .setName('target')
                    .setDescription('the player targeted by the attack')
                )
            ).addSubcommand(new SlashCommandSubcommandBuilder()
                .setName('move')
                .setDescription('move on the board in a direction')
                .addStringOption(new SlashCommandStringOption()
                    .setName('direction')
                    .setDescription('the direction you wish to move in')
                    .addChoices(
                        { name: "north", value: "north"},
                        { name: "west", value: "west"},
                        { name: "east", value: "east"},
                        { name: "south", value: "south"},
                    )
                    .setRequired(true)
                )
            )
        ).addSubcommandGroup(new SlashCommandSubcommandGroupBuilder()
            .setName('actions')
            .setDescription('commands related to manipulating multiple actions players can take in the game')
            .addSubcommand(new SlashCommandSubcommandBuilder()
                .setName('summary')
                .setDescription('see the actions you have planned for the turn')
            )
        );

    handler: (interaction: ChatInputCommandInteraction<CacheType>) => void = (interaction: ChatInputCommandInteraction) => {

    };
    
}