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
        this.queue.next()
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

  private monitor() {
      this.audioPlayer.on("stateChange", (oldState, newState) => {
        
        Debug.debug(`State Changed: ${oldState.status} => ${newState.status}`)

          if (newState.status == "idle") {
              //The song has finished, queue up the next song

              this.queue.next()
              if (this.queue.nowPlaying()) {
                  this.playAudioResource(this.queue.nowPlaying())
              }

          }
      })
  }
}
