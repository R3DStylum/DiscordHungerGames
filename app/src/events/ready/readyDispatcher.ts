import { Client } from "discord.js";


export async function dispatch(client:Client){
    console.log(`${client.user?.displayName} is ready`)
}