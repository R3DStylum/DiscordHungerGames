import { BaseInteraction, ButtonInteraction, ChatInputCommandInteraction } from "discord.js";


export async function dispatch(interaction:BaseInteraction){
    //console.log('dispatching interactionCreate');
    if (interaction.isChatInputCommand()) {
        const dispatcher = await import(`./ChatInputCommand/chatInputCommandDispatcher`);
        dispatcher.dispatch(interaction as ChatInputCommandInteraction);
    }
    if (interaction.isButton()) {
        const dispatcher = await import(`./Button/buttonDispatcher`);
        dispatcher.dispatch(interaction as ButtonInteraction);
    }
}