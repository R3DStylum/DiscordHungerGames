import { DHGMap } from "./DHGMap";
import { DHGPlayer } from "./DHGPlayer";

enum State {
    ERROR = -3,
    INIT = -2,
    PREPARED = -1,
    READY = 0,
    RUNNING = 1,
    PAUSED = 2,
    RESOLVING = 3,
    FINISHED = 4,
}

export class DHGManager {
    turn: Number = 0;
    state: Number = State.INIT;
    players: DHGPlayer[] = [];
    guild_id?: string;
    client_id?: string;
    map:DHGMap;

    constructor(){
        this.map = new DHGMap();
        this.state = State.PREPARED;
    }

    static activeManager?: DHGManager = undefined;
    static voidActiveManager():void {
        this.activeManager = undefined;
    }
    static initActiveManager():void{
        this.activeManager = new DHGManager();
    }
    static getActiveManager():DHGManager | undefined{
        return this.activeManager;
    }
}