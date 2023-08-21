import { MongoClient } from "mongodb";
import { ObjectId } from "mongodb";

/*
 * Requires the MongoDB Node.js Driver
 * https://mongodb.github.io/node-mongodb-native
 */

const agg = [
    {
        $match: {
            product: new ObjectId("64e10fea5d0fa962dd6ef834"),
        },
    },
    {
        $group: {
            _id: null,
            averageRating: {
                $avg: "$rating",
            },
            numOfReviews: {
                $sum: 1,
            },
        },
    },
];

const client = await MongoClient.connect("", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const coll = client.db("e-commerceAPI").collection("reviews");
const cursor = coll.aggregate(agg);
const result = await cursor.toArray();
await client.close();
