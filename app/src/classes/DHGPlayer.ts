import { CategoryChannel, ChannelType, Guild, GuildMember, Role, TextChannel } from "discord.js";
import { DHGObject } from "./objects/DHGObject";
import { DHGManager } from "./DHGManager";
import { DHGError } from "./Errors/DHGError";
import { DHGAction } from "./actions/DHGAction";
import { DHGCell } from "./DHGCell";
import { DHGWeapon } from "./objects/DHGWeapon";

enum State {
    ELIMINATED = -1,
    DEAD = 0,
    ALIVE = 1,
}

export class DHGPlayer{

    static MAX_SATIETY = 18;
    static HUNGER_THRESHOLD = 6;
    static MAX_HYDRATION = 6;
    static THIRST_THRESHOLD = 2;
    static MAX_HEALTH = 5;
    static WOUND_THRESHOLD = 2;
    static MAX_INVENTORY = 7;
    static MAX_ACTIONS = 2;

    id: string;
    guild_id: string;
    channel_name: string;

    location: DHGCell = DHGCell.nowhere;
    
    state: State = State.ALIVE;
    district?:number;
    participantNumber?:number;

    inventory: DHGObject[] = [];
    equipped?: DHGWeapon = undefined;

    actions: DHGAction[] = [];
    satiety: number;
    hydration: number;
    health: number;

    poison?: number;
    hemmorage?: boolean;

    constructor(member:GuildMember, guild_id:string)
    {
        this.id = member.id;
        this.channel_name = 'player-' + member.displayName;
        this.guild_id = guild_id;

        this.satiety = DHGPlayer.MAX_SATIETY;
        this.hydration = DHGPlayer.MAX_HYDRATION;
        this.health = DHGPlayer.MAX_HEALTH;
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

    isWounded(){
        return (this.health <= DHGPlayer.WOUND_THRESHOLD);
    }

    isHungry(){
        return (this.satiety <= DHGPlayer.HUNGER_THRESHOLD);
    }

    isThirsty(){
        return (this.hydration <= DHGPlayer.THIRST_THRESHOLD);
    }

    playerChannel():TextChannel | undefined{
        const manager = DHGManager.getManagerByGuildId(this.guild_id);
        if(manager !== undefined){
            return manager.guild.channels.cache.find((channel) => {return channel.type === ChannelType.GuildText && channel.name === this.channel_name}) as TextChannel;
        }else{
            throw new DHGError('the channel for this player cannot be found. You can recreate it as text with name : ' + this.channel_name);
        }
    }

    publicInfo():string{
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
        desc += "Health : " + (this.isWounded() ? "Wounded" : "Healthy") + "\n";
        desc += "Satiety : " + (this.isHungry() ? "Hungry" : "Satiated") + "\n";
        desc += "Hydration : " + (this.isThirsty() ? "Thirsty" : "Hydrated") + "\n";
        if(!this.equipped?.hidden){desc += "Held : " + this.equipped?.name}
        return desc;
    }

    selfInfo():string{
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
        desc += "Health : " + this.health + "\n";
        desc += "Satiety : " + this.satiety + "\n";
        desc += "Hydration : " + this.hydration + "\n";
        desc += (this.poison != undefined ? "Poison : " + this.poison + "\n" : "\n");

        desc += "Held : " + (this.equipped != undefined ? `${this.equipped.name}` : "Nothing") + "\n";

        return desc;
    }

    fullDescription():string{
        let desc = this.selfInfo();
        desc += "Location : " + this.location.cellId + "\n";
        return desc;
    }

    mention():string{
        return "<@" + this.id + ">";
    }

    move(cell:DHGCell):void{
        this.location = cell;
    }
    give(obj:DHGObject):void{
        this.inventory.push(obj);
    }
    equip(wpn:DHGWeapon):void{
        this.equipped = wpn;
    }
    damage(damage:number){
        this.health -= damage;
        if(this.health <= 0){
            this.state = State.DEAD;
        }
    }

}