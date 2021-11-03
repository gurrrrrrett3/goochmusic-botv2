//@typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
import ytdl from 'ytdl-core';
import { Debug } from '../index';
import Spotify from './spotify';
const yts = require("yt-search")

export default class Youtube {

    private query: string
    private mode: "QUERY" | "URL"
    private url: string

    constructor() {
        this.query = ""
        this.url = ""
        this.mode = "QUERY"
    }

    public async getVideo(query: string) {

        this.query = query

        if (ytdl.validateURL(this.query)) {

            this.mode = "URL"
            this.url = this.query

        } else {
            this.mode = "QUERY"
            const startTime = Date.now()
            const r = await yts(this.query)
            Debug.debug(`YTS searchQuery: Took ${Date.now() - startTime}ms`)
            this.url = r.videos[0].url
        }
        Debug.debug(`${query}: processed in ${this.mode} mode, returning ${this.url}`)
        return this.url
    }

    public isPlaylist(url: string) {
        const playlistRegex = new RegExp(/https:\/\/www.youtube.com\/playlist\?list=\S{34}/g)
        return url.match(playlistRegex)?.length == 1
    }
}