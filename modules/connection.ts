import Discord from "discord.js"
import {getVoiceConnection, joinVoiceChannel, DiscordGatewayAdapterCreator, AudioPlayer, VoiceConnectionStatus, VoiceConnection, entersState} from "@discordjs/voice"

export default class Connection {

    public voiceChannel: Discord.VoiceChannel
    public guild: Discord.Guild
    public adapterCreator: DiscordGatewayAdapterCreator

    constructor(voiceChannel: Discord.VoiceChannel) {
        this.voiceChannel = voiceChannel
        this.guild = this.voiceChannel.guild
        this.adapterCreator = this.guild.voiceAdapterCreator
    }

    public join() {
        const connection = joinVoiceChannel({
            channelId: this.voiceChannel.id,
            guildId: this.guild.id,
            adapterCreator: this.adapterCreator
        })

        //Subscribe to alerts so that we can maintain the connection

        this.monitor(connection)

        return connection
    }

    public get() {
        return getVoiceConnection(this.guild.id)  
    }

    public destroy() {
        this.get()?.destroy()
    }

    public playAudio(audioPlayer: AudioPlayer) {

        // Subscribe the connection to the audio player (will play audio on the voice connection)
        const subscription = this.get()?.subscribe(audioPlayer);

        // subscription could be undefined if the connection is destroyed!
    }

    private monitor(connection: VoiceConnection) {

        connection.on(VoiceConnectionStatus.Ready, () => {
                console.log(`Ready, Connected to ${this.voiceChannel.name}!`)
        });

        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
                // Seems to be reconnecting to a new channel - ignore disconnect
            } catch (error) {
                // Seems to be a real disconnect which SHOULDN'T be recovered from
                this.destroy()
            }
        });

    }

}