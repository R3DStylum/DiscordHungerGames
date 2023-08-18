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

    id: Number;
    type: DHGObjectType = 0;

    //Weapon stats
    attacks?: Number;
    damage?: Number;
    accuracy?: Number;

    //FOOD or DRINK stats
    poisonous?: Boolean;

    effect:Function = (holder:DHGPlayer, target?: DHGPlayer, manager?:DHGManager,) => {};

    constructor(id:Number){
        this.id = id;
    }

    use():void{

    }

}