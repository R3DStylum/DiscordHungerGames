import { Guild } from "discord.js";
import { DHGCell } from "./DHGCell";

export class DHGMap{
    allCells:Map<number,DHGCell>;
    center: DHGCell;
    firstRing: Map<string,DHGCell>;
    secondRing: Map<string,DHGCell>;
    thirdRing: Map<string,DHGCell>;

    constructor(allCells:Map<number,DHGCell>,
                center: DHGCell,
                firstRing: Map<string,DHGCell>,
                secondRing: Map<string,DHGCell>,
                thirdRing: Map<string,DHGCell>)
    {
        this.allCells = allCells;
        this.center = center;
        this.firstRing = firstRing;
        this.secondRing = secondRing;
        this.thirdRing = thirdRing;
    }

    static async createMap(guild:Guild):Promise<DHGMap>{
        //generate array
        const allCells = new Map();

        //generate center cell
        const center = await DHGCell.newEmptyCell(0,guild);
        

        //generate First Ring
        const firstRing = new Map([
            ['northCell',await DHGCell.newEmptyCell(1,guild)],
            ['westCell',await DHGCell.newEmptyCell(4,guild)],
            ['eastCell',await DHGCell.newEmptyCell(2,guild)],
            ['southCell',await DHGCell.newEmptyCell(3,guild)],
        ]);
        //generate all cells from second ring
        const secondRing = new Map([
            ['11',await DHGCell.newEmptyCell(111,guild)],
            ['12',await DHGCell.newEmptyCell(121,guild)],
            ['1',await DHGCell.newEmptyCell(11,guild)],
            ['2',await DHGCell.newEmptyCell(21,guild)],
            ['3',await DHGCell.newEmptyCell(31,guild)],
            ['4',await DHGCell.newEmptyCell(41,guild)],
            ['5',await DHGCell.newEmptyCell(51,guild)],
            ['6',await DHGCell.newEmptyCell(61,guild)],
            ['7',await DHGCell.newEmptyCell(71,guild)],
            ['8',await DHGCell.newEmptyCell(81,guild)],
            ['9',await DHGCell.newEmptyCell(91,guild)],
            ['10',await DHGCell.newEmptyCell(101,guild)],
        ]);
        //generate all cells from third ring
        const thirdRing = new Map([
            ['11',await DHGCell.newEmptyCell(112,guild)],
            ['12',await DHGCell.newEmptyCell(122,guild)],
            ['1',await DHGCell.newEmptyCell(12,guild)],
            ['2',await DHGCell.newEmptyCell(22,guild)],
            ['3',await DHGCell.newEmptyCell(32,guild)],
            ['4',await DHGCell.newEmptyCell(42,guild)],
            ['5',await DHGCell.newEmptyCell(52,guild)],
            ['6',await DHGCell.newEmptyCell(62,guild)],
            ['7',await DHGCell.newEmptyCell(72,guild)],
            ['8',await DHGCell.newEmptyCell(82,guild)],
            ['9',await DHGCell.newEmptyCell(92,guild)],
            ['10',await DHGCell.newEmptyCell(102,guild)],
        ]);

        //Start linking cells, and adding them to allCells.
            //linking center cell
        allCells.set(center.cellId, center);
            //set Ring
        center.ring = 0;

            //setting all links
        center.north = firstRing.get('northCell') as DHGCell;
        center.east = firstRing.get('eastCell') as DHGCell;
        center.west = firstRing.get('westCell') as DHGCell;
        center.south = firstRing.get('southCell') as DHGCell;

            //linking first ring cells (most complex ring)
        for (const key in firstRing) {
            let cell:DHGCell = firstRing.get(key) as DHGCell
            allCells.set(cell.cellId, cell);
            //set Ring
            cell.ring = 1;

            //setting all links
            cell.north = center;
            switch (key) {
                case 'northCell':
                    cell.east = firstRing.get('westCell') as DHGCell;
                    cell.west = firstRing.get('eastCell') as DHGCell;
                    cell.south = {
                        southeast: secondRing.get('11') as DHGCell,
                        southsouth: secondRing.get('12') as DHGCell,
                        southwest: secondRing.get('1') as DHGCell
                    }
                    break;
                case 'eastCell':
                    cell.east = firstRing.get('northCell') as DHGCell;
                    cell.west = firstRing.get('southCell') as DHGCell;
                    cell.south = {
                        southeast: secondRing.get('2') as DHGCell,
                        southsouth: secondRing.get('3') as DHGCell,
                        southwest: secondRing.get('4') as DHGCell
                    }
                    break;
                case 'westCell':
                    cell.east = firstRing.get('southCell') as DHGCell;
                    cell.west = firstRing.get('northCell') as DHGCell;
                    cell.south = {
                        southeast: secondRing.get('8') as DHGCell,
                        southsouth: secondRing.get('9') as DHGCell,
                        southwest: secondRing.get('10') as DHGCell
                    }
                    break;
                case 'southCell':
                    cell.east = firstRing.get('eastCell') as DHGCell;
                    cell.west = firstRing.get('westCell') as DHGCell;
                    cell.south = {
                        southeast: secondRing.get('5') as DHGCell,
                        southsouth: secondRing.get('6') as DHGCell,
                        southwest: secondRing.get('7') as DHGCell
                    }
                    break;
                default:
                    break;
            }
        }

        for (const key in secondRing) {
            let cell:DHGCell = secondRing.get(key) as DHGCell
            allCells.set(cell.cellId, cell);

            //set Ring and sector
            cell.ring = 2;
            cell.sector = Number.parseInt(key);

            //setting the north of all second ring cells
            if ((Number.parseInt(key)+1) % 12 < 3) {
                cell.north = firstRing.get('north') as DHGCell;
            } else if ((Number.parseInt(key)+1) % 12 < 6) {
                cell.north = firstRing.get('east') as DHGCell;
            } else if ((Number.parseInt(key)+1) % 12 < 9) {
                cell.north = firstRing.get('south') as DHGCell;
            } else {
                cell.north = firstRing.get('west') as DHGCell;
            }

            //setting east and west
            cell.east = secondRing.get(String((Number.parseInt(key)-1) % 12)) as DHGCell;
            cell.west = secondRing.get(String((Number.parseInt(key)+1) % 12)) as DHGCell;

            //setting south
            cell.south = thirdRing.get(String(Number.parseInt(key))) as DHGCell;
        }

        
        for (const key in thirdRing) {
            let cell:DHGCell = thirdRing.get(key) as DHGCell
            allCells.set(cell.cellId, cell);
            //set Ring and sector
            cell.ring = 3;
            cell.sector = Number.parseInt(key);

            //setting the north of all third ring cells
            cell.north = secondRing.get(String(Number.parseInt(key))) as DHGCell;

            //setting east and west
            cell.east = thirdRing.get(String((Number.parseInt(key)-1) % 12)) as DHGCell;
            cell.west = thirdRing.get(String((Number.parseInt(key)+1) % 12)) as DHGCell;

            //no south, edge of the map
        }

        return new DHGMap(allCells,center,firstRing,secondRing,thirdRing);
    }

    getCellbyId(cell:DHGCell):DHGCell | undefined{
        return this.allCells.get(cell.cellId);
    }
}