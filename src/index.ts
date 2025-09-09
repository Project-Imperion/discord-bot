import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from "discord.js";

import dotenv from "dotenv";

dotenv.config();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers // Only needed for member and role change events
	]
});

// Register global slash commands when the bot is ready
client.once("ready", async () => {
	console.log("Discord bot is ready!");

	// Define global commands (registered for ALL servers the bot is in)
	const commands = [
		new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!')
	].map(cmd => cmd.toJSON());

	const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

	// Global registration
	await rest.put(Routes.applicationCommands(client.user!.id), { body: commands });
	console.log("Global slash commands registered.");
});

// Respond to interactions
client.on("interactionCreate", async interaction => {
	if (!interaction.isChatInputCommand()) return;
	if (interaction.commandName === "ping") {
		await interaction.reply("Pong!");
	}
});

client.login(process.env.DISCORD_TOKEN);
