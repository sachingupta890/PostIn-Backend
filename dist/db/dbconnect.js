import mongoose from "mongoose";
export const dbConnect = () => mongoose.connect("mongodb://localhost:27017", {
    dbName: "PostInDatabase",
})
    .then((c) => console.log(`Db Connected to ${c.connection.host}`))
    .catch((err) => console.error(err));
