import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CategoryChannel, ChannelType, Client, Guild, GuildBasedChannel, GuildChannel, GuildMember, MessageFlags, TextChannel } from "discord.js";
import { DHGMap } from "../map/DHGMap";
import { DHGPlayer } from "../actors/DHGPlayer";
import "dotenv/config";
import { DHGWeapon, DHGWeaponTemplates } from "../objects/DHGWeapon";
import { DHGObject } from "../objects/DHGObject";
import { DHGCell } from "../map/DHGCell";
import { DHGActor } from "../actors/DHGActor";

export enum DHGResponseCode {
    // PANIC
    UNKNOWN_ERROR = -1,
    // OXX good response
    OK = 0,
    // 1XX incomplete response
    // 2XX Discord Error
    // 3XX Manager Error
    MANAGER_CREATION_ERROR = 300,
    PLAYER_NOT_FOUND = 301,
    // 4XX Player & Actor Error
    ACTOR_CREATION_ERROR = 400,
    ACTOR_NOT_FOUND = 401,
    // 5XX Map, Cell Errors
    MAP_CREATION_ERROR = 500,
    CELL_CREATION_ERROR = 501,
    CELL_NOT_FOUND = 502,
    // 6XX Object, ObjectTemplate & LootTable Error
    OBJECT_CREATION_ERROR = 600,
    TEMPLATE_CREATION_ERROR = 601,
    LOOT_TABLE_CREATION_ERROR = 602,
    OBJECT_NOT_FOUND = 603,
    TEMPLATE_NOT_FOUND = 604,
    OBJECT_WRONG_TYPE = 605,
}

enum State {
    ERROR = -3,
    INIT = -2,
    PREPARED = -1,
    READY = 0,
    RUNNING = 1,
    PAUSED = 2,
    RESOLVING = 3,
    FINISHED = 4,
}

export class DHGGameManager {
    static managers:Map<string,DHGGameManager> = new Map();

    turn: Number = 0;
    state: Number = State.INIT;
    players: Map<string,DHGPlayer>;

    guildId:string;
    guild:Guild;

    adminCategoryChannel:CategoryChannel;
    playerCategoryChannel:CategoryChannel;
    cellsCategoryChannel:CategoryChannel;
    otherCategoryChannel:CategoryChannel;

    map:DHGMap;

    private constructor(guild:Guild, channels:{
            adminCategoryChannel:CategoryChannel,
            playerCategoryChannel:CategoryChannel,
            cellsCategoryChannel:CategoryChannel,
            otherCategoryChannel:CategoryChannel
        },map:DHGMap)
    {
        this.players = new Map<string,DHGPlayer>();
        this.map = map;
        this.state = State.PREPARED;

        this.guild = guild;
        this.guildId = guild.id;
        this.adminCategoryChannel = channels.adminCategoryChannel;
        this.playerCategoryChannel = channels.playerCategoryChannel;
        this.cellsCategoryChannel = channels.cellsCategoryChannel;
        this.otherCategoryChannel = channels.otherCategoryChannel;
        
        
        DHGGameManager.managers.set(guild.id, this);
    }

    //real constructor
    static async createManager(guild:Guild):Promise<void>{
        let adminChannel:CategoryChannel | undefined = guild.channels.cache.find((channel) => {return channel.type === ChannelType.GuildCategory && channel.name === 'dhg admin'}) as CategoryChannel;
        if(adminChannel === undefined){
            adminChannel = await guild.channels.create({
                name:'dhg admin',
                type:ChannelType.GuildCategory
            });
            guild.channels.create({
                name:"control-room",
                type:ChannelType.GuildText,
                parent:adminChannel
            });
        }else{
            if((adminChannel as CategoryChannel).children.cache.find((channel) => {return channel.name === 'control-room' && channel.type === ChannelType.GuildText}) === undefined){
                guild.channels.create({
                    name:"control-room",
                    type:ChannelType.GuildText,
                    parent:(adminChannel as CategoryChannel)
                });
            }
        }


        let playerChannel:CategoryChannel | undefined = guild.channels.cache.find((channel) => {return channel.type === ChannelType.GuildCategory && channel.name === 'dhg players'}) as CategoryChannel;
        if(playerChannel === undefined){
            playerChannel = await guild.channels.create({
                name:'dhg players',
                type:ChannelType.GuildCategory
            });
        }

        let cellsChannel:CategoryChannel | undefined = guild.channels.cache.find((channel) => {return channel.type === ChannelType.GuildCategory && channel.name === 'dhg cells'}) as CategoryChannel;
        if(cellsChannel === undefined){
            cellsChannel = await guild.channels.create({
                name:'dhg cells',
                type:ChannelType.GuildCategory
            });
        }

        let otherChannel:CategoryChannel | undefined = guild.channels.cache.find((channel) => {return channel.type === ChannelType.GuildCategory && channel.name === 'dhg general'}) as CategoryChannel;
        if(otherChannel === undefined){
            otherChannel = await guild.channels.create({
                name:'dhg general',
                type:ChannelType.GuildCategory
            });
            guild.channels.create({
                name:"broadcast",
                type:ChannelType.GuildText,
                parent:otherChannel
            });
        }else{
            if((otherChannel as CategoryChannel).children.cache.find((channel) => {return channel.name === 'broadcast' && channel.type === ChannelType.GuildText}) === undefined){
                guild.channels.create({
                    name:"broadcast",
                    type:ChannelType.GuildText,
                    parent:(otherChannel as CategoryChannel)
                });
            }
        }
        
        const channels = {
            adminCategoryChannel:adminChannel, 
            playerCategoryChannel:playerChannel, 
            cellsCategoryChannel:cellsChannel, 
            otherCategoryChannel:otherChannel
        }

        new DHGGameManager(guild, channels,await DHGMap.createMap(guild));
    }

    //send register buttons
    async sendInvitations(nbParticipants:bigint):Promise<void>{
        const everyoneRole = this.guild.roles.everyone;
        const teamSize = nbParticipants/(BigInt(12));
        let invitesChannel = this.guild.channels.cache.find((channel) => {return channel.name === 'invitations' && channel.type === ChannelType.GuildText}) as TextChannel;
        if(invitesChannel == undefined){invitesChannel = await this.guild.channels.create({
            name: 'invitations',
            type: ChannelType.GuildText,
            parent: this.otherCategoryChannel
        })}
        await invitesChannel.permissionOverwrites.create(process.env.CLIENT_ID as string,{ViewChannel:true});
        await invitesChannel.permissionOverwrites.create(everyoneRole,{ViewChannel:false})
        if(invitesChannel !== undefined){
            const rows:Map<string,ActionRowBuilder<ButtonBuilder>> = new Map();
            let row:ActionRowBuilder<ButtonBuilder>;
            for(let i:bigint = BigInt(0); i < nbParticipants; i++){
                row = new ActionRowBuilder<ButtonBuilder>();
                const team = (i/teamSize)+BigInt(1);
                const number = (i%teamSize)+BigInt(1);
                row.components.push(
                    new ButtonBuilder()
                        .setCustomId(`participant:${team}-${number}`)
                        .setLabel(`Register`)
                        .setStyle(ButtonStyle.Danger)
                )
                rows.set(`participant ${number} of District ${team}`,row)
            }
            //ensures the right order
            
            for(let row of rows){
                await invitesChannel.send({
                    content: row[0],
                    components: [row[1]],
                    flags: [MessageFlags.SuppressNotifications],
                })
            }
            await invitesChannel.send({
                content: `${this.guild.roles.everyone}` + 'Register for the Discord Hunger Games ! Blood and Glory awaits !',
                flags: [MessageFlags.SuppressNotifications],
            })
            await invitesChannel.permissionOverwrites.create(everyoneRole,{ViewChannel:true})
        }
    }

    //manager related
    static getManagerByGuild(guild:Guild){
        return this.managers.get(guild.id);
    }
    static getManagerByGuildId(guildId:string){
        return this.managers.get(guildId);
    }

    //Player related
    async registerPlayer(member:GuildMember, district?:number, participantNumber?: number): Promise<boolean>{
        if (this.players.get(member.id) === undefined) {
            const player = await DHGPlayer.createPlayer(member, this.guild as Guild);
            player.district = district;
            player.participantNumber = participantNumber;
            this.players.set(member.id, player);
            return true;
        }else{
            return new Promise<boolean>(() => {return false});
        }
    }
    private getPlayerById(memberId:string):DHGPlayer | undefined{
        return this.players.get(memberId);
    }
    movePlayer(playerId:string, destination:number | string)
            : DHGResponseCode.PLAYER_NOT_FOUND 
            | DHGResponseCode.CELL_NOT_FOUND 
            | DHGResponseCode.OK
            | DHGResponseCode.UNKNOWN_ERROR
    {
        const player = this.getPlayerById(playerId);
        if(player == undefined){return DHGResponseCode.PLAYER_NOT_FOUND;}
        var dest: DHGCell | undefined;
        switch(typeof destination){
            case "string":
                dest = player.location.getNeighborByDirection(destination);
            case "number":
                dest = this.map.getCellbyId(destination as number);
        }
        if(dest == undefined){return DHGResponseCode.CELL_NOT_FOUND;}
        this.guild.members.fetch(player.discordId as string).then((member) => {
            const oldRole = member.roles.cache.get(player.location.roleId)
            if(oldRole != undefined){
                member.roles.remove(oldRole);
            }
            player.move(dest as DHGCell);
            const newRole = member.roles.cache.get((dest as DHGCell).roleId)
            if(newRole != undefined){
                member.roles.add(newRole);
            }
        });

        return DHGResponseCode.OK;
    }
    equipPlayer(playerId:string, weaponId:string | number)
            : DHGResponseCode.OK
            | DHGResponseCode.UNKNOWN_ERROR
            | DHGResponseCode.PLAYER_NOT_FOUND
            | DHGResponseCode.TEMPLATE_NOT_FOUND
            | DHGResponseCode.OBJECT_NOT_FOUND
            | DHGResponseCode.OBJECT_WRONG_TYPE
    {
        const player = this.getPlayerById(playerId);
        if(player == undefined){return DHGResponseCode.PLAYER_NOT_FOUND;}
        var weapon:DHGObject | undefined;
        switch(typeof weaponId){
            case "string":
                const weaponBuilder = DHGWeaponTemplates.getTemplate(weaponId);
                if(weaponBuilder == undefined){return DHGResponseCode.TEMPLATE_NOT_FOUND}
                weapon = weaponBuilder.build();
                player.equip(weapon as DHGWeapon);
                return DHGResponseCode.OK;
            case "number":
                weapon = DHGObject.getObjectById(weaponId);
                if(weapon == undefined){return DHGResponseCode.OBJECT_NOT_FOUND}
                if(!(weapon instanceof DHGWeapon)){return DHGResponseCode.OBJECT_WRONG_TYPE}
                player.equip(weapon as DHGWeapon)
                return DHGResponseCode.OK;
            default: 
                return DHGResponseCode.UNKNOWN_ERROR
        }
    }
    manageAttack(attackerId:number, defenderId:number)
            : DHGResponseCode.OK
            | DHGResponseCode.UNKNOWN_ERROR
            | DHGResponseCode.ACTOR_NOT_FOUND
    {   
        let attacker = DHGActor.getActorById(attackerId);
        if(attacker == undefined){return DHGResponseCode.ACTOR_NOT_FOUND}
        let defender = DHGActor.getActorById(defenderId);
        if(defender == undefined){return DHGResponseCode.ACTOR_NOT_FOUND}
        
        return DHGResponseCode.UNKNOWN_ERROR;
    }

    // Map related

}