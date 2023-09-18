import { CategoryChannel, ChannelType, Guild, GuildMember, Role, TextChannel } from "discord.js";
import { DHGObject } from "../objects/DHGObject";
import { DHGGameManager } from "../managers/DHGGameManager";
import { DHGError } from "../Errors/DHGError";
import { DHGAction } from "../actions/DHGAction";
import { DHGCell } from "../map/DHGCell";
import { DHGWeapon } from "../objects/DHGWeapon";
import { DHGActor, DHGState } from "./DHGActor";



export class DHGPlayer extends DHGActor{

    static MAX_SATIETY = 18;
    static HUNGER_THRESHOLD = 6;
    static MAX_HYDRATION = 6;
    static THIRST_THRESHOLD = 2;
    static MAX_HEALTH = 5;
    static WOUND_THRESHOLD = 2;
    static MAX_INVENTORY = 7;
    static MAX_ACTIONS = 2;

    discordId: string;
    channelName: string;

    location: DHGCell = DHGCell.nowhere;
    
    DHGState: DHGState = DHGState.ALIVE;
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

    constructor(member:GuildMember)
    {
        super(member.displayName);
        this.discordId = member.id;
        this.channelName = 'player-' + member.displayName;

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
        channel.permissionOverwrites.create(process.env.CLIENT_ID as string,{ViewChannel:true});
        channel.permissionOverwrites.create(member.id,{ViewChannel:true});
        channel.permissionOverwrites.create(everyoneRole,{ViewChannel:false});
        return new DHGPlayer(member);
    }

    static isPlayer(actor:DHGActor): actor is DHGPlayer{
        return (actor as DHGPlayer).discordId !== undefined;
    }

    isAlive(){
        return this.DHGState === DHGState.ALIVE;
    }

    isEliminated(){
        return this.DHGState === DHGState.ELIMINATED || this.DHGState === DHGState.DEAD;
    }

    isDead(){
        return this.DHGState === DHGState.DEAD;
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

    publicInfo():string{
        let desc = "<@" + this.discordId + "> from District " + this.district + ", participant no " + this.participantNumber + "\n";
        desc += "DHGState : ";
        switch (this.DHGState) {
            case DHGState.ALIVE:
                desc += "alive\n";
                break;
            case DHGState.DEAD:
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
        let desc = "<@" + this.discordId + "> from District " + this.district + ", participant no " + this.participantNumber + "\n";
        desc += "DHGState : ";
        switch (this.DHGState) {
            case DHGState.ALIVE:
                desc += "alive\n";
                break;
            case DHGState.DEAD:
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
        desc += "Inventory : ";
        for(let item of this.inventory){
            desc += "[" + item.name + "]";
        }
        desc += "\n";

        return desc;
    }

    fullDescription():string{
        let desc = this.selfInfo();
        desc += "Location : " + this.location.cellId + "\n";
        return desc;
    }

    getChannelName():string{
        return this.channelName;
    }

    canAttack(target:DHGPlayer){
        if(this.DHGState != DHGState.ALIVE){return false;}
        const weapon = (this.equipped != undefined ? this.equipped : DHGWeapon.defaultWeapon);
        return this.location.getNeighborsByRange(weapon.range).includes(target.location);
    }

    mention():string{
        return "<@" + this.discordId + ">";
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
            this.DHGState = DHGState.DEAD;
        }
    }
    attack(target:DHGActor, manager?:DHGGameManager):number{
        const weapon = (this.equipped != undefined ? this.equipped : DHGWeapon.defaultWeapon);
        return weapon.resolveAttack(this, target, manager);
    }

}