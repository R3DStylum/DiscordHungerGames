import { DHGPlayer } from "../DHGPlayer";

export abstract class DHGAction{

    abstract before:() => void;
    abstract resolve:() => void;
    abstract after:() => void;

}