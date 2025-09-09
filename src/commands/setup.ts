// Inside setup.ts

import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	InteractionContextType,
	ModalBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
	TextInputBuilder,
	TextInputStyle
} from "discord.js";

export const data = new SlashCommandBuilder()
	.setName("setup")
	.setDescription("Start setting up your group")
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.setContexts(InteractionContextType.Guild);

export async function execute(interaction: ChatInputCommandInteraction) {
	const guildName = interaction.guild?.name ?? "";
	const modal = new ModalBuilder()
		.setCustomId(`setup-modal-${interaction.user.id}`)
		.setTitle("Group Setup")
		.addComponents(
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId("groupName")
					.setLabel("Group Name")
					.setStyle(TextInputStyle.Short)
					.setMaxLength(64)
					.setRequired(true)
					.setValue(guildName)
			),
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId("shortDesc")
					.setLabel("Short Description")
					.setStyle(TextInputStyle.Short)
					.setMaxLength(128)
					.setRequired(true)
			),
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId("longDesc")
					.setLabel("Long Description")
					.setStyle(TextInputStyle.Paragraph)
					.setMaxLength(2000)
					.setRequired(true)
			),
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId("bannerUrl")
					.setLabel("Banner Image URL")
					.setStyle(TextInputStyle.Short)
					.setRequired(false)
			)
		);

	await interaction.showModal(modal);
}
