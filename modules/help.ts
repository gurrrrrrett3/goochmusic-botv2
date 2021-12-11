import { MessageEmbed } from 'discord.js';
import { Client } from '..'
import { version } from '../package.json'
export default function help(section: number): MessageEmbed {

    var embed = new MessageEmbed()

    embed.setAuthor("Help!")
    embed.setFooter(`${Client.user?.username} v${version}`, Client.user?.avatarURL() ?? undefined)
    embed.setTimestamp()

    switch (section) {

        case 0: {
            //Default help, no section

            embed.setDescription("Hello, welcome to the help page! \n I've seperated the help page into groups to make it easier to navigate! \nTo access a group, do `-help #`, where the number is next to the group or command you want to access! \nI hope you find what you are looking for.")
            .setTitle("Help Main page")
            .addField("1 | Music", "Info about all the music commands!")
            .addField("More soon!", "I will update this page when needed!")

            break
        }

        case 1: {
            //music page

            embed.setDescription("Music commands! These are used to play music in VCs!")
            .addField("101 | play", "Plays a song.")
            .addField("102 | skip", "Skips the currently playing song.")
            .addField("103 | stop", "Stops playing, and leaves the VC")
            .addField("104 | queue", "Shows the list of songs that will play.")
            .addField("105 | find", "Searches a term on YouTube, and gets a link.")

            break
        }

        case 101: {
            embed.setDescription("Plays a song.\nAliases: `p`, `join`")
            .addField("Usage", "`-p despacito`\n`-join https://open.spotify.com/track/6habFhsOp2NvshLv26DqMb`\n `-play https://www.youtube.com/watch?v=kJQP7kiw5Fk`")
            break
        }   

        case 102: {
            embed.setDescription("Skips the currently playing song.\nAliases: `s`, `next`")
            .addField("Usage", "`-s`\n`-next`")
            break
        }

        case 103: {
            embed.setDescription("Stops playing, and leaves the VC.\nAliases: `stop`, `leave`")
            .addField("Usage", "`-stop`\n`-leave`")
            break
        }

        case 104: {
            embed.setDescription("Shows the list of songs that will play.\nAliases: `q`, `queue`")
            .addField("Usage", "`-q`\n`-queue`")
            break
        }

        case 105: {
            embed.setDescription("Searches a term on YouTube, and gets a link.\nAliases: `find`, `search`")
            .addField("Usage", "`-find despacito`\n`-search despacito`")
            break
        }


    }


    return embed

}


//NUMBER LIST

//0 - main page
//1-99 could be main page stuff
//100- is for commands and other stuff



//1 - Music main page
//2 - light main page



//101 - play
//102 - skip
//103 - stop
//104 - queue
//105 - find