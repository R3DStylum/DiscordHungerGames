import { Client, ClientOptions } from "discord.js";
import { handleEvents } from "./events/eventDispatcher";
import { registerCommands } from "./events/interactionCreate/ChatInputCommand/Command/commandRegisterer";
require('dotenv').config(); // sinon problème après compilation

console.log("Bot is starting...");

const client = new Client({
    intents: []
});
registerCommands();
handleEvents(client);
client.login(process.env.TOKEN);