import { Client, ClientOptions, GatewayIntentBits } from "discord.js";
import { handleEvents } from "./events/eventDispatcher";
import { registerCommands } from "./events/interactionCreate/ChatInputCommand/Command/commandRegisterer";
require('dotenv').config(); // sinon problème après compilation

console.log("Bot is starting...");

const client = new Client({
    intents: [
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent
    ]
});
registerCommands();
handleEvents(client);
client.login(process.env.TOKEN);