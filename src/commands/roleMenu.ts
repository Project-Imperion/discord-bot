import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	InteractionContextType,
	PermissionFlagsBits,
	RoleSelectMenuBuilder,
	SlashCommandBuilder,
} from "discord.js";

import RoleMenu from "../models/roleMenu.js";

export const data = new SlashCommandBuilder()
	.setName("role-menu")
	.setDescription("Create or update the role menu")
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.setContexts(InteractionContextType.Guild);

export async function execute(interaction: ChatInputCommandInteraction) {
	let existingMenu = await RoleMenu.findOne({
		guildId: interaction.guildId!
	});


	// check message still exists
	if (existingMenu) {
		try {
			const msg = await interaction.channel?.messages.fetch(existingMenu.messageId);
			if (!msg) {
				await RoleMenu.deleteOne({ guildId: interaction.guildId! });
				existingMenu = null;
			}
		} catch {
			await RoleMenu.deleteOne({ guildId: interaction.guildId! });
			existingMenu = null;
		}
	}


	const roleMenuBuilder = new RoleSelectMenuBuilder()
		.setCustomId(`role-menu-select-${interaction.guildId}`)
		.setPlaceholder("Select roles to include in the role menu")
		.setMinValues(0)
		.setMaxValues(25);

	const row = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(roleMenuBuilder);


	await interaction.reply({
		content: existingMenu ?
			"Update the roles in the role menu by selecting new roles:" :
			"Create a new role menu by selecting roles:",
		components: [row],
		ephemeral: true,
	})
}

export default {
	data,
	execute
}