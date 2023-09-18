import { CategoryChannel, Guild, GuildBasedChannel, ChannelType, ColorResolvable, Role, Client, User, TextChannel } from "discord.js";
import { transform } from "../../utils/cell-transformer";
import { DHGObject } from "../objects/DHGObject";

enum Ring {
    UNDETERMINED = -1,
    CENTER = 0,
    FIRST_RING = 1,
    SECOND_RING = 2,
    THIRD_RING = 3
}

function ringColor(ring:number):ColorResolvable{
    switch (ring) {
        case Ring.CENTER:
            return "Gold";
        case Ring.FIRST_RING:
            return "Green";
        case Ring.SECOND_RING:
            return "Red";
        case Ring.THIRD_RING:
            return "DarkGrey";
        default:
            return "DarkerGrey";
    }
}

enum Sector {
    UNDETERMINED = -1,
    SECTOR_1 = 1,
    SECTOR_2 = 2,
    SECTOR_3 = 3,
    SECTOR_4 = 4,
    SECTOR_5 = 5,
    SECTOR_6 = 6,
    SECTOR_7 = 7,
    SECTOR_8 = 8,
    SECTOR_9 = 9,
    SECTOR_10 = 10,
    SECTOR_11 = 11,
    SECTOR_12 = 12,
}

export class DHGCell {

    static nowhere = new DHGCell(-1, (undefined as unknown as TextChannel), (undefined as unknown as string), undefined, undefined, undefined)

    //north is towards the center of the Map. south is towards the border, and is undefined if you are at the border cells.
    //west and east are towards the left (or clockwise) and the right(or counter-clockwise) respectively.
    north: DHGCell  | undefined;
    west: DHGCell | undefined;
    east: DHGCell | undefined;
    south?: DHGCell | {southwest:DHGCell, southsouth:DHGCell, southeast:DHGCell};

    ring:number | Ring;
    sector:number | Sector;
    cellId: number;
    channel: TextChannel;
    roleId: string;

    loot:DHGObject[] = [];

    constructor(cellId : number,
                channel:TextChannel,
                roleId:string,
                north?:DHGCell, 
                west?:DHGCell, 
                east?:DHGCell, 
                south?:DHGCell | {southwest:DHGCell, southsouth:DHGCell, southeast:DHGCell})
    {
        this.cellId = cellId;

        this.north = north;
        this.west = west;
        this.east = east;
        this.south = south;

        this.ring = Ring.UNDETERMINED;
        this.sector = Sector.UNDETERMINED;

        this.channel = channel;
        this.roleId = roleId;
    }

    static async newEmptyCell(cellId:number, guild:Guild):Promise<DHGCell>{
        const everyoneRole:Role = guild.roles.everyone;
        const role = await guild.roles.create({
            name:"cell-"+transform(cellId)
        })
        const channel = await guild.channels.create({
            name:"cell-" + transform(cellId),
            type:ChannelType.GuildText,
            parent: (guild.channels.cache.find((channel) => {return channel.type === ChannelType.GuildCategory && channel.name === 'dhg cells'}) as CategoryChannel)
        });
        channel.permissionOverwrites.create(process.env.CLIENT_ID as string,{ViewChannel:true})
        channel.permissionOverwrites.create(role,{ViewChannel:true})
        channel.permissionOverwrites.create(everyoneRole,{ViewChannel:false})
        return new DHGCell(cellId,channel,role.id,undefined,undefined,undefined);
    }

    static async cleanupCells(guild:Guild):Promise<void[]>{
        const promises:Promise<void>[] = [];
        let cellsChannel:GuildBasedChannel | undefined = guild.channels.cache.find((channel) => {return channel.type === ChannelType.GuildCategory && channel.name === 'dhg cells'});
        if(cellsChannel !== undefined){
            (cellsChannel as CategoryChannel).children.cache.forEach((value) => {promises.push(guild.channels.delete(value as GuildBasedChannel, "cleaning up cell channels"))});
            promises.push(guild.channels.delete(cellsChannel, "cleaning up cell channels"));
        }
        /*const cellChannels = guild.channels.cache.filter((cellChannel) => {return cellChannel.name.startsWith("cell-")});
        cellChannels.forEach((value) => {guild.channels.delete(value as GuildBasedChannel, "cleaning up cell channels")});*/
        const cellRoles = guild.roles.cache.filter((cellRole) => {return cellRole.name.startsWith("cell-")});
        cellRoles.forEach((value) => {promises.push(guild.roles.delete(value as Role, "cleaning up cell Roles"))});
        return Promise.all(promises);
    }

    isFullyLinked():boolean{
        return ((this.north != undefined) && (this.west != undefined) && (this.east != undefined));
    }

    neighbors():DHGCell[]{
        const ret:DHGCell[] = []
        if(this.north != undefined){
            ret.push(this.north);
        }
        if(this.east != undefined){
            ret.push(this.east);
        }
        if(this.west != undefined){
            ret.push(this.west);
        }
        if(this.south instanceof DHGCell){
            ret.push(this.south);
            return ret;
        }else if(this.south === undefined){
            return ret;
        }else{
            if(this.south.southeast != undefined){
                ret.push(this.south.southeast);
            }
            if(this.south.southsouth != undefined){
                ret.push(this.south.southsouth);
            }
            if(this.south.southwest != undefined){
                ret.push(this.south.southwest);
            }
            return ret;
        }
    }

    getNeighborsByRange(range:number):DHGCell[]{
        const ret:Set<DHGCell> = new Set<DHGCell>();
        ret.add(this);
        const remaining:[number,DHGCell][] = [];
        remaining.push([0,this]);
        while(remaining.length > 0){
            const curr = remaining.pop() as [number,DHGCell];
            if(curr[0] < range){
                for(let cell of curr[1].neighbors()){
                    if(!ret.has(cell)){
                        ret.add(cell);
                        remaining.push([curr[0]+1,cell]);
                    }
                }
            }
        }

        return Array.from(ret);
    }

    getNeighborByDirection(direction:string):DHGCell | undefined{
        switch(direction){
            case "north":
                return this.north;
            case "west":
                return this.west;
            case "east":
                return this.east;
            case "southwest":
                if(this.south instanceof DHGCell || this.south === undefined){return this.south}
                return this.south.southwest;
            case "southeast":
                if(this.south instanceof DHGCell || this.south === undefined){return this.south}
                return this.south.southwest;
            case "southsouth":
                if(this.south instanceof DHGCell || this.south === undefined){return this.south}
                return this.south.southsouth
            default:
                return undefined;
        }
    }

}