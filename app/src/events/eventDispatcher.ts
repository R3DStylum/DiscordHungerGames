import { Client } from "discord.js";
import fs from "node:fs";

export async function handleEvents(client : Client):Promise<void> {
    fs.readdirSync(__dirname).filter((file) => !file.includes(".")).forEach(async (directory) => {
        const dispatcher = await import(`./${directory}/${directory}Dispatcher`);
        client.on(directory, (data) => dispatcher.dispatch(data));
    })
}