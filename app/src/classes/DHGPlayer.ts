import { CategoryChannel, ChannelType, Guild, GuildMember, Role, TextChannel } from "discord.js";
import { DHGObject } from "./objects/DHGObject";
import { DHGManager } from "./DHGManager";
import { DHGError } from "./Errors/DHGError";
import { DHGAction } from "./actions/DHGAction";
import { DHGCell } from "./DHGCell";

enum State {
    ELIMINATED = -1,
    DEAD = 0,
    ALIVE = 1,
}

export class DHGPlayer{

    static MAX_SATIETY = 18;
    static MAX_HYDRATION = 6;
    static MAX_INVENTORY = 8;
    static MAX_ACTIONS = 2;

    id: string;
    guild_id: string;
    channel_name: string;

    location: DHGCell = DHGCell.nowhere;
    
    state: State = State.ALIVE;
    district?:number;
    participantNumber?:number;

    inventory: DHGObject[] = [];
    actions: DHGAction[] = [];
    satiety: number;
    hydration: number;

    poison?: number;

    constructor(member:GuildMember, guild_id:string)
    {
        this.id = member.id;
        this.channel_name = 'player-' + member.displayName;
        this.guild_id = guild_id;

        this.satiety = DHGPlayer.MAX_SATIETY;
        this.hydration = DHGPlayer.MAX_HYDRATION;
    }

    static async createPlayer(member:GuildMember, guild:Guild):Promise<DHGPlayer>{
        const everyoneRole:Role = guild.roles.everyone;
        const dhgplayerchannel = guild.channels.cache.find((channel) => {return channel.type === ChannelType.GuildCategory && channel.name === 'dhg players'}) as CategoryChannel
        if(dhgplayerchannel === undefined){
            throw new DHGError('could not find dhg player category. Check if "/dhgadmin init" has been used');
        }
        const channel = await guild.channels.create({
            name:"player-"+member.displayName,
            type:ChannelType.GuildText,
            parent: dhgplayerchannel,
        });
        channel.permissionOverwrites.create(process.env.CLIENT_ID as string,{ViewChannel:true})
        channel.permissionOverwrites.create(member.id,{ViewChannel:true})
        channel.permissionOverwrites.create(everyoneRole,{ViewChannel:false})
        return new DHGPlayer(member,guild.id);
    }

    isAlive(){
        return this.state === State.ALIVE;
    }

    isEliminated(){
        return this.state === State.ELIMINATED || this.state === State.DEAD;
    }

    isDead(){
        return this.state === State.DEAD;
    }

    playerChannel():TextChannel | undefined{
        const manager = DHGManager.getManagerByGuildId(this.guild_id);
        if(manager !== undefined){
            return manager.guild.channels.cache.find((channel) => {return channel.type === ChannelType.GuildText && channel.name === this.channel_name}) as TextChannel;
        }else{
            throw new DHGError('the channel for this player cannot be found. You can recreate it as text with name : ' + this.channel_name);
        }
    }

    fullDescription():string{
        let desc = "<@" + this.id + "> from District " + this.district + ", participant no " + this.participantNumber + "\n";
        desc += "State : ";
        switch (this.state) {
            case State.ALIVE:
                desc += "alive\n";
                break;
            case State.DEAD:
                desc += "dead\n";
                break;
            default:
                desc += "eliminated\n";
                break;
        }
        desc += "Satiety : " + this.satiety + "\n";
        desc += "Hydration : " + this.hydration + "\n";
        desc += (this.poison != undefined ? "Poison : " + this.poison + "\n" : "\n");
        return desc;
    }

    mention():string{
        return "<@" + this.id + ">";
    }

}