import { DHGPlayer } from "../DHGPlayer";
import { DHGManager } from "../DHGManager";

enum DHGObjectType {
    UTILITY = -2,
    WEAPON = -1,
    UNDETERMINED = 0,
    FOOD = 1,
    DRINK = 2,
}

export class DHGObject {

    id: number;
    name: string;
    type: DHGObjectType = 0;

    //FOOD or DRINK stats
    poisonous?: Boolean;

    constructor(id:number, name:string){
        this.id = id;
        this.name = name;
    }

}