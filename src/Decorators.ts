/**
 * This is our decorator for defining which fields of our
 * model is saved into the fauna data { } object.
 */
export function FaunaData(): PropertyDecorator {
    return (target, key) => {
        const fields = Reflect.getOwnMetadata('FaunaData', target) || [];
        if (!fields.includes(key)) {
            fields.push(key)
        }
        Reflect.defineMetadata('FaunaData', fields, target)
    }
}
