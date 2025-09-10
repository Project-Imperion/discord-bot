import { GuildMember, PartialGuildMember } from "discord.js";

import Group from "../models/group.js";

export default async (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) => {
	const group = await Group.findOne({ guildId: newMember.guild.id });
	if (!group) return;


	const roleId = group.roleId;
	const deadRoleId = group.deadRoleId;

	const hadRole = oldMember.roles.cache.has(roleId);
	const hasRole = newMember.roles.cache.has(roleId);

	const hadDeadRole = oldMember.roles.cache.has(deadRoleId);
	const hasDeadRole = newMember.roles.cache.has(deadRoleId);


	if (hadRole !== hasRole || hadDeadRole !== hasDeadRole) {
		await newMember.guild.members.fetch();
		const allMembers = newMember.guild.members.cache;
		const membersWithRole = allMembers.filter(m => m.roles.cache.has(roleId)).size;
		const membersWithDeadRole = allMembers.filter(m => m.roles.cache.has(deadRoleId)).size;

		group.memberCount = membersWithRole;
		group.deadCount = membersWithDeadRole;
		await group.save();
	}
};
