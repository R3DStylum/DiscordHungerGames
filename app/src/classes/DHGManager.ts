import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CategoryChannel, ChannelType, Client, Guild, GuildBasedChannel, GuildChannel, GuildMember, MessageFlags, TextChannel } from "discord.js";
import { DHGMap } from "./DHGMap";
import { DHGPlayer } from "./DHGPlayer";
import "dotenv/config";
import { DHGError } from "./Errors/DHGError";

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

export class DHGManager {
    static managers:Map<string,DHGManager> = new Map();

    turn: Number = 0;
    state: Number = State.INIT;
    players: Map<string,DHGPlayer>;

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
        this.adminCategoryChannel = channels.adminCategoryChannel;
        this.playerCategoryChannel = channels.playerCategoryChannel;
        this.cellsCategoryChannel = channels.cellsCategoryChannel;
        this.otherCategoryChannel = channels.otherCategoryChannel;
        
        
        DHGManager.managers.set(guild.id, this);
    }

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

        new DHGManager(guild, channels,await DHGMap.createMap(guild));
    }

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
                content: `<@${this.guild.roles.everyone}>` + 'Register for the Discord Hunger Games ! Blood and Glory awaits !',
            })
            await invitesChannel.permissionOverwrites.create(everyoneRole,{ViewChannel:false})
        }
    }

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

    getPlayer(member:GuildMember):DHGPlayer | undefined{
        return this.players.get(member.id);
    }
    getPlayerById(id:string):DHGPlayer | undefined{
        return this.players.get(id);
    }

    static getManagerByGuild(guild:Guild){
        return this.managers.get(guild.id);
    }
    static getManagerByGuildId(guildId:string){
        return this.managers.get(guildId);
    }


}