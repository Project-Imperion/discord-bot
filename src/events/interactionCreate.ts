import { ChatInputCommandInteraction, Client, Interaction, ModalSubmitInteraction, RoleSelectMenuInteraction } from "discord.js";

import roleMenuSubmit from "../interactions/roleMenuSubmit.js";
import roleMenuUse from "../interactions/roleMenuUse.js";
import setupDeadSelect from "../interactions/setupDeadSelect.js";
import setupModalSubmit from "../interactions/setupModalSubmit.js";
import setupRoleSelect from "../interactions/setupRoleSelect.js";

const interactionHandlers = [setupModalSubmit, setupRoleSelect, setupDeadSelect, roleMenuSubmit, roleMenuUse];

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
			//@ts-ignore
			await handler.handle(interaction as ModalSubmitInteraction);
			return;
		}
		if (
			interaction.isRoleSelectMenu() &&
			interaction.customId.startsWith(handler.customIdPrefix)
		) {
			//@ts-ignore
			await handler.handle(interaction as RoleSelectMenuInteraction);
			return;
		}
		if (
			interaction.isButton() &&
			interaction.customId.startsWith(handler.customIdPrefix)
		) {
			//@ts-ignore
			await handler.handle(interaction as ButtonInteraction);
			return;
		}
	}
}
