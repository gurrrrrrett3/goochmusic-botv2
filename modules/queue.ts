import { AudioResource } from "@discordjs/voice";
import Track from "./track";
import Canvas from "canvas";
import { Message, MessageAttachment, SnowflakeUtil, User } from "discord.js";
import Thinking from "./thinking";
import { formatTime } from "./util";
export default class Queue {
	private q: AudioResource<Track>[];

	constructor() {
		this.q = [];
	}

	public add(resource: AudioResource<Track>) {
		this.q.push(resource);
	}

	public next() {
		this.q.shift();
	}

	public nowPlaying() {
		return this.q[0];
	}

	public length() {
		return this.q.length;
	}

	public clear() {
		this.q = [];
	}

	public getTimeUntilLastSong(): number {
		let time = 0;

		for (let i = 1; i < this.q.length - 1; i++) {
			time += this.q[i].metadata.videoData.length;
		}

		time += this.q[0].metadata.getTimeLeft();

		return time;
	}

	public getQueueLength() {
		let time = 0;

		for (let i = 0; i < this.q.length; i++) {
			time += this.q[i].metadata.videoData.length;
		}

		return time;
	}

    public nowPlaying() {
        return this.q[0];
    }

	public async generateQueueImage(message: Message) {
		const think = new Thinking(message);

		const canvas = Canvas.createCanvas(700, 500);
		const ctx = canvas.getContext("2d");

		//Background

		ctx.fillStyle = "#121220";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		//Lines

		ctx.strokeStyle = "#FFFFFF";
		ctx.lineWidth = 5;

		ctx.beginPath();
		ctx.moveTo(24, 91);
		ctx.lineTo(canvas.width - 24, 91);
		ctx.stroke();

		//Text

		ctx.fillStyle = "#FFFFFF";

		ctx.font = "21px Roboto";
		ctx.fillText("Now Playing", 5, 24);

		//Draw first user icon

		await this.drawUserIcon(ctx, 5, 35, this.q[0].metadata.reqestUser, message);

		//Add currently playing song

		const text = `${this.q[0].metadata.videoData.title} | ${formatTime(
			this.q[0].metadata.videoData.length
		)}`;
		ctx.font = this.applyText(canvas, text);
		ctx.fillText(text, 60, 73);

		//Now do the rest of the queue!

		for (let i = 1; i < (this.q.length > 8 ? 8 : this.q.length); i++) {
			const baseHeight = 40;
			const lineHeight = 60;

			const currentLine = baseHeight + lineHeight * i;

			//Draw the user icon

			await this.drawUserIcon(
				ctx,
				5,
				currentLine,
				this.q[i].metadata.reqestUser,
				message
			);

			//Draw the song name

			const text = `${this.q[i].metadata.videoData.title} | ${formatTime(
				this.q[i].metadata.videoData.length
			)}`;
			ctx.font = this.applyText(canvas, text);
			ctx.fillText(text, 60, currentLine + 32);
		}

		let attachment = new MessageAttachment(canvas.toBuffer(), `queue-${Date.now()}.png`);
		//think.finish({embeds: [], content: "Queue:"})
		message.channel.send({ files: [attachment] });
	}

	private async drawUserIcon(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		user: User,
		message: Message
	) {
		ctx.save();
		try {
			const avatar = await Canvas.loadImage(user.displayAvatarURL({ format: "png" }));

			ctx.beginPath();
			ctx.arc(x + 24, y + 24, 24, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.clip();

			//@ts-ignore
			ctx.drawImage(avatar, x, y, 48, 48);

			//Draw a cool little circle
			ctx.strokeStyle = this.q[0].metadata.requestMember.displayHexColor;
			ctx.lineWidth = 5;

			ctx.beginPath();
			ctx.arc(x + 24, y + 24, 24, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.stroke();
		} catch (err) {
			message.reply(`Whoops! That didn't work! Please try again!`);
		}

		ctx.restore();
	}

	private applyText(canvas: Canvas.Canvas, text: string) {
		const ctx = canvas.getContext("2d");
		let fontSize = 32;
		do {
			ctx.font = `${(fontSize -= 1)}px Roboto`;
		} while (ctx.measureText(text).width > canvas.width - 60);
		return ctx.font;
	}
}
