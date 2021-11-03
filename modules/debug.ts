import { TextChannel } from "discord.js"
const DEBUG_ENABLED = true
const CHANNEL_DEBUG = false

export default class debug {

    logChannel: TextChannel

    constructor(channel: TextChannel) {

        this.logChannel = channel

    }

    debug(value: any) {
        if (DEBUG_ENABLED) {
            console.log(value)

            if (CHANNEL_DEBUG) {
                this.logChannel.fetch().then((c) => {
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