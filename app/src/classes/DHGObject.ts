import { DHGPlayer } from "./DHGPlayer";
import { DHGManager } from "./DHGManager";

enum DHGObjectType {
    UTILITY = -2,
    WEAPON = -1,
    UNDETERMINED = 0,
    FOOD = 1,
    DRINK = 2,
}

export class DHGObject {

    id: number;
    type: DHGObjectType = 0;

    //Weapon stats
    attacks?: number;
    damage?: number;
    accuracy?: number;

    //FOOD or DRINK stats
    poisonous?: Boolean;

    effect:Function = (holder:DHGPlayer, target?: DHGPlayer, manager?:DHGManager,) => {};

    constructor(id:number){
        this.id = id;
    }

    use():void{

    }

}