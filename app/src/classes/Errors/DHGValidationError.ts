import { DHGError } from "./DHGError";

export class DHGValidationError extends DHGError{

    constructor(message:string){
        super(message)
    }

}