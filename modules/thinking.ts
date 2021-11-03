import { Message, MessageEmbed, MessageEditOptions } from 'discord.js';
import { Client } from "../index";
import { Debug } from '../index';
export default class Thinking {

    public originalMessage: Message
    public response: Message
    public responseEmbed: MessageEmbed

    private startTime: number

    constructor(message: Message) {
        
        this.startTime = Date.now()

        this.originalMessage = message
        this.response = message
        this.responseEmbed = new MessageEmbed().setAuthor(`${Client.user?.username} is thinking...`).setColor("#26add5")
        this.originalMessage.reply({embeds: [this.responseEmbed]}).then((message) => this.response = message)

    }

    public finish(options: MessageEditOptions) {
        this.response.edit(options)
        Debug.debug(`Total Command Time: ${Date.now() - this.startTime}ms`)
    }

}