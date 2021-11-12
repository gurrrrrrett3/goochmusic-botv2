import { TextChannel } from 'discord.js';
const DEBUG_ENABLED = true
const CHANNEL_DEBUG = false

export default class debug {

    logChannel: TextChannel
    user: string

    constructor(channel: TextChannel) {

        this.logChannel = channel
        this.user = ""

    }

    debug(value: any) {
        if (DEBUG_ENABLED) {
            console.log(value)

            if (CHANNEL_DEBUG && this.user == "232510731067588608") {
                this.logChannel.fetch().then((c:any) => {
                    if (c.isText()) {
                        c.send(`\`DEBUG: ${value}\``)
                    }
                })
            }
        }
    }

}



export function checkDebug() {
    return [DEBUG_ENABLED, CHANNEL_DEBUG]
}