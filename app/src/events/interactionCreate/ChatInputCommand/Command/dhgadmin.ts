import { SlashCommandBuilder, ChatInputCommandInteraction, CacheType, SlashCommandSubcommandBuilder, Guild, SlashCommandSubcommandGroupBuilder, SlashCommandNumberOption, ApplicationCommandOptionBase, SlashCommandUserOption, GuildMember, SlashCommandStringOption, APIApplicationCommandStringOption, APIApplicationCommandOptionChoice } from "discord.js";
import { Command } from "./Command";
import { DHGManager, DHGResponseCode } from "../../../../classes/DHGManager";
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
            ).addSubcommand(new SlashCommandSubcommandBuilder()
                .setName('players')
                .setDescription('cleans up everything related with the players')
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
            return;
        }

        const manager = DHGManager.getManagerByGuildId(interaction.guild?.id as string);
        if(manager === undefined){interaction.reply({ephemeral: true, content:'could not find manager for your server'}); return;}

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
            manager?.sendInvitations(BigInt(interaction.options.getNumber('participants',true))).then(()=> {
                interaction.editReply({content: "all invitations sent, check channel invitations"});
            });
        }

        //group see
        if(interaction.options.getSubcommandGroup() === 'see'){
            if(interaction.options.getSubcommand() === 'players'){
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
            const playerId = (interaction.options.getMember('player') as GuildMember).id;
            const cellId = interaction.options.getNumber('cellid',true) as number;
            switch(manager.movePlayer(playerId,cellId)){
                case DHGResponseCode.PLAYER_NOT_FOUND:
                    interaction.reply({ephemeral: true, content:"Failed to move player, player is not registered"});
                    return;
                case DHGResponseCode.CELL_NOT_FOUND:
                    interaction.reply({ephemeral: true, content:"Failed to move player, cell doesn't exist"});
                    return;
                case DHGResponseCode.OK:
                    interaction.reply({content: `moved player <@${playerId}> to cell ${cellId}`});
                    return;
                default:
                    interaction.reply({ephemeral: true, content: "command failed"});
                    return;
            }
        }

        if(interaction.options.getSubcommand() === 'equip'){
            const playerId = (interaction.options.getMember('player') as GuildMember).id;
            const weapon = interaction.options.getString('weapon',true);
            if(weapon == undefined){interaction.reply({ephemeral: true, content:"could not find mentioned weapon : " + interaction.options.getString('weapon',true)})}
            switch(manager.equipPlayer(playerId,weapon)){    
                case DHGResponseCode.OK:
                    interaction.reply({content: `gave <@${playerId}> weapon ${weapon}`});
                    return;
                case DHGResponseCode.PLAYER_NOT_FOUND:
                    interaction.reply({ephemeral:true, content:"failed to give player weapon, player is not registered"});
                    return;
                case DHGResponseCode.OBJECT_NOT_FOUND:
                    interaction.reply({ephemeral:true, content:"failed to give player weapon, Object does not exist"});
                    return;
                case DHGResponseCode.TEMPLATE_NOT_FOUND:
                    interaction.reply({ephemeral:true, content:"failed to give player weapon, Object template not found"});
                    return;
                case DHGResponseCode.OBJECT_WRONG_TYPE:
                    interaction.reply({ephemeral:true, content:"failed to give player weapon, Object if of the wrong type"});
                    return;
                default:
                    interaction.reply({ephemeral: true, content: "command failed"});
                    return;
            }
        }
    };
    
}