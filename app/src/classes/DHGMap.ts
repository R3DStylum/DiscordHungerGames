import { DHGCell } from "./DHGCell";

export class DHGMap{
    allCells:DHGCell[];
    center: DHGCell;
    firstRing: Map<string,DHGCell>;
    secondRing: Map<string,DHGCell>;
    thirdRing: Map<string,DHGCell>;

    constructor(){
        //generate array
        this.allCells = [];

        //generate center cell
        this.center = DHGCell.newEmptyCell();
        

        //generate First Ring
        this.firstRing = new Map([
            ['northCell',DHGCell.newEmptyCell()],
            ['westCell',DHGCell.newEmptyCell()],
            ['eastCell',DHGCell.newEmptyCell()],
            ['southCell',DHGCell.newEmptyCell()],
        ]);
        //generate all cells from second ring
        this.secondRing = new Map([
            ['11',DHGCell.newEmptyCell()],
            ['12',DHGCell.newEmptyCell()],
            ['1',DHGCell.newEmptyCell()],
            ['2',DHGCell.newEmptyCell()],
            ['3',DHGCell.newEmptyCell()],
            ['4',DHGCell.newEmptyCell()],
            ['5',DHGCell.newEmptyCell()],
            ['6',DHGCell.newEmptyCell()],
            ['7',DHGCell.newEmptyCell()],
            ['8',DHGCell.newEmptyCell()],
            ['9',DHGCell.newEmptyCell()],
            ['10',DHGCell.newEmptyCell()],
        ]);
        //generate all cells from thirde ring
        this.thirdRing = new Map([
            ['11',DHGCell.newEmptyCell()],
            ['12',DHGCell.newEmptyCell()],
            ['1',DHGCell.newEmptyCell()],
            ['2',DHGCell.newEmptyCell()],
            ['3',DHGCell.newEmptyCell()],
            ['4',DHGCell.newEmptyCell()],
            ['5',DHGCell.newEmptyCell()],
            ['6',DHGCell.newEmptyCell()],
            ['7',DHGCell.newEmptyCell()],
            ['8',DHGCell.newEmptyCell()],
            ['9',DHGCell.newEmptyCell()],
            ['10',DHGCell.newEmptyCell()],
        ]);

        //Start linking cells, and adding them to allCells.
            //linking center cell
        this.allCells.push(this.center);
            //set Ring
        this.center.ring = 0;

            //setting all links
        this.center.north = this.firstRing.get('northCell') as DHGCell;
        this.center.east = this.firstRing.get('eastCell') as DHGCell;
        this.center.west = this.firstRing.get('westCell') as DHGCell;
        this.center.south = this.firstRing.get('southCell') as DHGCell;

            //linking first ring cells (most complex ring)
        for (const key in this.firstRing) {
            let cell:DHGCell = this.firstRing.get(key) as DHGCell
            this.allCells.push(cell);
            //set Ring
            cell.ring = 1;

            //setting all links
            cell.north = this.center;
            switch (key) {
                case 'northCell':
                    cell.east = this.firstRing.get('westCell') as DHGCell;
                    cell.west = this.firstRing.get('eastCell') as DHGCell;
                    cell.south = {
                        northeast: this.secondRing.get('11') as DHGCell,
                        northnorth: this.secondRing.get('12') as DHGCell,
                        northwest: this.secondRing.get('1') as DHGCell
                    }
                    break;
                case 'eastCell':
                    cell.east = this.firstRing.get('northCell') as DHGCell;
                    cell.west = this.firstRing.get('southCell') as DHGCell;
                    cell.south = {
                        northeast: this.secondRing.get('2') as DHGCell,
                        northnorth: this.secondRing.get('3') as DHGCell,
                        northwest: this.secondRing.get('4') as DHGCell
                    }
                    break;
                case 'westCell':
                    cell.east = this.firstRing.get('southCell') as DHGCell;
                    cell.west = this.firstRing.get('northCell') as DHGCell;
                    cell.south = {
                        northeast: this.secondRing.get('8') as DHGCell,
                        northnorth: this.secondRing.get('9') as DHGCell,
                        northwest: this.secondRing.get('10') as DHGCell
                    }
                    break;
                case 'southCell':
                    cell.east = this.firstRing.get('eastCell') as DHGCell;
                    cell.west = this.firstRing.get('westCell') as DHGCell;
                    cell.south = {
                        northeast: this.secondRing.get('5') as DHGCell,
                        northnorth: this.secondRing.get('6') as DHGCell,
                        northwest: this.secondRing.get('7') as DHGCell
                    }
                    break;
                default:
                    break;
            }
        }

        for (const key in this.secondRing) {
            let cell:DHGCell = this.secondRing.get(key) as DHGCell
            this.allCells.push(cell);

            //set Ring and sector
            cell.ring = 2;
            cell.sector = Number.parseInt(key);

            //setting the north of all second ring cells
            if ((Number.parseInt(key)+1) % 12 < 3) {
                cell.north = this.firstRing.get('north') as DHGCell;
            } else if ((Number.parseInt(key)+1) % 12 < 6) {
                cell.north = this.firstRing.get('east') as DHGCell;
            } else if ((Number.parseInt(key)+1) % 12 < 9) {
                cell.north = this.firstRing.get('south') as DHGCell;
            } else {
                cell.north = this.firstRing.get('west') as DHGCell;
            }

            //setting east and west
            cell.east = this.secondRing.get(String((Number.parseInt(key)-1) % 12)) as DHGCell;
            cell.west = this.secondRing.get(String((Number.parseInt(key)+1) % 12)) as DHGCell;

            //setting south
            cell.south = this.thirdRing.get(String(Number.parseInt(key))) as DHGCell;
        }

        
        for (const key in this.thirdRing) {
            let cell:DHGCell = this.thirdRing.get(key) as DHGCell
            this.allCells.push(cell);
            //set Ring and sector
            cell.ring = 3;
            cell.sector = Number.parseInt(key);

            //setting the north of all third ring cells
            cell.north = this.secondRing.get(String(Number.parseInt(key))) as DHGCell;

            //setting east and west
            cell.east = this.thirdRing.get(String((Number.parseInt(key)-1) % 12)) as DHGCell;
            cell.west = this.thirdRing.get(String((Number.parseInt(key)+1) % 12)) as DHGCell;

            //no south, edge of the map
        }
    }

    
}