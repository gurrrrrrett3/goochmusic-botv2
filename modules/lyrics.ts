import Track from "./track";
const lyricsFinder = require("lyrics-finder");

export default class lyrics {

    public static async getLyrics(track: Track) {

        let lyrics = await lyricsFinder(track.videoData.title);

    }

}