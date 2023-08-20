import { BaseInteraction, ChatInputCommandInteraction } from "discord.js";


export async function dispatch(interaction:BaseInteraction){
    //console.log('dispatching interactionCreate');
    if (interaction.isChatInputCommand()) {
        const dispatcher = await import(`./ChatInputCommand/chatInputCommandDispatcher`);
        dispatcher.dispatch(interaction as ChatInputCommandInteraction);
    }
}