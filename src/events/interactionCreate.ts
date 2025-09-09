import { ChatInputCommandInteraction, Client, Interaction, ModalSubmitInteraction, RoleSelectMenuInteraction } from "discord.js";

import fs from "fs";
import path from "path";

// Dynamically load all interaction handlers
const interactionHandlerFiles = fs.readdirSync(path.join(__dirname, "../interactions")).filter(f => f.endsWith(".ts") || f.endsWith(".js"));
const interactionHandlers = interactionHandlerFiles.map(file => require(path.join(__dirname, "../interactions", file)));

// Exported for use in index.ts
export default async function interactionCreate(
	client: Client,
	interaction: Interaction
): Promise<void> {
	// Handle slash commands (from command files loaded on the client)
	if (interaction.isChatInputCommand()) {
		// Use the command map provided by client.commands from index.ts
		const command = (client as any).commands?.get(interaction.commandName);
		if (!command) return;
		try {
			await command.execute(interaction as ChatInputCommandInteraction);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: "Error running command!", ephemeral: true });
		}
	}

	// Handle modals and role select menus
	for (const handler of interactionHandlers) {
		if (
			interaction.isModalSubmit() &&
			interaction.customId.startsWith(handler.customIdPrefix)
		) {
			await handler.handle(interaction as ModalSubmitInteraction);
			return;
		}
		if (
			interaction.isRoleSelectMenu() &&
			interaction.customId.startsWith(handler.customIdPrefix)
		) {
			await handler.handle(interaction as RoleSelectMenuInteraction);
			return;
		}
	}
}
