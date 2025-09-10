import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageActionRowComponentBuilder } from "discord.js";

import Groups from "../models/group.js";
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
			await interaction.reply({ content: "There was an error setting up the role menu. Please check I have permissions to send messages and embed links in this channel.", ephemeral: true });
			return;
		}
	}

	const group = await Groups.findOne({ guildId: guild.id });

	const memberRole = group?.roleId ? guild.roles.cache.get(group.roleId) : null;
	const deadRole = group?.deadRoleId ? guild.roles.cache.get(group.deadRoleId) : null;

	currentRoleMenu.roles = interaction.values.map(roleId => ({ roleId }));
	await currentRoleMenu.save();

	const embed = new EmbedBuilder()
		.setTitle("Role Menu")
		.setDescription(
			"Select roles from the menu below to assign or remove them from yourself."
			+ (memberRole && currentRoleMenu.roles.find(role => role.roleId === memberRole.id) ? `\n\nAssign **${memberRole.name}** to become a member of the group` : "")
			+ (deadRole && currentRoleMenu.roles.find(role => role.roleId === deadRole.id) ? `\n\nAssign **${deadRole.name}** if / when you die in the event` : "")
		)
		.setColor(0x4C061D);

	const components: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [];

	for (let i = 0; i < currentRoleMenu.roles.length; i += 5) {
		const row = new ActionRowBuilder<MessageActionRowComponentBuilder>();
		const buttonsForRow = currentRoleMenu.roles.slice(i, i + 5).map(role =>
			new ButtonBuilder()
				.setCustomId(`role-menu-use-${role.roleId}`)
				.setLabel(guild.roles.cache.get(role.roleId)?.name || "Unknown Role")
				.setStyle(
					group?.roleId === role.roleId ? ButtonStyle.Primary :
						group?.deadRoleId === role.roleId ? ButtonStyle.Danger :
							ButtonStyle.Secondary
				)
		);
		row.addComponents(...buttonsForRow);
		components.push(row);
	}

	try {
		await interaction.channel?.messages.fetch(currentRoleMenu.messageId).then(async (msg) => {
			await msg.edit({
				content: "",
				embeds: [embed],
				components
			});
		});
	} catch (error) {
		await interaction.reply({ content: "There was an error updating the role menu message. Please check I have permissions to manage messages in this channel.", ephemeral: true });
		return;
	}

	await interaction.update({
		content: "Role menu updated! Users can now select roles from the menu in the original message. If you dont see the embedded instructions, please check I have permission to embed links in this channel.",
		components: [],
	});
}

export default {
	customIdPrefix,
	handle,
}