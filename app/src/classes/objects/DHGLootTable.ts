import { DHGError } from "../Errors/DHGError";
import { DHGObject, DHGObjectBuilder } from "./DHGObject";

export class DHGLootTable {

    lootTable:{weight:number, obtainable:DHGObjectBuilder | DHGLootTable}[] = [];
    totalWeight:number;

    constructor(totalWeight:number,lootTable?:{weight:number, obtainable:DHGObjectBuilder | DHGLootTable}[]){
        if(lootTable != undefined){this.lootTable = lootTable;}
        this.totalWeight = totalWeight;
    }
    
    roll():DHGObject{
        let rand = Math.floor(Math.random() * this.totalWeight);
        for(let item of this.lootTable){
            rand -= item.weight;
            if(rand < 0){
                if(item.obtainable instanceof DHGObjectBuilder){
                    return item.obtainable.build();
                }else{
                    return item.obtainable.roll();
                }
            }
        }
        throw new DHGError("total weight of loot table is bugged, try regenerating them");
    }

}

export class DHGLootTableBuilder {

    lootTable:{weight:number, obtainable:DHGObjectBuilder | DHGLootTable}[] = [];
    totalWeight = 0;

    addDrop(weight:number, object:DHGObjectBuilder){
        this.lootTable.push({weight: weight, obtainable: object});
        this.totalWeight += weight;
    }

    addSubtableDrop(weight:number, table:DHGLootTable){
        this.lootTable.push({weight: weight, obtainable: table});
        this.totalWeight += weight;
    }

    build():DHGLootTable{
        return new DHGLootTable(this.totalWeight, this.lootTable);
    }

}

export class DHGLootTableTemplates{

    

}