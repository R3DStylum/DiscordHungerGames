import { Client, ClientOptions } from "discord.js";
import { handleEvents } from "./events/eventDispatcher";
require('dotenv').config(); // sinon problème après compilation

console.log("Bot is starting...");

const client = new Client({
    intents: []
});

handleEvents(client);
client.login(process.env.TOKEN);