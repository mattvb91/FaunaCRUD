import { FaunaData } from "../src/Decorators";
import { Model } from "../src/Model";

export default class TestObject extends Model {

    collection: string = "objects";

    @FaunaData()
    public dataAttribute1: string = "attribute1"

    @FaunaData()
    public dataAttribute2: string = "attribute2"

    //Test that this does not show up in data fields 
    public localAttribute: string = "local"
}