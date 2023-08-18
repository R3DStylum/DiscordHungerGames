import { DHGObject } from "./DHGObject";

enum State {
    ELIMINATED = -1,
    DEAD = 0,
    ALIVE = 1,
}

export class DHGPlayer{

    static MAX_SATIETY = 18;
    static MAX_HYDRATION = 6;

    id?: string;
    name?: string;
    state: State = State.ALIVE;

    inventory: DHGObject[] = [];
    satiety: Number;
    hydration: Number;

    poison?: Number;

    constructor(){
        this.satiety = DHGPlayer.MAX_SATIETY;
        this.hydration = DHGPlayer.MAX_HYDRATION;
    }

    isAlive(){
        return this.state === State.ALIVE;
    }

    isEliminated(){
        return this.state === State.ELIMINATED || this.state === State.DEAD;
    }

    isDead(){
        return this.state === State.DEAD;
    }

}