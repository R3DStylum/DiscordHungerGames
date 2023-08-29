import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CategoryChannel, ChannelType, Client, Guild, GuildBasedChannel, GuildChannel, TextChannel } from "discord.js";
import { DHGMap } from "./DHGMap";
import { DHGPlayer } from "./DHGPlayer";
import "dotenv/config";

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
    players: DHGPlayer[] = [];

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

    async sendInvitation(nbParticipants:bigint):Promise<void>{
        console.log('Invitations to be sent...')
        const teamSize = nbParticipants/(BigInt(12));
        const broadcastChannel = this.guild.channels.cache.find((channel) => {return channel.name === 'broadcast' && channel.type === ChannelType.GuildText}) as TextChannel;
        if(broadcastChannel !== undefined){
            const rows:ActionRowBuilder<ButtonBuilder>[] = [];
            let row = new ActionRowBuilder<ButtonBuilder>();
            for(let i:bigint = BigInt(0); i < nbParticipants; i++){
                const team = i/teamSize;
                const number = (i%teamSize)+BigInt(1);
                row.components.push(
                    new ButtonBuilder()
                        .setCustomId(`participant:${team}-${number}`)
                        .setLabel(`District : ${team}`)
                        .setStyle(ButtonStyle.Danger)
                )
                if(i%BigInt(4) == BigInt(3)){
                    rows.push(row);
                    row = new ActionRowBuilder<ButtonBuilder>();
                }
            }
            await broadcastChannel.send({
                content: 'Register for the Discord Hunger Games ! Blood and Glory awaits !',
            })
            for(row of rows){
                await broadcastChannel.send({
                    components: [row],
                })
            }
        }
    }

    static getManagerByGuild(guild:Guild){
        return this.managers.get(guild.id);
    }
    static getManagerByGuildId(guildId:string){
        return this.managers.get(guildId);
    }
}