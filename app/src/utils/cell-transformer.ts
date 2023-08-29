export function transform(baseId:number):number{
    return (baseId*2)+5
}

export function detransform(transformedId:number):number{
    return (transformedId-5)/2
}