import { SlashCommandBuilder, ChatInputCommandInteraction, CacheType, SlashCommandSubcommandBuilder, Guild, SlashCommandSubcommandGroupBuilder, SlashCommandNumberOption, ApplicationCommandOptionBase, SlashCommandUserOption, GuildMember, SlashCommandStringOption, APIApplicationCommandStringOption, APIApplicationCommandOptionChoice } from "discord.js";
import { Command } from "./Command";
import { DHGManager } from "../../../../classes/DHGManager";
import { DHGCell } from "../../../../classes/DHGCell";
import { DHGWeapon, DHGWeaponTemplates } from "../../../../classes/objects/DHGWeapon";

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
        ).addSubcommand(new SlashCommandSubcommandBuilder()
            .setName('move')
            .setDescription('moves a player to a cell')
            .addUserOption(new SlashCommandUserOption()
                .setName('player')
                .setDescription('the player you want to move')
                .setRequired(true)
            ).addNumberOption(new SlashCommandNumberOption()
                .setName('cellid')
                .setDescription('the id of the cell the player should be moved to')
                .setRequired(true)
            )
        ).addSubcommand(new SlashCommandSubcommandBuilder()
            .setName('equip')
            .setDescription('equips a player with a weapon')
            .addUserOption(new SlashCommandUserOption()
                .setName('player')
                .setDescription('the player you want to move')
                .setRequired(true)
            ).addStringOption(new SlashCommandStringOption()
                .setName('weapon')
                .setDescription('the weapon to equip the player with')
                .setRequired(true)
                .addChoices(...Array.from(DHGWeaponTemplates.allTemplates.keys()).map<APIApplicationCommandOptionChoice<string>>((element) => {return {name:element, value:element}}))
            )
        );


    handler: (interaction: ChatInputCommandInteraction<CacheType>) => void = (interaction:ChatInputCommandInteraction) => {
        console.log('DHG received command');

        //command init
        if(interaction.options.getSubcommand() === 'init'){
            interaction.deferReply();
            DHGManager.createManager(interaction.guild as Guild).then(()=>{
                interaction.editReply({content: "DHG Initiated"})
            })
        }

        //cleanup subgroup
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

        //command sendinvites
        if(interaction.options.getSubcommand() === 'sendinvites'){
            interaction.deferReply();
            const manager = DHGManager.getManagerByGuildId(interaction.guild?.id as string);
            manager?.sendInvitations(BigInt(interaction.options.getNumber('participants',true))).then(()=> {
                interaction.editReply({content: "all invitations sent, check channel invitations"});
            });
        }

        //group see
        if(interaction.options.getSubcommandGroup() === 'see'){
            if(interaction.options.getSubcommand() === 'players'){
                const manager = DHGManager.getManagerByGuildId(interaction.guild?.id as string);
                if(manager === undefined){interaction.reply({ephemeral: true, content:'could not find manager for your server'}); return}
                interaction.deferReply({ephemeral:false}).then(() => {
                    let content = "";
                    manager.players.forEach((player) => content += player.fullDescription());
                    interaction.editReply({content: content})
                });
                return;
            }
        }

        //command move
        if(interaction.options.getSubcommand() === 'move'){
            const manager = DHGManager.getManagerByGuildId(interaction.guild?.id as string);
            if(manager === undefined){interaction.reply({ephemeral: true, content:'could not find manager for your server'}); return}
            const player = manager.getPlayer(interaction.options.getMember('player') as GuildMember);
            const cell = manager.map.getCellbyId(interaction.options.getNumber('cellid') as number);
            if(player != undefined && cell != undefined){
                player.location = cell;
                interaction.reply({content: "player " + player.mention() + " moved to cell " + cell.cellId})
                return;
            };
            interaction.reply({content: "failed to move player " + player + " to cell " + cell})
        }

        if(interaction.options.getSubcommand() === 'equip'){
            const manager = DHGManager.getManagerByGuildId(interaction.guild?.id as string);
            if(manager === undefined){interaction.reply({ephemeral: true, content:'could not find manager for your server'}); return;}
            const player = manager.getPlayer(interaction.options.getMember('player') as GuildMember);
            if(player == undefined){interaction.reply({ephemeral:true, content: "You are not registered"});return;}
            const weapon = DHGWeaponTemplates.getTemplate(interaction.options.getString('weapon',true))?.build();
            if(weapon == undefined){interaction.reply({ephemeral: true, content:"could not find mentined weapon : " + interaction.options.getString('weapon',true)})}
            player.equip(weapon as DHGWeapon);
            interaction.reply({content: `${player.mention()} has been equipped with ${(weapon as DHGWeapon).name}`});
        }
    };
    
}