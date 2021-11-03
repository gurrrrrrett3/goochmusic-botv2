import { getData, getPreview, getTracks } from "spotify-url-info"
import Youtube from "./youtube"
import { Message } from 'discord.js';
import Manager from "./manager";
import Track from "./track";
import { Debug } from "..";
import Thinking from "./thinking";
import { formatTime } from "./util";

const yt = new Youtube()

export default class Spotify {


    public url: string

    constructor() {
        this.url = ""
    }

    public isValid(url: string) {
        const validRegex = new RegExp(/https:\/\/open.spotify.com\/(track|playlist)\S{23}/g)

        return url.match(validRegex)?.length == 1
    }

    public checkType(url: string) {
        this.url = url
    }

    public isPlaylist(url: string) {
        const validRegex = new RegExp(/https:\/\/open.spotify.com\/playlist\S{23}/g)

        return url.match(validRegex)?.length == 1
    }

    public isTrack(url: string) {
        const validRegex = new RegExp(/https:\/\/open.spotify.com\/track\S{23}/g)

        return url.match(validRegex)?.length == 1
    }

    public async processTrack(url: string, message: Message, guildManager: Manager) {

        const think = new Thinking(message)

        getData(url).then(async (track: any) => {

            Debug.debug(`Searching: ${track.name} ${track.artists ? track.artists[0].name : ""}`)

            const url = await yt.getVideo(`${track.name} ${track.artists ? track.artists[0].name : ""}`)

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

    public async processPlaylist(url: string, message: Message, guildManager: Manager) {
        getTracks(url).then(async (tracks) => {
            tracks.forEach(async (track) => {

                Debug.debug(`Searching: ${track.name} ${track.artists ? track.artists[0].name : ""}`)

                const url = await yt.getVideo(`${track.name} ${track.artists ? track.artists[0].name : ""}`)

                if (message.channel.type != "GUILD_TEXT") return
                if (!message.member) return
                const t = new Track(message.member, message.channel)

                t.url = url
                t.getData().then(async () => {

                    guildManager?.queueAudioResource(await t.createAudioResource())

                })

            })

        })
    }


}