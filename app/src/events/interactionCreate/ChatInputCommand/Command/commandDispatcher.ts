import { ChatInputCommandInteraction } from "discord.js";
import fs from "node:fs";


export async function handle(interaction:ChatInputCommandInteraction){
    if(fs.readdirSync(__dirname).find((value) => {value === `${interaction.commandName}.ts`}) != undefined){
        const commandHandler = await import(`./${interaction.commandName}`);
    }
}