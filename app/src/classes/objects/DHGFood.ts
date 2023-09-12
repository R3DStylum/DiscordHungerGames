import { getRandomInt } from "../../utils/Randoms";
import { DHGObject, DHGObjectType } from "./DHGObject";


export class DHGFood extends DHGObject{

    type = DHGObjectType.FOOD;

    poisonous?:number;

    constructor(name:string, poisonous?:number){
        super(name);
        if(poisonous != undefined){
            this.poisonous = poisonous;
        }else{
            this.poisonous = Number(getRandomInt(0,100));
        }
    }

}