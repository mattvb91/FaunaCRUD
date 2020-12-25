import * as faunadb from 'faunadb';
import "reflect-metadata";

const q = faunadb.query

const client = new faunadb.Client({
    secret: process.env.FAUNA_SECRET as string,
})

type Constructor<T> = {
    new(): T
}

type Document = {
    ref: faunadb.Expr,
    ts: BigInt,
    data: object
}

/**
 * Model is a representation of a an item within 
 * a collection.
 */
export abstract class Model {

    /**
     * We generate the associated collections
     * from the model name
     */
    abstract readonly collection: string;

    getModelName() {
        return this.collection
    }

    /**
     * https://docs.fauna.com/fauna/current/api/fql/functions/ref?lang=javascript
     * 
     * The Ref command does not verify that the schema_ref, or the id within the schema_ref, exists. 
     * This means that you can use Ref to create a reference to a non-existent document in a non-existent schema.
     * 
     * If you want to validate that your document exists use this.exists() instead
     */
    ref?: faunadb.Expr; //TODO Should be readonly

    /**
     * timestamp that identifies when the document was most recently updated.
     */
    ts?: BigInt; //TODO Should be readonly

    /**
     * Identifier of the document.
     * 
     * This is only ever set once a document has been created or retrieved 
     * from fauna
     */
    key?: string; //TODO Should be readonly

    /**
     * Get an instance of a document by its id
     * 
     * TODO proper error handling 
     */
    static async getById<T extends Model>(this: Constructor<T>, id: string): Promise<T | null> {

        try {
            const instance = new this as T;

            const item: Document = await client.query(
                q.Get(
                    q.Ref(q.Collection(instance.getModelName()), id)
                )
            )

            instance.assignData(item);

            return instance as T
        }
        catch (e) {
            return null
        }
    }

    /**
     * Get total document count for this model
     */
    static async count() {
        //TODO implement q.count() on index set
    }


    /**
     * Create a new document return instance with
     * assigned ref, ts and key
     */
    async create(): Promise<this> {

        const created: Document = await client.query(
            q.Create(
                q.Collection(this.collection), {
                data: { ...this.getData() }
            })
        );

        this.ref = created.ref;
        this.ts = created.ts;

        //@ts-ignore TODO fix getting the ref id error
        this.key = this.ref.id;

        return this;
    }

    /**
     * Updates a document and updates the instances ts
     */
    async update(): Promise<this> {
        const updated: Document = await client.query(
            q.Update(q.Ref(q.Collection(this.collection), this.key), {
                data: { ...this.getData() }
            })
        )

        this.ts = updated.ts;

        return this;
    }

    /**
     * Delete an instance
     * 
     * TODO better return check to validate success
     */
    async delete(): Promise<Boolean> {
        const deleteRequest = await client.query(
            q.Delete(this.ref as faunadb.ExprArg)
        )

        delete this.key;
        delete this.ref;
        delete this.ts;

        return deleteRequest instanceof Object;
    }

    /**
     * Check if this document exists. As keys are only ever 
     * set during the remote creation process we can be sure that a document is 
     * exists.
     */
    public exists(): Boolean {
        return this.key !== undefined;
    }

    /**
     * Get our current objects data values
     * defined through 
     */
    getData(): object {
        const data = {}

        this.getDataFields().map(field => {
            data[field] = this[field]
        })

        return data;
    }

    /**
     * Should instead use new() constructor to set readonly attributes
     * on Model instance
     */
    private assignData(document: Document): Model {

        this.ref = document.ref;
        this.ts = document.ts;

        //@ts-ignore TODO fix getting the ref id error
        this.key = this.ref.id;

        this.getDataFields().map(field => {
            this[field] = document.data[field]
        })

        return this
    }

    /**
     * Collect the names of all the attributes 
     * we have decorated to be included in data
     */
    getDataFields(): string[] {
        const fields: string[] = []
        let target = Object.getPrototypeOf(this);
        while (target != Object.prototype) {
            const childFields = Reflect.getOwnMetadata('FaunaData', target) || [];
            fields.push(...childFields);
            target = Object.getPrototypeOf(target);
        }

        return fields;
    }
}