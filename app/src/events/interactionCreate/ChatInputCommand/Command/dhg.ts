import { SlashCommandBuilder, ChatInputCommandInteraction, CacheType, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandBuilder, SlashCommandUserOption, SlashCommandStringOption, SlashCommandNumberOption, GuildMember } from "discord.js";
import { Command } from "./Command";
import { DHGManager } from "../../../../classes/DHGManager";
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
        if(interaction.options.getSubcommandGroup() === 'action'){
            const manager = DHGManager.getManagerByGuildId(interaction.guild?.id as string);
            if(manager === undefined){interaction.reply({ephemeral:true, content: "could not find a manager for this server. have you done /dhgadmin init ?"});return;}
            const player = manager.getPlayerById(interaction.user.id)
            if(player === undefined){interaction.reply({ephemeral:true, content: "You are not registered"});return;}
            
            if(interaction.options.getSubcommand() === 'move'){
                const dest = player.location.getNeighborByDirection(interaction.options.getString('direction') as string);
                if(dest != undefined){
                    player.move(dest);
                    interaction.reply({ephemeral:true, content:"you moved !"});
                }else{
                    interaction.reply({ephemeral:true, content:"Move failed. check if the direction you are moving to is right"});
                }
            }
            if(interaction.options.getSubcommand() === 'attack'){
                const target = manager.getPlayerById((interaction.options.getMember('target') as GuildMember).id);
                if(target === undefined){interaction.reply({ephemeral:true, content: "The player you are targeting doesn't exist (is not registered)"});return;}
                if(player.equipped == undefined){
                    const weapon:DHGWeapon = DHGWeapon.defaultWeapon;
                    const successes = weapon.resolveAttack(player, target, manager);
                    interaction.reply(`attack on ${target.mention()} succeeded ${successes} times on ${weapon.attacks}`)
                }else{
                    const successes = player.equipped.resolveAttack(player,target, manager);
                    interaction.reply(`attack on ${target.mention()} succeeded ${successes} times on ${player.equipped.attacks}`)
                }
            }
        }
        if(interaction.options.getSubcommand() === 'info'){
            const manager = DHGManager.getManagerByGuildId(interaction.guild?.id as string);
            if(manager === undefined){interaction.reply({ephemeral:true, content: "could not find a manager for this server. have you done /dhgadmin init ?"});return;}
            const player = manager.getPlayerById(interaction.user.id)
            if(player === undefined){interaction.reply({ephemeral:true, content: "You are not registered"});return;}
            interaction.reply(player.selfInfo());
        }
    };
    
}