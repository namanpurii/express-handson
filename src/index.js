//Referring to = https://www.youtube.com/watch?v=nH9E25nkk3I
import express from "express"
import {JSONFilePreset} from "lowdb/node"
import productsRoute from "../api routes/products.js"
import usersRoute from "../api routes/users.js"

const app = express();

const port  = 3000;

//create db.json
const defaultData = { users: [] }
const db = await JSONFilePreset('db.json', defaultData)
// await db.update(({ users }) => users.push({id: 1, username: "_naman", displayName: "Naman"}));
app.use("/api/products", productsRoute);
app.use("/api/users", usersRoute); 

app.listen(port, ()=>{
    console.log(`Express server listening on port ${port}`);
})
