import { Client, GatewayIntentBits, Interaction, REST, Routes } from "discord.js";

import { connectMongo } from "./utils/mongo";
import dotenv from "dotenv";
import fs from "fs";
import guildMemberUpdate from "./events/guildMemberUpdate";
import interactionCreate from "./events/interactionCreate";
import path from "path";
import { pathToFileURL } from "url";

export class ExtendedClient extends Client {
	commands: Map<string, any> = new Map();
}

dotenv.config();

const client = new ExtendedClient({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
	]
});



// Register global slash commands when the bot is ready
client.once("ready", async () => {
	console.log("Discord bot is ready!");

	// Prepare the command registry
	client.commands = new Map<string, any>();
	const commands: any[] = [];
	const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.ts') || file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(__dirname, 'commands', file);
		const moduleURL = pathToFileURL(filePath).toString();
		const commandModule = await import(moduleURL);
		// Each command file must export { data, execute }
		if (commandModule.data && commandModule.execute) {
			client.commands.set(commandModule.data.name, commandModule);
			commands.push(commandModule.data.toJSON());
		}
	}

	const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
	await rest.put(Routes.applicationCommands(client.user!.id), { body: commands });
	console.log("Registered commands:");
	commands.forEach(cmd => {
		console.log(cmd.name);
	});
});

// Unified interaction handler
client.on("interactionCreate", async (interaction: Interaction) => {
	await interactionCreate(client, interaction);
});

client.on("guildMemberUpdate", guildMemberUpdate);

connectMongo(process.env.MONGODB_URI!);
client.login(process.env.DISCORD_TOKEN);
