//@typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports

import Discord, { Message } from "discord.js"
import Voice from "@discordjs/voice"
import ytdl from "ytdl-core";
import ytpl from "ytpl";

const { getData, getPreview, getTracks } = require("spotify-url-info");

import dotenv from "dotenv";
import Manager from './modules/manager';
import Track from "./modules/track";
import Connection from './modules/connection';
import Youtube from './modules/youtube';
import Spotify from "./modules/spotify";
import Thinking from "./modules/thinking";
import Lights from "./modules/lightcontrols";
import debug, { checkDebug } from "./modules/debug";
import { formatTime } from "./modules/util";

export let Debug: debug

const yt = new Youtube()
const sp = new Spotify()
const Light = new Lights()

const prefix = "-"

dotenv.config();
const token = process.env.TOKEN;

let manager = new Map<Discord.Snowflake, Manager>()

export const Client = new Discord.Client({
    intents: ["GUILD_VOICE_STATES", "GUILD_MESSAGES", "GUILDS"],
});

Client.login(token)

Client.on("ready", () =>
    console.log(`Ready, logged in as ${Client.user?.tag}, Debugging set to ${checkDebug() ? "TRUE" : "FALSE"}`)
);

Client.on("messageCreate", async (message) => {
    if (!message.guild) return;
    if (!message.content.toLowerCase().startsWith(prefix)) return
    if (message.channel.type != "GUILD_TEXT") return

    const content = message.content.slice(1)
    const commandText = content.split(" ")[0].toLowerCase()
    const command = alias(commandText)
    const predicate = content.split(" ").slice(1).join(" ")

    const member = message.member
    let guildManager = manager.get(message.guild.id)

    if (message.channel.type == "GUILD_TEXT") {
        Debug = new debug(message.channel)
    }


    //COMMAND STRUCTURE

    switch (command) {
        case "PLAY": {

            let voiceChannel = member?.voice.channel
            if (!guildManager?.voiceChannel) {

                if (!voiceChannel || voiceChannel.type == "GUILD_STAGE_VOICE") {
                    message.reply("You are not in a Voice Channel!")
                    break
                }

            } else {
                voiceChannel = guildManager.voiceChannel
            }


            if (guildManager == undefined) {
                manager.set(message.guild.id, new Manager(voiceChannel))
                guildManager = manager.get(message.guild.id)
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
                if (!guildManager) return
                sp.processTrack(predicate, message, guildManager)
            } else {

            yt.getVideo(predicate).then(async (url) => {
                const think = new Thinking(message)

                if (message.channel.type != "GUILD_TEXT") return
                if (!message.member) return
                const t = new Track(message.member, message.channel)

                t.url = url

                t.getData().then(async () => {

                    guildManager?.queueAudioResource(await t.createAudioResource())

                    think.finish({ content: `Queued: **${t.videoData.title}** | ${formatTime(t.videoData.length)}`, embeds: [] })

                })

            })
        }

            break;
        }
        case "QUEUE": {

            guildManager?.queue.generateQueueImage(message)

            break
        }
        case "SKIP": {
            guildManager?.skip()
            break
        }
        case "STOP": {

            const voiceChannel = member?.voice.channel
            if (!voiceChannel || voiceChannel.type == "GUILD_STAGE_VOICE") {
                message.reply("You are not in a Voice Channel!")
                break
            }

            if (guildManager == undefined) {
                manager.set(message.guild.id, new Manager(voiceChannel))
                guildManager = manager.get(message.guild.id)
            }

            guildManager?.connection.destroy()
            message.reply("Cya!")

            break
        }
        case "FIND": {
            yt.getVideo(predicate).then((url) => {
                message.reply(url)
            })
        }
        case "LIGHT": {
            switch (predicate.toLowerCase().split(" ")[0]) {
                case "on": {
                    Light.on()
                    break
                }
                case "off": {
                    Light.off()
                }
                case "set": {
                    Light.set(predicate.split(" ")[1])
                }
            }
        }
        case "ERROR": {
            message.reply(`"${commandText}" is not a command or an alias.`)
            break
        }
    }

})

//FUNCTIONS
function alias(term: string) {
    const alias = {
        play: ["p", "play", "join"],
        queue: ["q", "queue", "songs", "list"],
        stop: ["stop", "end", "leave"],
        skip: ["s", "skip", "next"],
        search: ["se", "search", "find", "f"],
        light: ["l", "set"]
    }

    if (alias.play.includes(term)) {
        return "PLAY"
    } else if (alias.queue.includes(term)) {
        return "QUEUE"
    } else if (alias.skip.includes(term)) {
        return "SKIP"
    } else if (alias.stop.includes(term)) {
        return "STOP"
    } else if (alias.search.includes(term)) {
        return "FIND"
    } else if (alias.light.includes(term)) {
        return "LIGHT"
    } else return "ERROR"
}

