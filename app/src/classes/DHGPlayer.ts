import { CategoryChannel, ChannelType, Guild, GuildMember, Role, TextChannel } from "discord.js";
import { DHGObject } from "./DHGObject";

enum State {
    ELIMINATED = -1,
    DEAD = 0,
    ALIVE = 1,
}

export class DHGPlayer{

    static MAX_SATIETY = 18;
    static MAX_HYDRATION = 6;

    id: string;
    name: string;
    playerChannel: TextChannel;
    state: State = State.ALIVE;
    district?:number;

    inventory: DHGObject[] = [];
    satiety: number;
    hydration: number;

    poison?: number;

    constructor(member:GuildMember, playerChannel: TextChannel)
    {
        this.id = member.id;
        this.name = member.displayName;
        this.playerChannel = playerChannel;

        this.satiety = DHGPlayer.MAX_SATIETY;
        this.hydration = DHGPlayer.MAX_HYDRATION;
    }

    static async createPlayer(member:GuildMember, guild:Guild):Promise<DHGPlayer>{
        const everyoneRole:Role = guild.roles.everyone;
        const channel = await guild.channels.create({
            name:"player-"+member.displayName,
            type:ChannelType.GuildText,
            parent: (guild.channels.cache.find((channel) => {return channel.type === ChannelType.GuildCategory && channel.name === 'dhg players'}) as CategoryChannel)
        });
        channel.permissionOverwrites.create(process.env.CLIENT_ID as string,{ViewChannel:true})
        channel.permissionOverwrites.create(member.id,{ViewChannel:true})
        channel.permissionOverwrites.create(everyoneRole,{ViewChannel:false})
        return new DHGPlayer(member,channel);
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

}