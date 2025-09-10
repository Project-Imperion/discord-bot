import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageActionRowComponentBuilder } from "discord.js";

import RoleMenu from "../models/roleMenu.js";
import { RoleSelectMenuInteraction } from "discord.js";

export const customIdPrefix = "role-menu-select-";

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

	const currentRoleMenu = await RoleMenu.findOne({ guildId: guild.id })
		|| new RoleMenu({
			guildId: guild.id,
			channelId: interaction.channelId
		});

	if (!currentRoleMenu.messageId) {
		if (!interaction.channel?.isSendable()) {
			await interaction.reply({ content: "I don't have permission to send messages in this channel.", ephemeral: true });
			return;
		}

		try {
			const message = await interaction.channel.send({
				content: "Setting up role menu...",
			});

			currentRoleMenu.messageId = message.id;

		} catch (error) {
			await interaction.reply({ content: "There was an error setting up the role menu. Please check I have permissions to send messages in this channel.", ephemeral: true });
			return;
		}
	}


	currentRoleMenu.roles = interaction.values.map(roleId => ({ roleId }));
	await currentRoleMenu.save();

	const embed = new EmbedBuilder()
		.setTitle("Role Menu")
		.setDescription("Select roles from the menu below to assign or remove them from yourself.")
		.setColor(0x4C061D);

	const components: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [];

	for (let i = 0; i < currentRoleMenu.roles.length; i += 5) {
		const row = new ActionRowBuilder<MessageActionRowComponentBuilder>();
		const buttonsForRow = currentRoleMenu.roles.slice(i, i + 5).map(role =>
			new ButtonBuilder()
				.setCustomId(`role-menu-use-${role.roleId}`)
				.setLabel(guild.roles.cache.get(role.roleId)?.name || "Unknown Role")
				.setStyle(ButtonStyle.Secondary)
		);
		row.addComponents(...buttonsForRow);
		components.push(row);
	}


	await interaction.channel?.messages.fetch(currentRoleMenu.messageId).then(async (msg) => {
		await msg.edit({
			content: "",
			embeds: [embed],
			components
		});
	});


	await interaction.update({
		content: "Role menu updated! Users can now select roles from the menu in the original message.",
		components: [],
	});
}

export default {
	customIdPrefix,
	handle,
}