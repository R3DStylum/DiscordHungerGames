import { ChatInputCommandInteraction } from "discord.js";
import { handle } from "./Command/commandDispatcher";

export async function dispatch(interaction:ChatInputCommandInteraction) {
    //console.log('dispatching chatInputCommand');
    handle(interaction);
}