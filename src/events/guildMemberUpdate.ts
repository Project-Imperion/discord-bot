import { GuildMember, PartialGuildMember } from "discord.js";

import Group from "../models/group.js";

export default async (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) => {
	const group = await Group.findOne({ guildId: newMember.guild.id });
	if (!group) return;
	const roleId = group.roleId;

	const hadRole = oldMember.roles.cache.has(roleId);
	const hasRole = newMember.roles.cache.has(roleId);

	if (hadRole !== hasRole) {
		await newMember.guild.members.fetch();
		const allMembers = newMember.guild.members.cache;
		const membersWithRole = allMembers.filter(m => m.roles.cache.has(roleId)).size;

		group.memberCount = membersWithRole;
		await group.save();
	}
};
