import { SlashCommandBuilder, ChatInputCommandInteraction, CacheType, SlashCommandSubcommandBuilder, Guild, SlashCommandSubcommandGroupBuilder, SlashCommandNumberOption, ApplicationCommandOptionBase } from "discord.js";
import { Command } from "./Command";
import { DHGManager } from "../../../../classes/DHGManager";
import { DHGCell } from "../../../../classes/DHGCell";

export class dhg extends Command{
    //everything in lowercase ya bastard
    //and descriptions everywhere you can
    builder = new SlashCommandBuilder()
        .setName('dhg')
        .setDescription('commands relative to the discord hunger games bot')
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
            .setName('sendinvite')
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
        );


    handler: (interaction: ChatInputCommandInteraction<CacheType>) => void = (interaction:ChatInputCommandInteraction) => {
        console.log('DHG received command \n' + interaction);
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
                interaction.deferReply({ephemeral: true});
                DHGCell.cleanupCells(interaction.guild as Guild);
            }
        }
        if(interaction.options.getSubcommand() === 'sendinvite'){
            console.log('trying to send invite');
            let manager = DHGManager.getManagerByGuild(interaction.guild as Guild);
            console.log('manager is ' + manager);
            manager = DHGManager.getManagerByGuildId(interaction.guild?.id as string);
            console.log('manager is ' + manager);
            manager?.sendInvitation(BigInt(interaction.options.getNumber('participants',true)));
        }
    };
    
}