import { ButtonInteraction } from "discord.js";
import fs from "node:fs";


export async function dispatch(interaction:ButtonInteraction) {
    console.log('dispatching button');
    if(!interaction.customId.includes(":")){
        console.log('button custom id is badly configured');
        return;
    }
    const handler = interaction.customId.split(":")[0];
    if(fs.readdirSync(__dirname).find((file) => {return file.startsWith(`${handler}`)}) != undefined){
        const module = handler;
        const command = await import(`./${module}`);
        const commandObject = command[module];
        const obj = new commandObject();
        obj.handler(interaction);
    }
}