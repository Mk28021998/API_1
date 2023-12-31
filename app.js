const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

let dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen("3000", () => {
      console.log("Server is running on http:/local:3000/players");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

app.get("/players/", async (request, response) => {
  const getPayersQuery = `
    SELECT
        * 
    FROM
        cricket_team;`;
  let players = await db.all(getPayersQuery);
  response.send(players);
});

//Add Players API
app.post("/players/", async (request, response) => {
  const playersDetails = request.body;
  const { playerName, jerseyNumber, role } = playersDetails;
  const addPlayerQuery = `
    INSERT INTO
        cricket_team(player_name,jersey_number,role)
    VALUES 
        (
           '${playerName}',
            ${jerseyNumber},
           '${role}'
        );`;
  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//GET PLAYER FROM PLAYER_ID

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `
    SELECT
    * FROM
       cricket_team
    WHERE
       player_id=${playerId};`;
  let player = await db.get(playerQuery);
  response.send(player);
});

//UPDATE PLAYERS API

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playersDetails = request.body;
  const { playerName, jerseyNumber, role } = playersDetails;
  const updatePlayerQuery = `
    UPDATE
        cricket_team
    SET
        player_name='${playerName}',
        jersey_number=${jerseyNumber},
        role='${role}'
    WHERE
        player_id=${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//Delete API

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
        DELETE FROM 
            cricket_team
        WHERE
            player_id=${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
