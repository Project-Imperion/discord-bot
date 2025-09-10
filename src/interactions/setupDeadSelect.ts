import Group from "../models/group.js";
import { RoleSelectMenuInteraction } from "discord.js";

export const customIdPrefix = "dead-role-select-";

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

	const deadRoleId = interaction.values[0];

	// Get current member count for the selected role
	await guild.members.fetch();
	const deadCount = guild.members.cache.filter(m => m.roles.cache.has(deadRoleId)).size;

	// Update group record for this guild
	const result = await Group.findOneAndUpdate(
		{ guildId: guild.id },
		{ deadRoleId, deadCount },
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
		content: "Dead role selection complete! Remember to update people with the dead role, we suggest using /role-menu for this.",
		components: [],
	});
}

export default {
	customIdPrefix,
	handle,
}