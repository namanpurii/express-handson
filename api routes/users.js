import express from "express";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
const router = express.Router();

//Tried looking for how to import json in ESM
//Source: https://www.stefanjudis.com/snippets/how-to-import-json-files-in-es-modules-node-js/
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const userData = require("../db.json");

router.use(express.json()); //Middleware to parse JSON request bodies, this would only work for this route i.e api/users
//if you want this to work throughout the server, then add this to index.js

// URL Request Parameters
router.get("/:userId", (req, res, next) => {
  //lets fetch the userId from if it exists in our records and send it as response
  const userId = parseInt(req.params.userId);
  // [ISSUE] this method fails to work if we are trying to pass in newly added userID param 
  const foundUser = userData.users.find((user) => user.id === userId); //return an array if userId exists in record, else returns undefined
  if (!foundUser) res.sendStatus(404);
  else res.status(200).json({ msg: "Found User: " + foundUser.displayName });
});

//Query Parameters: These are generally passed with a GET request from the client-side
// Example: "example.com/api/users?filter=username&value=an"

router.get("/", (req, res, next) => {
  const { filter, val } = req.query;
  //if the req.query object contains both filter and val, then we'll filter out the records
  if (filter && val) {
    const filteredResult = userData.users.filter((user) => user[filter]?.includes(val));
    filteredResult.length === 0 ? res.status(200).send({ status: res.statusCode, msg: "No records found" }) : res.status(200).send(filteredResult);
  }
  //if there are no query parameters or the object keys aren't the same. We will pass the control over to the immediately next route handler for "/api/users". Learn more about this: https://expressjs.com/
  else next("route");
});

router.get("/", (req, res) => {
  // res.status(200).send(usersData.users)
  res.sendStatus(200);
});

//We will use ThunderClient extension to make POST requests, otherwise we could also use JavaScript's fetch api to make the POST request like so:
// (async () => {
//   const rawResponse = await fetch('http://localhost:3000/api/users', {
//     method: 'POST',
//     headers: {
//       'Accept': 'application/json',
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({a: 1, b: 'Textual content'})
//   });
//   const content = await rawResponse.json();
//   console.log(content);
// })();

router.post("/", (req, res) => {
  // mockUsers.push(newUser) // although the problem with this is that all the new user pushed are lost when the server restarts
  //to tackle this we can make use of: 1. fs module of Nodejs to rewrite the entire data.js file, but this doesnt work well for large DBs
  //2. you could make use of a JSON DB i.e. a json file to store records using packages like "json-server" or "lowdb"
  //3. Make use of SQLite to have an entire DB as a single-file.
  const newUser = req.body;
  async function updateDB () {
    const db = new Low(new JSONFile("db.json"), {});
    try{
      await db.read()
      await db.data.users.push(newUser);
      await db.write()
    } catch(err) {
      console.error(err)
      res.sendStatus(501) //not able to update the DB because of some server side error
      return
    }
  }
  if(userData.users.find((user) => user.username === newUser.username || user.id === newUser.id)) {
    res.status(412).json({msg: "Precondition failed"}) 
  }
  else {
    updateDB()
    res.sendStatus(201);
  }
});

export default router;
