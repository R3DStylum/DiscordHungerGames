import { DHGCell } from "../map/DHGCell";
import { DHGGameManager } from "../managers/DHGGameManager";

export enum DHGState {
    ELIMINATED = -1,
    DEAD = 0,
    IRRELEVANT = 0,
    RELEVANT = 1,
    ALIVE = 1,
}

export abstract class DHGActor {

    static allActors:Map<number, DHGActor> = new Map<number, DHGActor>();

    name:string;
    id:number;

    constructor(name:string){
        this.name = name;
        this.id = DHGActor.allActors.size;
        DHGActor.allActors.set(this.id, this);
    }

    abstract move(cell:DHGCell):void;
    abstract attack(target:DHGActor, manager?:DHGGameManager):number;
    abstract damage(damage:number):void;

    static getActorById(id:number){
        return this.allActors.get(id);
    }


}