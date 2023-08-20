import { CategoryChannel, ChannelType, Client, Guild, GuildBasedChannel, GuildChannel } from "discord.js";
import { DHGMap } from "./DHGMap";
import { DHGPlayer } from "./DHGPlayer";
import "dotenv/config";
import { channel } from "node:diagnostics_channel";

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

    adminCategoryChannel:GuildBasedChannel;
    playerCategoryChannel:GuildBasedChannel;
    cellsCategoryChannel:GuildBasedChannel;
    otherCategoryChannel:GuildBasedChannel;

    map:DHGMap;

    private constructor(guild:Guild, channels:{
            adminCategoryChannel:GuildBasedChannel,
            playerCategoryChannel:GuildBasedChannel,
            cellsCategoryChannel:GuildBasedChannel,
            otherCategoryChannel:GuildBasedChannel
        })
    {
        this.map = new DHGMap();
        this.state = State.PREPARED;

        this.guild = guild;
        this.adminCategoryChannel = channels.adminCategoryChannel;
        this.playerCategoryChannel = channels.playerCategoryChannel;
        this.cellsCategoryChannel = channels.cellsCategoryChannel;
        this.otherCategoryChannel = channels.otherCategoryChannel;
        
        
        DHGManager.managers.set(guild.id, this);
    }

    static async createManager(guild:Guild):Promise<void>{
        let adminChannel:GuildBasedChannel | undefined = guild.channels.cache.find((channel) => {return channel.type === ChannelType.GuildCategory && channel.name === 'dhg admin'});
        if(adminChannel === undefined){
            adminChannel = await guild.channels.create({
                name:'dhg admin',
                type:ChannelType.GuildCategory
            });
            await guild.channels.create({
                name:"control-room",
                type:ChannelType.GuildText,
                parent:adminChannel
            });
        }else{
            if((adminChannel as CategoryChannel).children.cache.find((channel) => {return channel.name === 'control-room' && channel.type === ChannelType.GuildText}) === undefined){
                await guild.channels.create({
                    name:"control-room",
                    type:ChannelType.GuildText,
                    parent:(adminChannel as CategoryChannel)
                });
            }
        }


        let playerChannel:GuildBasedChannel | undefined = guild.channels.cache.find((channel) => {return channel.type === ChannelType.GuildCategory && channel.name === 'dhg players'});
        if(playerChannel === undefined){
            playerChannel = await guild.channels.create({
                name:'dhg players',
                type:ChannelType.GuildCategory
            });
        }

        let cellsChannel:GuildBasedChannel | undefined = guild.channels.cache.find((channel) => {return channel.type === ChannelType.GuildCategory && channel.name === 'dhg cells'});
        if(cellsChannel === undefined){
            cellsChannel = await guild.channels.create({
                name:'dhg cells',
                type:ChannelType.GuildCategory
            });
        }

        let otherChannel:GuildBasedChannel | undefined = guild.channels.cache.find((channel) => {return channel.type === ChannelType.GuildCategory && channel.name === 'dhg general'});
        if(otherChannel === undefined){
            otherChannel = await guild.channels.create({
                name:'dhg general',
                type:ChannelType.GuildCategory
            });
        }
        
        const channels = {
            adminCategoryChannel:adminChannel, 
            playerCategoryChannel:playerChannel, 
            cellsCategoryChannel:cellsChannel, 
            otherCategoryChannel:otherChannel
        }

        new DHGManager(guild, channels);
    }

    static getManagerByClient(guild:Guild){
        return this.managers.get(guild.id);
    }
    static getManagerByClientId(guildId:string){
        return this.managers.get(guildId);
    }
}