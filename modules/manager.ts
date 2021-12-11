import Discord from 'discord.js';
import Connection from './connection';
import Queue from "./queue"
import { AudioPlayer, AudioResource } from '@discordjs/voice';
import Track from './track';
import { Debug } from '..';
export default class Manager {

    public queue: Queue

    public voiceChannel: Discord.VoiceChannel
    
    public connection: Connection
    public audioPlayer: AudioPlayer

    constructor(voiceChannel: Discord.VoiceChannel) {
        this.queue = new Queue()

        this.voiceChannel = voiceChannel
        this.connection = new Connection(voiceChannel)
        this.audioPlayer = new AudioPlayer()

        this.monitor()
    }

    public skip() {
        
        this.audioPlayer.stop()
    }

    public join() {
      this.connection.join()
    }

    public playAudioResource(resource: AudioResource<Track>) {
        if (!this.connection.get()) {
            this.join()
        }

        this.connection.playAudio(this.audioPlayer)
        this.audioPlayer.play(resource)
  }
  public queueAudioResource(resource: AudioResource<Track>) {
      this.queue.add(resource)
      if (this.queue.length() == 1) {
          this.playAudioResource(this.queue.nowPlaying())
      }

  }

  public stop() {
        this.audioPlayer.stop()
        this.connection.destroy()
        this.queue.clear()
    }

public getPlayerData() {

        const currentTrack = this.queue.nowPlaying()

        if (currentTrack) {

            return {
                title: currentTrack.metadata.videoData.title,
                url: currentTrack.metadata.url,
                queuedBy: currentTrack.metadata.reqestUser,
                duration: currentTrack.metadata.videoData.length,
                currentTime: currentTrack.metadata.videoData.length - currentTrack.metadata.getTimeLeft(),   
            }

        }
    }

  private monitor() {
      this.audioPlayer.on("stateChange", (oldState, newState) => {
        
        Debug.debug(`State Changed: ${oldState.status} => ${newState.status}`)

          if (newState.status == "idle") {
              //The song has finished, queue up the next song

              this.queue.next()
              if (this.queue.nowPlaying()) {
                  this.playAudioResource(this.queue.nowPlaying())
                  this.queue.nowPlaying().metadata.requestChannel.send(`Now Playing: ${this.queue.nowPlaying().metadata.videoData.title}`)
              }

          }
      })
  }
}
