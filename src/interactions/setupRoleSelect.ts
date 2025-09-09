// src/interactions/setupRoleSelect.ts

import Group from "../models/group.js";
import { RoleSelectMenuInteraction } from "discord.js";

export const customIdPrefix = "role-select-";

export async function handle(interaction: RoleSelectMenuInteraction) {
	const guild = interaction.guild;
	if (!guild) {
		await interaction.reply({ content: "Setup must be run in a server.", ephemeral: true });
		return;
	}

	if (!interaction.memberPermissions?.has("Administrator")) {
		await interaction.reply({ content: "You must have admin permissions to run this command.", ephemeral: true });
		return;
	}

	const roleId = interaction.values[0];

	// Get current member count for the selected role
	const memberCount = guild.members.cache.filter(m => m.roles.cache.has(roleId)).size;

	// Update group record for this guild
	const result = await Group.findOneAndUpdate(
		{ guildId: guild.id },
		{ roleId, memberCount },
		{ new: true }
	);

	if (!result) {
		await interaction.update({
			content: "Error: No setup record found for this server. Please use /setup again.",
			components: [],
		});
		return;
	}

	await interaction.update({
		content: "Setup complete! Your group is fully registered.",
		components: [],
	});
}
