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
	.setName("add-discord-link")
	.setDescription("Add a Discord link to your group")
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.setContexts(InteractionContextType.Guild)
	.addStringOption(option =>
		option.setName("invite")
			.setDescription("The Discord invite link to add")
			.setRequired(true)
	);

export async function execute(interaction: ChatInputCommandInteraction) {
	const guild = interaction.guild;

	if (!guild) {
		await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
		return;
	}

	const group = await Group.findOne(
		{ guildId: guild.id }
	);

	if (!group) {
		await interaction.reply({ content: "No setup record found for this server. Please use /setup first.", ephemeral: true });
		return;
	}

	const invite = interaction.options.getString("invite", true).trim();
	if (!/^https?:\/\/(www\.)?discord\.gg\/.+$/.test(invite)) {
		await interaction.reply({ content: "Please provide a valid Discord invite link.", ephemeral: true });
		return;
	}

	group.discordInvite = invite;
	await group.save();
	await interaction.reply({ content: "Discord invite link added successfully!", ephemeral: true });
}

export default {
	data,
	execute
}