import { GuildMember } from "discord.js";
import RoleMenu from "../models/roleMenu.js";
import { RoleSelectMenuInteraction } from "discord.js";

export const customIdPrefix = "role-menu-use-";

export async function handle(interaction: RoleSelectMenuInteraction) {
	const guild = interaction.guild;

	if (!guild) {
		await interaction.reply({ content: "Setup must be run in a server.", ephemeral: true });
		return;
	}

	const roleId = interaction.customId.split("-").slice(3).join("-");
	const role = guild.roles.cache.get(roleId);

	if (!role) {
		await interaction.reply({ content: "The selected role does not exist.", ephemeral: true });
		return;
	}

	const currentRoleMenu = await RoleMenu.findOne({ guildId: guild.id });
	if (!currentRoleMenu) {
		await interaction.reply({ content: "No role menu is set up in this server. Please set one up first.", ephemeral: true });
		return;
	}
	if (!currentRoleMenu.roles.find(r => r.roleId === roleId)) {
		await interaction.reply({ content: "The selected role is not part of the current role menu.", ephemeral: true });
		return;
	}

	const member = interaction.member;
	if (!member || !("roles" in member)) {
		await interaction.reply({ content: "Could not fetch your member information.", ephemeral: true });
		return;
	}
	if (!(member instanceof GuildMember)) {
		await interaction.reply({ content: "You are not a valid guild member.", ephemeral: true });
		return;
	}

	try {
		const hasRole = member.roles.cache.has(roleId);
		if (hasRole) {
			await member.roles.remove(roleId);
			await interaction.reply({ content: `The role **${role.name}** has been removed from you.`, ephemeral: true });
		} else {
			await member.roles.add(roleId);

			await interaction.reply({ content: `The role **${role.name}** has been added to you.`, ephemeral: true });
		}
	} catch (error) {
		await interaction.reply({ content: "There was an error assigning or removing the role. Please ensure I have the correct permissions, and my role is above the role being modified.", ephemeral: true });
	}
}

export default {
	customIdPrefix,
	handle,
}