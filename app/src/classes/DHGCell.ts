enum Ring {
    UNDETERMINED = -1,
    CENTER = 0,
    FIRST_RING = 1,
    SECOND_RING = 2,
    THIRD_RING = 3
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

    //north is towards the center of the Map. south is towards the border, and is null if you are at the border cells.
    //west and east are towards the left (or clockwise) and the right(or counter-clockwise) respectively.
    north: DHGCell  | null;
    west: DHGCell | null;
    east: DHGCell | null;
    south?: DHGCell | {northwest:DHGCell, northnorth:DHGCell, northeast:DHGCell};

    ring:Number | Ring;
    sector:Number | Sector;
    cellId: Number;
    channel_id?: string;
    role_id?: string;

    constructor(cellId : Number,
                north:DHGCell  | null, 
                west:DHGCell | null, 
                east:DHGCell | null, 
                south?:DHGCell | {northwest:DHGCell, northnorth:DHGCell, northeast:DHGCell},)
    {
        this.cellId = cellId;

        this.north = north;
        this.west = west;
        this.east = east;
        this.south = south;

        this.ring = Ring.UNDETERMINED;
        this.sector = Sector.UNDETERMINED;
    }

    static newEmptyCell(cellId:Number):DHGCell{
        return new DHGCell(cellId,null,null,null);
    }

    isFullyLinked(){
        return ((this.north != null) && (this.west != null) && (this.east != null));
    }

    getId(){
        return `${this.sector} + ${this.ring}`;
    }

}