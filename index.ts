//@typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports

import Discord, { Collection, Message } from "discord.js";
import Voice from "@discordjs/voice";
import ytdl from "ytdl-core";
import ytpl from "ytpl";
import fs from "fs";

const { getData, getPreview, getTracks } = require("spotify-url-info");

import dotenv from "dotenv";
import Manager from "./modules/manager";
import Track from "./modules/track";
import Connection from "./modules/connection";
import Youtube from "./modules/youtube";
import Spotify from "./modules/spotify";
import Thinking from "./modules/thinking";
import Lights from "./modules/lightcontrols";
import debug, { checkDebug } from "./modules/debug";
import { formatTime, formatProgressBar } from './modules/util';
import { emoji } from "./modules/emojis";
import help from "./modules/help";
import { MessageEmbed } from "discord.js";

const cbanDataFile = "./data/cban.json";
const listDataFile = "./data/list.json";

let enabledCommands = {
	PLAY: true,
	QUEUE: true,
	NOWPLAYING: true,
	SKIP: true,
	STOP: true,
	FIND: true,
	LIGHT: true,
	CYT: true,
	HELP: true,
	MOCK: true,
	ADMIN: true,
	LIST: true,
	ERROR: true, //this is here to satisfy typescript, don't worry about it
};

const commandList = [
	"PLAY",
	"QUEUE",
	"NOWPLAYING",
	"SKIP",
	"STOP",
	"FIND",
	"LIGHT",
	"CYT",
	"HELP",
	"MOCK",
	"ADMIN",
	"LIST",
];

export let Debug: debug;

const yt = new Youtube();
const sp = new Spotify();
const Light = new Lights();

const prefix = "-";

dotenv.config();
const token = process.env.TOKEN;

let manager = new Map<Discord.Snowflake, Manager>();

export const Client = new Discord.Client({
	intents: ["GUILD_VOICE_STATES", "GUILD_MESSAGES", "GUILDS"],
});

Client.login(token);

Client.on("ready", () =>
	console.log(
		`Ready, logged in as ${Client.user?.tag}, Debugging set to ${
			checkDebug() ? "TRUE" : "FALSE"
		}`
	)
);

Client.on("messageCreate", async (message) => {
	if (!message.guild) return;
	if (message.channel.type != "GUILD_TEXT") return;

	const content = message.content.slice(1);
	const commandText = content.split(" ")[0].toLowerCase();
	const command = alias(commandText);
	const predicate = content.split(" ").slice(1).join(" ");

	const member = message.member;
	let guildManager = manager.get(message.guild.id);

	if (message.channel.type == "GUILD_TEXT") {
		Debug = new debug(message.channel);
	}

	Debug.user = message.author.id;

	//BANNED USERS LIST

	const bannedUsers = [
		//Add users to this list to prevent them from using the bot
		//"848716434561040384", //popeye
		"",
	];

	if (bannedUsers.includes(message.author.id)) {
		message.reply(
			`${emoji.failure} Sorry ${message.author.username}, you are banned from using this bot.`
		);
		return;
	}

	//cameron annoy

	const annoyList = [""];

	if (annoyList.includes(message.author.id)) {
		sendWebhook(
			message.channel,
			annoy(message.content),
			"annoying " + member?.displayName ?? "",
			message.author.avatarURL() ?? ""
		);
	}

	//cameron delete

	const deleteList = [""];

	if (deleteList.includes(message.author.id)) {
		const fetchedMessages = await message.channel.messages.fetch({
			limit: 100,
		});

		let messagesToDelete = new Collection<string, Message>();
	
		fetchedMessages.forEach((message) => {
			if (deleteList.includes(message.author.id)) {
				messagesToDelete.set(message.id, message);
			}
		});

		message.channel.bulkDelete(messagesToDelete);

	}


	if (!message.content.toLowerCase().startsWith(prefix)) return;

	//CHECK IF COMMAND IS ENABLED

	if (enabledCommands[command] == false) {
		message.reply(
			`${emoji.failure} Sorry ${message.author.username}, that command is disabled.`
		);
		return;
	}

	//CHECK IF USER IS BANNED FROM COMMAND

	const data = fs.readFileSync(cbanDataFile, "utf8");

	const cbanData = JSON.parse(data);

	if (cbanData[message.author.id] != undefined) {
		if (cbanData[message.author.id][command] == true) {
			message.reply(
				`${emoji.failure} Sorry ${message.author.username}, you are banned from using this command.`
			);
			return;
		}
	}
	
	//COMMAND STRUCTURE

	switch (command) {
		case "PLAY": {
			let voiceChannel = member?.voice.channel;
			if (!guildManager?.voiceChannel) {
				if (!voiceChannel || voiceChannel.type == "GUILD_STAGE_VOICE") {
					message.reply("You are not in a Voice Channel!");
					break;
				}
			} else {
				voiceChannel = guildManager.voiceChannel;
			}

			if (guildManager == undefined) {
				manager.set(message.guild.id, new Manager(voiceChannel));
				guildManager = manager.get(message.guild.id);
			}

			//Check for playlists, then send it to the correct manager

			/* BROKEN, DISABLED
            if (yt.isPlaylist(predicate)) {

            }

            if (sp.isPlaylist(predicate)) {
                if (guildManager == undefined) return
                sp.processPlaylist(predicate, message, guildManager)
            }
            */

			if (sp.isTrack(predicate)) {
				if (!guildManager) return;
				sp.processTrack(predicate, message, guildManager);
			} else {
				yt.getVideo(predicate).then(async (url) => {
					const think = new Thinking(message);

					if (message.channel.type != "GUILD_TEXT") return;
					if (!message.member) return;
					const t = new Track(message.member, message.channel);

					t.url = url;

					t.getData().then(async () => {
						guildManager?.queueAudioResource(await t.createAudioResource());

						think.finish({
							content: `Queued: **${t.videoData.title}** | ${formatTime(
								t.videoData.length
							)} | It will be played in ${formatTime(guildManager?.queue?.getTimeUntilLastSong() ?? 0)}`,
							embeds: [],
						});
					});
				});
			}

			break;
		}
		case "QUEUE": {
			guildManager?.queue.generateQueueImage(message);
			break;
		}
		case "NOWPLAYING": {

			const t = guildManager?.getPlayerData();
		
			if (t) {
				const embed = new MessageEmbed()
					.setTitle(t.title)
					.setURL(t.url)
					.setAuthor(t.queuedBy.username, t.queuedBy.avatarURL() ?? undefined)
					.setDescription(formatProgressBar(10, t.currentTime, t.duration))

					message.reply({embeds: [embed]});
			} else {
				message.reply("Nothing is playing!");
			}
			break
		}
		case "SKIP": {
			guildManager?.skip();
			message.react(emoji.success);
			break;
		}
		case "STOP": {
			const voiceChannel = member?.voice.channel;
			if (!voiceChannel || voiceChannel.type == "GUILD_STAGE_VOICE") {
				message.reply("You are not in a Voice Channel!");
				break;
			}

			if (guildManager == undefined) {
				manager.set(message.guild.id, new Manager(voiceChannel));
				guildManager = manager.get(message.guild.id);
			}

			guildManager?.stop();
			message.reply("Cya!");

			break;
		}
		case "FIND": {
			yt.getVideo(predicate).then((url) => {
				message.reply(url);
			});
			break;
		}
		case "MOCK": {
			if (!message.member) return;
			if (!predicate) {
				message.reply("You need to provide a message ID to mock!");
				break;
			}

			message.channel.messages
				.fetch(predicate)
				.then((msg) => {
					if (!msg) {
						message.reply("That message does not exist!");
						return;
					}

					const channel = msg.channel;
					const content = msg.content;
					const avatar = msg.author.avatarURL() ?? "";
					const displayName = msg.member ? msg.member.displayName : msg.author.username;

					if (channel.type != "GUILD_TEXT") {
						message.reply("You can only mock messages in text channels!");
						return;
					}

					sendWebhook(channel, annoy(content), `annoying ${displayName}`, avatar);
					message.delete();
				})
				.catch(() => {
					message.react(emoji.failure);
				});
		}
		case "LIGHT": {
			switch (predicate.toLowerCase().split(" ")[0]) {
				case "on": {
					Light.on();
					message.react(emoji.success);
					break;
				}
				case "off": {
					Light.off();
					message.react(emoji.success);
					break;
				}
				case "set": {
					Light.set(predicate.split(" ")[1]);
					predicate.split(" ")[1];
					message.react(emoji.success);
					break;
				}
				case "strobe": {
					const col1 = predicate.split(" ")[1];
					const col2 = predicate.split(" ")[2];

					var times: number = 0;

					const interval = setInterval(() => {
						if (times % 2 == 1) {
							Light.set(col1);
						} else {
							Light.set(col2);
						}

						if (times > 20) {
							clearInterval(interval);
							message.react(emoji.success);
						}

						times++;
					}, 100);
					break;
				}
			}
			break;
		}

		case "ADMIN": {

			if (message.author.id != "232510731067588608") {
				message.reply("```Error: You do not have access to this command```");
				break;
			}

			console.log(predicate);

			switch (predicate.toLowerCase().split(" ")[0]) {

				case "cban": {
				
					const user = message.mentions.users.first();

					if (!user) {
						message.reply("You need to mention a user!");
						break;
					}

					const command = predicate.split(" ")[1];

					if (!command) {
						message.reply("You need to provide a command!");
						break;
					}

					let data: any  = fs.readFileSync(cbanDataFile).toString();
					data = JSON.parse(data);

					if (!data[user.id]) {
						data[user.id] = {};
					}

					data[user.id][command] = true;

					message.reply(`Banned ${user.username} from ${command}!`);

					fs.writeFileSync(cbanDataFile, JSON.stringify(data, null, 4));

					break
				}

				case "cunban": {
					const user = message.mentions.users.first();

					if (!user) {
						message.reply("You need to mention a user!");
						break;
					}

					const command = predicate.split(" ")[1];

					if (!command) {
						message.reply("You need to provide a command!");
						break;
					}

					let data: any  = fs.readFileSync(cbanDataFile).toString();
					data = JSON.parse(data);

					if (!data[user.id]) {
						data[user.id] = {};
					}
 
					delete data[user.id][command]

					if (data[user.id] == {}) {

						delete data[user.id];

					}

					message.reply(`Unbanned ${user.username} from ${command}!`);

					fs.writeFileSync(cbanDataFile, JSON.stringify(data, null, 4));

					break
				}

				case "cbanlist": {

					let data: any  = fs.readFileSync(cbanDataFile.toString());
					data = JSON.parse(data);

					let output = []

					for (const user in data) {
						for (const command in data[user]) {
							output.push(`**${Client.users.cache.get(user)?.username ?? user}** ${command}`);
						}
					}

					message.channel.send(output.join("\n") ?? "No commands banned!");
				}

				case "dc" : {
					//disable command

					const command = predicate.split(" ")[1];

					if (!commandList.includes(command)) {

						message.reply("That command does not exist!");
						break;
					} else {

					//@ts-ignore
					enabledCommands[command] = false;

					message.reply(`Command \`${command}\` has been disabled`);
					break;
						}
					}

				case "ec" : {
					//enable command

					const command = predicate.split(" ")[1];

					if (!commandList.includes(command)) {

						message.reply("That command does not exist!");
						break;
					}
					//@ts-ignore
					enabledCommands[command] = true;

					message.reply(`Command \`${command}\` has been enabled`);
					break;
					}

			}
			break;

		}
		case "HELP": {			
			const args = predicate.toLowerCase().split(" ");

			if (args[0] == "") {
				message.reply({ embeds: [help(0)] });
			} else {
				message.reply({ embeds: [help(parseInt(args[0]))] });
			}

			break;
		}
		case "LIST": {
		
			const args = predicate.toLowerCase().split(" ");

			if (args[0] == "add") {
			
				const item = args[1];

				if (!item) {
					message.reply("You need to provide an item!");
					break;
				}
				
				let data: any  = fs.readFileSync(listDataFile).toString();
				data = JSON.parse(data);

				if (data.includes(item)) {
					message.reply("That item is already in the list!");
					break;
				}

				data.push(item);

				fs.writeFileSync(listDataFile, JSON.stringify(data, null, 4));

			}

			if (args[0] == "remove") {

				const item = args[1];

				if (!item) {
					message.reply("You need to provide an item!");
					break;
				}

				let data: any  = fs.readFileSync(listDataFile).toString();
				data = JSON.parse(data);

				if (!data.includes(item)) {
					message.reply("That item is not in the list!");
					break;
				}

				data.splice(data.indexOf(item), 1);

				fs.writeFileSync(listDataFile, JSON.stringify(data, null, 4));

			}

			if (args[0] == "show") {
				
				let data: any  = fs.readFileSync(listDataFile).toString();
				data = JSON.parse(data);

				message.reply({ embeds: [
					new Discord.MessageEmbed()
					.setTitle("Gucci's List")
					.setDescription(data.join("\n"))
					.setColor("#ff0000")
				] });
			}


		}
		case "ERROR": {
			message.reply(`"${commandText}" is not a command or an alias.`);
			break;
		}
	}
});

//FUNCTIONS
function alias(term: string) {
	const alias = {
		play: ["p", "play", "join"],
		queue: ["q", "queue", "songs", "list"],
		nowPlaying: ["np", "nowplaying", "now playing"],
		stop: ["stop", "end", "leave"],
		skip: ["s", "skip", "next"],
		search: ["se", "search", "find", "f"],
		light: ["l", "set"],
		cyt: ["cyt"],
		help: ["h", "?", "help"],
		mock: ["mock"],
		admin: ["admin", "a"],
		list: ["list"],
	};

	if (alias.play.includes(term)) {
		return "PLAY";
	} else if (alias.queue.includes(term)) {
		return "QUEUE";
	} else if (alias.nowPlaying.includes(term)) {
		return "NOWPLAYING";
	} else if (alias.skip.includes(term)) {
		return "SKIP";
	} else if (alias.stop.includes(term)) {
		return "STOP";
	} else if (alias.search.includes(term)) {
		return "FIND";
	} else if (alias.light.includes(term)) {
		return "LIGHT";
	} else if (alias.cyt.includes(term)) {
		return "CYT";
	} else if (alias.help.includes(term)) {
		return "HELP";
	} else if (alias.mock.includes(term)) {
		return "MOCK";
	} else if (alias.admin.includes(term)) {
		return "ADMIN";
	} else if (alias.list.includes(term)) {
		return "LIST";
	} else return "ERROR";
}

function annoy(text: string) {
	var array = [];

	for (var i = 0; i < text.length; i++) {
		array.push(
			Math.random() > 0.5 ? text.charAt(i).toLowerCase() : text.charAt(i).toUpperCase()
		);
	}

	return array.join("");
}

async function sendWebhook(
	channel: Discord.TextChannel,
	text: string,
	name: string,
	avatar: string
) {
	try {
		const webhooks = await channel.fetchWebhooks();
		var webhook = webhooks.find((hook) => {
			return hook.name == "goochHook";
		});
		if (webhook == undefined) {
			channel.createWebhook(`goochHook`, {
				avatar: Client.user?.avatarURL(),
				reason: "Creating my hook, whatcha gonna do about it",
			});
			webhook = webhooks.find((hook) => {
				return hook.name == "goochHook";
			});
		}
		await webhook?.send({
			content: text,
			username: name,
			avatarURL: avatar,
		});
	} catch (error) {
		console.log(error);
	}
}
