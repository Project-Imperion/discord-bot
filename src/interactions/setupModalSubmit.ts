// src/interactions/setupModalSubmit.ts

import { ActionRowBuilder, ModalSubmitInteraction, RoleSelectMenuBuilder } from "discord.js";

import Group from "../models/group.js";

export const customIdPrefix = "setup-modal-";

export async function handle(interaction: ModalSubmitInteraction) {
	const guild = interaction.guild;
	if (!guild) {
		await interaction.reply({ content: "Setup must be run in a server.", ephemeral: true });
		return;
	}

	if (!interaction.memberPermissions?.has("Administrator")) {
		await interaction.reply({ content: "You must have admin permissions to run this command.", ephemeral: true });
		return;
	}

	const groupName = interaction.fields.getTextInputValue("groupName");
	const shortDesc = interaction.fields.getTextInputValue("shortDesc");
	const longDesc = interaction.fields.getTextInputValue("longDesc");
	const bannerUrl = interaction.fields.getTextInputValue("bannerUrl");
	const websiteUrl = interaction.fields.getTextInputValue("websiteUrl");
	const discordInvite = interaction.fields.getTextInputValue("discordInvite").trim();

	if (discordInvite && !/^https?:\/\/(www\.)?discord\.gg\/.+$/.test(discordInvite)) {
		await interaction.reply({ content: "Please provide a valid Discord invite link.", ephemeral: true });
		return;
	}

	await Group.findOneAndUpdate(
		{ guildId: guild.id },
		{
			name: groupName,
			shortDesc,
			longDesc,
			bannerUrl,
			websiteUrl,
			memberCount: 0,
			discordInvite,
			guildId: guild.id,
		},
		{ upsert: true, new: true, setDefaultsOnInsert: true }
	);

	// Role selection menu
	const roleMenu = new RoleSelectMenuBuilder()
		.setCustomId(`role-select-${guild.id}`)
		.setPlaceholder(`Select the role to track ${groupName}'s member count`)
		.setMinValues(1)
		.setMaxValues(1);

	const deadMenu = new RoleSelectMenuBuilder()
		.setCustomId(`dead-role-select-${guild.id}`)
		.setPlaceholder(`Select the role to assign to dead members`)
		.setMinValues(1)
		.setMaxValues(1);

	const roleRow = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(roleMenu);
	const deadRow = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(deadMenu);

	await interaction.reply({
		content: "Now select roles to track member count:",
		components: [roleRow],
		ephemeral: true,
	});

	await interaction.followUp({
		content: "Select the role you will assign to dead members:",
		components: [deadRow],
		ephemeral: true,
	});
}

export default {
	customIdPrefix,
	handle,
}