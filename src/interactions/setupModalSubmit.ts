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

	// Upsert group record for this guild
	await Group.findOneAndUpdate(
		{ guildId: guild.id },
		{
			name: groupName,
			shortDesc,
			longDesc,
			bannerUrl,
			roleId: "",
			memberCount: 0,
			guildId: guild.id
		},
		{ upsert: true, new: true, setDefaultsOnInsert: true }
	);

	// Role selection menu
	const roleMenu = new RoleSelectMenuBuilder()
		.setCustomId(`role-select-${guild.id}`)
		.setPlaceholder(`Select the role to track ${groupName}'s member count`)
		.setMinValues(1)
		.setMaxValues(1);

	const row = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(roleMenu);

	await interaction.reply({
		content: "Now select a role to track:",
		components: [row],
		ephemeral: true,
	});
}
