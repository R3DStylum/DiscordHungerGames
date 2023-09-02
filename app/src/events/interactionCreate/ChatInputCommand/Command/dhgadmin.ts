import { SlashCommandBuilder, ChatInputCommandInteraction, CacheType, SlashCommandSubcommandBuilder, Guild, SlashCommandSubcommandGroupBuilder, SlashCommandNumberOption, ApplicationCommandOptionBase } from "discord.js";
import { Command } from "./Command";
import { DHGManager } from "../../../../classes/DHGManager";
import { DHGCell } from "../../../../classes/DHGCell";

export class dhgadmin extends Command{
    //everything in lowercase ya bastard (except in descriptions tho)
    //and descriptions everywhere you can
    builder = new SlashCommandBuilder()
        .setName('dhgadmin')
        .setDescription('commands relative to the administrative side of the discord hunger games bot')
        .addSubcommand( new SlashCommandSubcommandBuilder()
            .setName('init')
            .setDescription('Initializes the discord hunger games game')
        ).addSubcommandGroup(new SlashCommandSubcommandGroupBuilder()
            .setName('cleanup')
            .setDescription('Group of commands relative to cleaning up after a game')
            .addSubcommand(new SlashCommandSubcommandBuilder()
                .setName('cells')
                .setDescription('cleans up the cell channels and roles from the server')
            ).addSubcommand(new SlashCommandSubcommandBuilder()
                .setName('all')
                .setDescription('cleans up everything related with the DHGBot')
            ).addSubcommand(new SlashCommandSubcommandBuilder()
                .setName('admin')
                .setDescription('cleans up everything related with the admin of dhg (dhg categories and dhg general)')
            )
        ).addSubcommand(new SlashCommandSubcommandBuilder()
            .setName('sendinvites')
            .setDescription('sends the invitation for the players to subscribe')
            .addNumberOption(new SlashCommandNumberOption()
                .setRequired(true)
                .setName('participants')
                .setDescription('Sets the number of participants')
                .addChoices(
                    { name: "12", value: 12 },
                    { name: "24", value: 24 }
                )
            )
        ).addSubcommandGroup(new SlashCommandSubcommandGroupBuilder()
            .setName('see')
            .setDescription('displays information on various parts of the currant game')
            .addSubcommand(new SlashCommandSubcommandBuilder()
                .setName('players')
                .setDescription('displays info about all the players in the game')
            )
        );


    handler: (interaction: ChatInputCommandInteraction<CacheType>) => void = (interaction:ChatInputCommandInteraction) => {
        console.log('DHG received command');
        if(interaction.options.getSubcommand() === 'init'){
            DHGManager.createManager(interaction.guild as Guild);
            interaction.reply('DHG Initiated');
        }
        if(interaction.options.getSubcommandGroup() === 'cleanup'){
            if(interaction.options.getSubcommand() === 'cells'){
                interaction.deferReply({ephemeral: true}).then(() => {
                    return DHGCell.cleanupCells(interaction.guild as Guild)
                }).then(() => {
                    interaction.editReply({content:"Everything cell related cleaned"})
                });
            }
            if(interaction.options.getSubcommand() === 'all'){
                interaction.deferReply({ephemeral: true}).then(() => {
                    return DHGCell.cleanupCells(interaction.guild as Guild)
                }).then(() => {
                    interaction.editReply({content:"Everything cell related cleaned"})
                });
            }
        }
        if(interaction.options.getSubcommand() === 'sendinvites'){
            console.log('trying to send invite');
            const manager = DHGManager.getManagerByGuildId(interaction.guild?.id as string);
            manager?.sendInvitation(BigInt(interaction.options.getNumber('participants',true)));
        }
        if(interaction.options.getSubcommandGroup() === 'see'){
            if(interaction.options.getSubcommand() === 'players'){
                const manager = DHGManager.getManagerByGuildId(interaction.guild?.id as string);
                if(manager === undefined){interaction.reply({ephemeral: true, content:'could not find manager for your server'}); return}
                interaction.deferReply({ephemeral:false}).then(() => {
                    let content = "";
                    for (const player of manager.players) {
                       content += player.fullDescription();
                    }
                    interaction.editReply({content: content})
                })
            }
        }
    };
    
}