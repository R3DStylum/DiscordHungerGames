import { DHGManager } from "../DHGManager";
import { DHGPlayer } from "../actors/DHGPlayer";
import { DHGValidationError } from "../Errors/DHGValidationError";
import { DHGObject, DHGObjectBuilder, DHGObjectTemplates, DHGObjectType } from "./DHGObject"

export class DHGWeapon extends DHGObject{ 

    static defaultWeapon:DHGWeapon = new DHGWeapon('fists', 1, 1, 50);

    type = DHGObjectType.WEAPON;

    //Weapon stats
    attacks: number;
    damage: number;
    accuracy: number;
    range:number = 0;
    noise:number = 0;

    before:((user:DHGPlayer,target?:DHGPlayer, manager?:DHGManager) => void)[] = [];
    use:(user:DHGPlayer,target:DHGPlayer, manager?:DHGManager) => boolean = (user:DHGPlayer,target:DHGPlayer, manager?:DHGManager) =>{
        const roll = Math.floor(Math.random() * 100);
        console.log(`rolled ${roll}`)
        if(roll < this.accuracy){
            target.damage(this.damage);
            return true;
        }
        return false;
    }
    after:((user:DHGPlayer,target?:DHGPlayer, manager?:DHGManager) => void)[] = [];
    onSuccess:((user:DHGPlayer,target?:DHGPlayer, manager?:DHGManager) => void)[] = [];
    onFailure:((user:DHGPlayer,target?:DHGPlayer, manager?:DHGManager) => void)[] = [];

    constructor(name:string, 
        attacks:number,
        damage: number,
        accuracy: number,
        range?:number,
        noise?:number,
        before?:((user:DHGPlayer,target?:DHGPlayer, manager?:DHGManager) => void)[],
        use?:(user:DHGPlayer,target:DHGPlayer, manager?:DHGManager) => boolean,
        after?:((user:DHGPlayer,target?:DHGPlayer, manager?:DHGManager) => void)[],
        onSuccess?:((user:DHGPlayer,target?:DHGPlayer, manager?:DHGManager) => void)[],
        onFailure?:((user:DHGPlayer,target?:DHGPlayer, manager?:DHGManager) => void)[]
    ){
        super(name)
        this.attacks = attacks;
        this.damage = damage;
        this.accuracy = accuracy;
        if(range != undefined){
            this.range = range;
        }
        if(noise != undefined){
            this.noise = noise;
        }
        if(before != undefined){
            this.before = before;
        }
        if(use != undefined){
            this.use = use;
        }
        if(after != undefined){
            this.after = after;
        }
        if(onSuccess != undefined){
            this.onSuccess = onSuccess;
        }
        if(onFailure != undefined){
            this.onFailure = onFailure;
        }
    }

    resolveAttack(user:DHGPlayer, target:DHGPlayer, manager?:DHGManager, attacks?:number):number{
        let successes:number = 0;
        if(attacks == undefined){attacks = this.attacks}
        for(let i = 0; i < attacks; i++){
            for(let fn of this.before){fn(user,target,manager)}
            if(this.use(user,target,manager)){
                successes += 1;
                for(let fn of this.onSuccess){fn(user,target,manager)}
            }else{
                for(let fn of this.onFailure){fn(user,target,manager)}
            }
            for(let fn of this.after){fn(user,target,manager)}
        }
        return successes;
    }
}

export class DHGWeaponBuilder extends DHGObjectBuilder {

    name!:string;

    /**
     * the number of attacks of the weapon
     */
    attacks!:number;

    /**
     * the damage of each attack of the weapon
     */
    damage!:number;

    /**
     * the accuracy of each attack of the weapon
     */
    accuracy!:number;

    /**
     * the range of the weapon
     */
    range:number = 0;

    /**
     * the noise of the weapon
     */
    noise:number = 0;

    before:((user:DHGPlayer,target?:DHGPlayer, manager?:DHGManager) => void)[] = [];
    use?:(user:DHGPlayer,target:DHGPlayer, manager?:DHGManager) => boolean;
    after:((user:DHGPlayer,target?:DHGPlayer, manager?:DHGManager) => void)[] = [];
    onSuccess:((user:DHGPlayer,target?:DHGPlayer, manager?:DHGManager) => void)[] = [];
    onFailure:((user:DHGPlayer,target?:DHGPlayer, manager?:DHGManager) => void)[] = [];

    setName(name:string):DHGWeaponBuilder{
        this.name = name;
        return this;
    }

    setNumberOfAttacks(attacks:number):DHGWeaponBuilder{
        this.attacks = attacks;
        return this;
    }

    setDamage(damage:number):DHGWeaponBuilder{
        this.damage = damage
        return this;
    }

    setAccuracy(accuracy:number):DHGWeaponBuilder{
        this.accuracy = accuracy;
        return this;
    }

    setRange(range:number):DHGWeaponBuilder{
        this.range = range;
        return this;
    }

    setNoise(noise:number):DHGWeaponBuilder{
        this.noise = noise;
        return this;
    }

    addBefore(before:(user:DHGPlayer, target?:DHGPlayer, manager?:DHGManager) => void):DHGWeaponBuilder{
        this.before.push(before);
        return this;
    }

    setUse(use:(user:DHGPlayer, target:DHGPlayer, manager?:DHGManager) => boolean):DHGWeaponBuilder{
        this.use = use;
        return this;
    }

    addOnFailure(onFailure:(user:DHGPlayer, target?:DHGPlayer, manager?:DHGManager) => void):DHGWeaponBuilder{
        this.onFailure.push(onFailure);
        return this;
    }

    addOnSuccess(onSuccess:(user:DHGPlayer, target?:DHGPlayer, manager?:DHGManager) => void):DHGWeaponBuilder{
        this.onSuccess.push(onSuccess);
        return this;
    }

    addAfter(after:(user:DHGPlayer, target?:DHGPlayer, manager?:DHGManager) => void):DHGWeaponBuilder{
        this.after.push(after);
        return this;
    }

    build():DHGWeapon{
        if(this.name == undefined){
            throw new DHGValidationError("Weapon needs name");
        }else if(this.name.length < 1 || this.name.length > 32){
            throw new DHGValidationError("Weapon name length needs to be between 1 and 32");
        }else if(this.attacks == undefined){
            throw new DHGValidationError("Weapon needs a number of attacks");
        }else if(this.attacks < 1){
            throw new DHGValidationError("Weapon needs more than 0 attacks");
        }else if(this.accuracy == undefined){
            throw new DHGValidationError("Weapon needs an accuracy value");
        }else if(this.accuracy < 0){
            throw new DHGValidationError("Weapon needs a positive accuracy value");
        }else if(this.damage == undefined){
            throw new DHGValidationError("Weapon needs a damage value");
        }else if(this.damage < 0){
            throw new DHGValidationError("Weapon needs a positive damage value");
        }

        return new DHGWeapon(this.name, this.attacks, this.damage, this.accuracy, this.range, this.noise);
    }

}

export class DHGWeaponTemplates extends DHGObjectTemplates{
    static gun:DHGWeaponBuilder = new DHGWeaponBuilder()
        .setName('gun')
        .setNumberOfAttacks(1)
        .setAccuracy(70)
        .setDamage(3)
        .setRange(1)
        .setNoise(3)
    
    static allTemplates:Map<string,DHGWeaponBuilder> = new Map<string,DHGWeaponBuilder>([
        ['gun', DHGWeaponTemplates.gun]
    ])

    static getTemplate(name:string):DHGWeaponBuilder | undefined{
        return this.allTemplates.get(name);
    }

    static randomTemplate():DHGWeaponBuilder{      
        let values:DHGWeaponBuilder[] = Array.from(this.allTemplates.values());
        return values[Math.floor(Math.random() * values.length)];
    }
}