import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes, SlashCommandBuilder } from 'discord.js';
import fs from 'node:fs';
import { Command } from './Command';

export async function registerCommands() {
    const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
    console.log(__dirname);
	
    //grab commandFiles
    const commandFiles = fs.readdirSync(__dirname).filter((file: string) => new RegExp(/^[a-z]+\...$/).test(file));

    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    for (const file of commandFiles) {
        const module = file.substring(0,file.length-3)
        console.log(`trying to import module : ./${module}`)
	    const command = await import("./" + module);
        console.log(command[module]);
        const commo = command[module];
        const obj = new commo();
        console.log(obj);
        console.log(obj.builder);
        commands.push(obj.builder.toJSON() as RESTPostAPIChatInputApplicationCommandsJSONBody);
        console.log(`pushed JSON for ${module}`);
    }

    // Construct and prepare an instance of the REST module
    const rest = new REST().setToken(process.env.TOKEN as string);

// and deploy your commands!
    (async () => {
	    try {
		    console.log(`Started refreshing ${commands.length} application (/) commands.`);

		    // The put method is used to fully refresh all commands in the guild with the current set
		    const data = await rest.put(
			    Routes.applicationGuildCommands(process.env.CLIENT_ID as string, process.env.GUILD_ID as string),
			    { body: commands },
		    );

		    console.log(`Successfully reloaded ${(data as any).length} application (/) commands.`);
	    } catch (error) {
		    // And of course, make sure you catch and log any errors!
		    console.error(error);
	    }
    })();
}

