//@typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
import { raw as ytexec } from 'youtube-dl-exec';
import {demuxProbe, createAudioResource, AudioResource} from '@discordjs/voice';
import { User, TextChannel, GuildMember } from 'discord.js';
import ytdl from  'ytdl-core';
import { Debug } from '..';
export default class Track {


    public url: string
    public reqestUser: User
    public requestMember: GuildMember
    public requestChannel: TextChannel
    public startTime: number = 0

    public videoData: {
        title: string,
        length: number //in seconds
    }

    constructor(member: GuildMember, channel: TextChannel) {
        this.url = ""
        this.reqestUser = member.user
        this.requestMember = member
        this.requestChannel = channel
        this.startTime = Date.now()
        this.videoData = {
            title: "",
            length: 0
        }
    }

    public async createAudioResource(): Promise<AudioResource<Track>> {
        if (this.url == "") {
            console.error("FATAL ERROR: Tried to create audio resource without a URL.")
            process.exit()
        }

        const startTime = Date.now()

        return new Promise(async (resolve, reject) => {
            const pr = ytexec(
                this.url,
                {
                    o: "-",
                    q: "",
                    f: "bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio",
                    r: "100K",
                },
                { stdio: ["ignore", "pipe", "ignore"] }
            );
            if (!pr.stdout) {
                reject(new Error("No stdout"));
                return;
            }
            const stream = pr.stdout;
            const onError = (error: Error) => {
                if (!pr.killed) pr.kill();
                stream.resume();
                reject(error);
            };
            pr
                .once("spawn", () => {
                    demuxProbe(stream)
                        .then((probe) => {

                            Debug.debug(`Create Audio Resource: Took ${Date.now() - startTime}ms`)

                            resolve(
                                createAudioResource(probe.stream, {
                                    metadata: this,
                                    inputType: probe.type,
                                })
                            )
                        }
                            
                        )
                        .catch(onError);
                })
                .catch(onError);
        });
    }

    public async getData() {
        const startTime = Date.now()
        ytdl.getInfo(this.url).then((data) => {
            Debug.debug(`Ytdl getData: Took ${Date.now() - startTime}ms`)
            this.videoData.title = data.videoDetails.title
            this.videoData.length = Number.parseInt(data.videoDetails.lengthSeconds)
        })
    }

    public getTimeLeft(): number {
        return this.videoData.length - (Date.now() - this.startTime) / 1000
    }

    public setPlaying() {
        this.startTime = Date.now()
    }
}