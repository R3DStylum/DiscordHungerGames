import { getRandomInt } from "../../utils/Randoms";
import { DHGObject, DHGObjectType } from "./DHGObject";


export class DHGDrink extends DHGObject{

    type = DHGObjectType.DRINK;

    poisonous?:number;

    constructor(name:string, poisonous?:number){
        super(name);
        if(poisonous != undefined){
            this.poisonous = poisonous;
        }else{
            this.poisonous = Number(getRandomInt(0,25));
        }
    }

}