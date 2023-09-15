import { SlashCommandBuilder, ChatInputCommandInteraction, CacheType, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandBuilder, SlashCommandUserOption, SlashCommandStringOption, SlashCommandNumberOption, GuildMember } from "discord.js";
import { Command } from "./Command";
import { DHGManager, DHGResponseCode } from "../../../../classes/DHGManager";
import { DHGWeapon } from "../../../../classes/objects/DHGWeapon";


export class dhg extends Command{

    builder = new SlashCommandBuilder()
        .setName('dhg')
        .setDescription('commands related to the user/player side of the discord hunger games bot')
        .addSubcommandGroup(new SlashCommandSubcommandGroupBuilder()
            .setName('action')
            .setDescription('commands related to single actions players can take in the game')
            .addSubcommand(new SlashCommandSubcommandBuilder()
                .setName('camp')
                .setDescription('pass your turn to camp')
            )
            .addSubcommand(new SlashCommandSubcommandBuilder()
                .setName('attack')
                .setDescription('attack a playeur if you perceive him')
                .addUserOption(new SlashCommandUserOption()
                    .setName('target')
                    .setDescription('the player targeted by the attack')
                    .setRequired(true)
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
                        { name: "southwest", value: "southwest"},
                        { name: "southeast", value: "southeast"},
                        { name: "southsouth", value: "southsouth"}
                    )
                    .setRequired(true)
                )
            ).addSubcommand(new SlashCommandSubcommandBuilder()
                .setName('chase')
                .setDescription('chase after a player')
                .addUserOption(new SlashCommandUserOption()
                    .setName('target')
                    .setDescription('the player you wish to chase')
                )
            ).addSubcommand(new SlashCommandSubcommandBuilder()
                .setName('search')
                .setDescription('search for useful items')
            ).addSubcommand(new SlashCommandSubcommandBuilder()
                .setName('self-care')
                .setDescription('use an item, replenish your food or water if you want it')
                .addNumberOption(new SlashCommandNumberOption()
                    .setName('drink')
                    .setDescription('the inventory slot if the item you want to drink(consume a water item to replenish hydration)')
                ).addNumberOption(new SlashCommandNumberOption()
                    .setName('eat')
                    .setDescription('the inventory slot if the item you want to eat(consume a food item to replenish satiety)')
                ).addNumberOption(new SlashCommandNumberOption()
                    .setName('use')
                    .setDescription('the inventory slot if the item you want to use')
                )
            ).addSubcommand(new SlashCommandSubcommandBuilder()
                .setName('hide')
                .setDescription('hide from other players so you cannot be targeted')
            ).addSubcommand(new SlashCommandSubcommandBuilder()
                .setName('seek')
                .setDescription('searches the area for players')
            )
        ).addSubcommandGroup(new SlashCommandSubcommandGroupBuilder()
            .setName('actions')
            .setDescription('commands related to manipulating multiple actions players can take in the game')
            .addSubcommand(new SlashCommandSubcommandBuilder()
                .setName('summary')
                .setDescription('see the actions you have planned for the turn')
            )
        ).addSubcommand(new SlashCommandSubcommandBuilder()
            .setName('info')
            .setDescription('gives info about yourself')
        );

    handler: (interaction: ChatInputCommandInteraction<CacheType>) => void = (interaction: ChatInputCommandInteraction) => {
        const manager = DHGManager.getManagerByGuildId(interaction.guild?.id as string);
        if(manager === undefined){interaction.reply({ephemeral:true, content: "could not find a manager for this server. have you done /dhgadmin init ?"});return;}
        if(interaction.options.getSubcommandGroup() === 'action'){
            const playerId = (interaction.options.getMember('player') as GuildMember).id;
            const dest = interaction.options.getString('direction',true);
            if(interaction.options.getSubcommand() === 'move'){
                switch(manager.movePlayer(playerId, dest)){
                case DHGResponseCode.PLAYER_NOT_FOUND:
                    interaction.reply({ephemeral: true, content:"Failed to move player, player is not registered"});
                    return;
                case DHGResponseCode.CELL_NOT_FOUND:
                    interaction.reply({ephemeral: true, content:"Failed to move player, cell doesn't exist"});
                    return;
                case DHGResponseCode.OK: 
                    interaction.reply({content: `moved player <@${playerId}> to cell ${dest}`});
                    return;
                default:
                    interaction.reply({ephemeral: true, content: "command failed"});
                    return;
                }
            }
            if(interaction.options.getSubcommand() === 'attack'){
                const target = manager.getPlayerById((interaction.options.getMember('target') as GuildMember).id);
                if(target === undefined){interaction.reply({ephemeral:true, content: "The player you are targeting doesn't exist (is not registered)"});return;}
                if(player.equipped == undefined){
                    const weapon:DHGWeapon = DHGWeapon.defaultWeapon;
                    if(!player.canAttack(target)){interaction.reply({content:`you don't have the range to do that`});return;}
                    const successes = player.attack(target,manager);
                    interaction.reply(`attack on ${target.mention()} with ${weapon.name} succeeded ${successes} times out of ${weapon.attacks}`)
                }else{
                    if(!player.canAttack(target)){interaction.reply({content:`you don't have the range to do that`});return;}
                    const successes = player.attack(target,manager);
                    interaction.reply(`attack on ${target.mention()} with ${player.equipped.name} succeeded ${successes} times out of ${player.equipped.attacks}`)
                }
            }
        }
        if(interaction.options.getSubcommand() === 'info'){
            interaction.reply(player.selfInfo());
        }
    };
    
}