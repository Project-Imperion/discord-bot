import { Document, Schema, model } from "mongoose";

export interface IRoleMenu extends Document {
	guildId: string;
	channelId: string;
	messageId: string;
	roles: { roleId: string; }[];
}

const roleMenuSchema = new Schema<IRoleMenu>({
	guildId: { type: String, required: true, unique: true },
	channelId: { type: String, required: true },
	messageId: { type: String, required: true },
	roles: [
		{
			roleId: { type: String, required: true },
		}
	]
});

export default model<IRoleMenu>("RoleMenu", roleMenuSchema);

