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
	const guild = interaction.guild;
	if (!guild) {
		await interaction.reply({ content: "Setup must be run in a server with the bot present.", ephemeral: true });
		return;
	}

	if (!interaction.memberPermissions?.has("Administrator")) {
		await interaction.reply({ content: "You must have admin permissions to run this command.", ephemeral: true });
		return;
	}

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
					.setLabel("Long Description (supports markdown)")
					.setStyle(TextInputStyle.Paragraph)
					.setMaxLength(2000)
					.setRequired(true)
					.setValue(longDesc)
			),
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId("bannerUrl")
					.setLabel("Optional: Banner Image URL (we recommend 2:3)")
					.setStyle(TextInputStyle.Short)
					.setRequired(false)
					.setValue(bannerUrl)
			),
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId("websiteUrl")
					.setLabel("Optional: Website URL (start with https://)")
					.setStyle(TextInputStyle.Short)
					.setRequired(false)
					.setValue(websiteUrl)
			),
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId("discordInvite")
					.setLabel("Optional: Discord Invite URL")
					.setStyle(TextInputStyle.Short)
					.setRequired(false)
					.setValue(discordInvite)
			)
		);

	await interaction.showModal(modal);


	const embed = {
		title: "Imperion Bot Notice",
		description: [
			"**Imperion is an independent group, and is not associated with Ish's State or its team.**",
			"\n- This bot must **never** be given additional permissions.",
			"- The Imperion role must **never** be elevated above any privileged roles, such as event staff or group admins.",
			"- The bot does **not** collect any additional data outside of the group name and any data you add into the form.",
			"- All of this data will be **deleted after the event ends**."
		].join("\n"),
		color: 0x2b2d31
	};

	await interaction.followUp({
		embeds: [embed],
		ephemeral: true
	});

}

export default {
	data,
	execute
}