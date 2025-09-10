import { ActivityType, Client, GatewayIntentBits, Interaction, REST, Routes } from "discord.js";

import addDiscordLink from "./commands/addDiscordLink";
import { connectMongo } from "./utils/mongo";
import dotenv from "dotenv";
import guildMemberUpdate from "./events/guildMemberUpdate";
import interactionCreate from "./events/interactionCreate";
import setupCommand from "./commands/setup.js";

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

	client.user?.setPresence({
		activities: [{
			name: "Project-Imperion.com",
			type: ActivityType.Custom,
			state: "Project-Imperion.com"
		}],
		status: "online"
	});

	client.commands = new Map<string, any>();

	const commandModules = [setupCommand, addDiscordLink];
	const commands: any[] = [];

	for (const commandModule of commandModules) {
		client.commands.set(commandModule.data.name, commandModule);
		commands.push(commandModule.data.toJSON());
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
