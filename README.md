
# FaunaCRUD

This is more or less a <b>proof of concept</b> playing around with typescript annotations to see if it was possible to come up with a tiny typed "model" to do some very basic CRUD operations to FaunaDB.

Any attribute on your model that is annotated with `@FaunaData()` will be saved into your fauna document and parsed back out again when accessing it.

If you are looking for something more fleshed out your should check some of the following out:

[faunadb-fql-lib](https://github.com/shiftx/faunadb-fql-lib)

[biota](https://github.com/gahabeen/biota)

[fauna_orm](https://github.com/graphflo/fauna_orm)


### Getting started

```bash
yarn add fauna-crud

npm i fauna-crud
```

This currently requires `FAUNA_SECRET` to be set in your runtime environment as your access key.

Create a `users` collection in your FaunaDB. We can then create the following `User` class:

```ts
import { FaunaData, Model } from "fauna-crud/dist/index";

export default class User extends Model {

    collection: string = "users";

    @FaunaData()
    public name: string

    @FaunaData()
    public surname: string
}
```

The class can now be used to set the following attributes:

```ts
const user = new User();
user.name = "Joe"
user.surname = "Blogs"
user.save()
```

Which results in the following saved into your FaunaDB

```json
{
  "ref": Ref(Collection("users"), "285872613051335175"),
  "ts": 1608888218906000,
  "data": {
    "name": "Joe",
    "surname": "Blogs"
  }
}
```

Other operations:

```ts

//Static function available on your extended model class
const user = User.getById("285872613051335175")

//Functions available on your instance
user.delete()

//Update object after making changes to attributes
user.name = "Joe2"
user.update()

//Check if current instance exists
user.exists() 

```

You can also check out the [tests](./tests/Model.spec.ts) for some more info


## Limitations & ideas

This will currently only work with a flat / very basic document structure. I have not tested this with nested objects.
Ideally the `ref, ts, key` attributes on the root model would be `readonly` and only set when something is retrieved from Fauna.
The current setup is more or less a workaround because I couldn't figure out how to get the constructor working properly without loosing
the typings on your created child model.

There is potential to play around with foreign document relations using the `ref` when loading an instance and then parse the associated document with `getById()`.

We could reverse the `getDataFields()` method in order to fetch remote document fields and then use that to auto generate models based on existing remote schemas and automatically add the `@FaunaData()` annotations with a binary that makes various options available as a cli script.
