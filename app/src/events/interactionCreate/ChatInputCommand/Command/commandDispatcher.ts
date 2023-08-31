import { ChatInputCommandInteraction } from "discord.js";
import fs from "node:fs";


export async function handle(interaction:ChatInputCommandInteraction){
    console.log('dispatching command');
    if(fs.readdirSync(__dirname).find((file) => {return file.startsWith(`${interaction.commandName}`)}) != undefined){
        const module = interaction.commandName;
        const command = await import(`./${module}`);
        const commandObject = command[module];
        const obj = new commandObject();
        obj.handler(interaction);
    }
}