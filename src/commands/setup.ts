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

import Group from "../models/group.js";

export const data = new SlashCommandBuilder()
	.setName("setup")
	.setDescription("Start setting up your group")
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.setContexts(InteractionContextType.Guild);

export async function execute(interaction: ChatInputCommandInteraction) {
	const group = await Group.findOne({
		guildId: interaction.guildId!
	});

	const shortDesc = group?.shortDesc ?? "";
	const longDesc = group?.longDesc ?? "";
	const bannerUrl = group?.bannerUrl ?? "";
	const websiteUrl = group?.websiteUrl ?? "";
	const discordInvite = group?.discordInvite ?? "";


	const modal = new ModalBuilder()
		.setCustomId(`setup-modal-${interaction.user.id}`)
		.setTitle("Group Setup")
		.addComponents(
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId("shortDesc")
					.setLabel("Short Description")
					.setStyle(TextInputStyle.Short)
					.setMaxLength(128)
					.setRequired(true)
					.setValue(shortDesc)
			),
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId("longDesc")
					.setLabel("Long Description")
					.setStyle(TextInputStyle.Paragraph)
					.setMaxLength(2000)
					.setRequired(true)
					.setValue(longDesc)
			),
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId("bannerUrl")
					.setLabel("Banner Image URL (we recommend 600x900)")
					.setStyle(TextInputStyle.Short)
					.setRequired(false)
					.setValue(bannerUrl)
			),
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId("websiteUrl")
					.setLabel("Website URL")
					.setStyle(TextInputStyle.Short)
					.setRequired(false)
					.setValue(websiteUrl)
			),
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId("discordInvite")
					.setLabel("Discord Invite URL")
					.setStyle(TextInputStyle.Short)
					.setRequired(false)
					.setValue(discordInvite)
			)
		);

	await interaction.showModal(modal);
}

export default {
	data,
	execute
}