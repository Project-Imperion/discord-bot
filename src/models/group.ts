import { Document, Schema, model } from "mongoose";

export interface IGroup extends Document {
	guildId: string;
	name: string;
	shortDesc: string;
	longDesc: string;
	bannerUrl: string;
	roleId: string;
	memberCount: number;
}

const GroupSchema = new Schema<IGroup>({
	guildId: { type: String, required: true },
	name: { type: String, required: true },
	shortDesc: { type: String, required: true, maxlength: 128 },
	longDesc: { type: String, required: true, maxlength: 2000 },
	bannerUrl: { type: String, required: false },
	roleId: { type: String, required: false },
	memberCount: { type: Number, required: false, default: 0 },
});

export default model<IGroup>("Group", GroupSchema);
