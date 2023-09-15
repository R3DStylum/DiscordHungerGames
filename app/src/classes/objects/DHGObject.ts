import { DHGPlayer } from "../actors/DHGPlayer";
import { DHGManager } from "../DHGManager";
import { DHGWeapon, DHGWeaponTemplates } from "./DHGWeapon";
import { DHGValidationError } from "../Errors/DHGValidationError";

export enum DHGObjectType {
    UTILITY = -2,
    WEAPON = -1,
    UNDETERMINED = 0,
    FOOD = 1,
    DRINK = 2,
}

export class DHGObject {

    static allObjects:Map<number,DHGObject> = new Map<number,DHGObject>();

    id: number;
    name: string;
    type: DHGObjectType = 0;
    hidden: boolean = false;

    constructor(name:string){
        this.name = name;
        this.id = DHGObject.allObjects.size;
        DHGObject.allObjects.set(this.id, this);
    }

    static getObjectById(objectId:number){
        return this.allObjects.get(objectId);
    }
}

export class DHGObjectBuilder {

    name!:string;
    hidden: boolean = false;

    setName(name:string){
        this.name = name;
    }

    setHidden(){
        this.hidden = true;
    }
 
    build():DHGObject{
        if(this.name == undefined){
            throw new DHGValidationError("Object needs name");
        }else if(this.name.length < 1 || this.name.length > 32){
            throw new DHGValidationError("Object name length needs to be between 1 and 32");
        }

        return new DHGObject(this.name);
    }
}

export class DHGObjectTemplates {
    static allTemplates:Map<string,DHGObjectBuilder> = new Map<string,DHGObjectBuilder>([

    ])

    static getTemplate(name:string):DHGObjectBuilder | undefined{
        return this.allTemplates.get(name);
    }

    static randomTemplate():DHGObjectBuilder{      
        let values:DHGObjectBuilder[] = Array.from(this.allTemplates.values());
        return values[Math.floor(Math.random() * values.length)];
    }
}
