//@typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
import fetch from "node-fetch"
import fs from "fs"
const fuzzyset = require("fuzzyset")

import Player from './cytplayer';
import Town from "./cytmarker"
import { MarkerIconData, MarkerPolygonData } from './cytmarker';
import { Client } from "..";

const playerDataFile = "./data/fetchPlayers.json"
const worldMarkerDataFile = "./data/fetchWorldMarkers.json"
const earthMarkerDataFile = "./data/fetchEarthMarkers.json"
const townsDataFile = "./data/towns.json"

const cookieFile = "./data/cookie.json"

const defaultAddress: string = "https://zion.craftyourtown.com"
const playerEndpoint: string = "/tiles/players.json"
const worldMarkerEndpoint: string = "/tiles/world/markers.json"
const earthMarkerEndpoint: string = "/tiles/earth/markers.json"


export default class cyt {

    private lastFetch: number
    private fuzzy: any
    private interval = setInterval(() => {

        this.fetch()

    }, 3000)



    public address: string
    public cookie: string
    public players: {

        players?: [Player]

    } = JSON.parse(fs.readFileSync(playerDataFile).toString())

    constructor(address?: string) {

        this.players = {}
        this.address = address ?? defaultAddress

        this.lastFetch = Date.now()
        this.fuzzy = [[0, ""]]
        this.cookie = JSON.parse(fs.readFileSync(cookieFile).toString()).cookie
    }


    public async getOnlineCount() {

        return this.players.players?.length

    }

    public async getPos(playerName: string) {

        const nameData = this.fuzzy.get(playerName)[0]
        const name = nameData[1]
        const percentage = nameData[0]

        const data: {

            players?: [
                {
                    armor: number,
                    health: number,
                    name: string,
                    uuid: string,
                    world: string,
                    x: number,
                    z: number,
                    yaw: number

                }
            ]

        } = JSON.parse(fs.readFileSync(playerDataFile).toString())

        const player = new Player(data.players?.find((p) => p.name == name))

        console.log(player)

        return player.export()

    }

    private makeFuzzy() {

        this.fuzzy = fuzzyset(this.players.players?.map((p) => (p.name)))

    }

    private async fetch() {

        try {

            //fetch players

            let playerRes = await fetch(defaultAddress + playerEndpoint, {
                "headers": {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    "accept-language": "en-US,en;q=0.9",
                    "cache-control": "max-age=0",
                    "if-modified-since": "Sun, 14 Nov 2021 14:18:43 GMT",
                    "if-none-match": "\"1636899523701\"",
                    "sec-fetch-dest": "document",
                    "sec-fetch-mode": "navigate",
                    "sec-fetch-site": "none",
                    "sec-fetch-user": "?1",
                    "sec-gpc": "1",
                    "upgrade-insecure-requests": "1",
                    "cookie": this.cookie
                },
                "method": "GET"
            });


            const json = await playerRes.json()

            this.players = json

            this.makeFuzzy()

            fs.writeFileSync(playerDataFile, JSON.stringify(this.players, null, 4))

            //fetch world towns

            let worldRes = await fetch(defaultAddress + worldMarkerEndpoint, {
                "headers": {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    "accept-language": "en-US,en;q=0.9",
                    "cache-control": "max-age=0",
                    "if-modified-since": "Sun, 14 Nov 2021 14:18:43 GMT",
                    "if-none-match": "\"1636899523701\"",
                    "sec-fetch-dest": "document",
                    "sec-fetch-mode": "navigate",
                    "sec-fetch-site": "none",
                    "sec-fetch-user": "?1",
                    "sec-gpc": "1",
                    "upgrade-insecure-requests": "1",
                    "cookie": this.cookie
                },
                "method": "GET"
            });

            const worldMarkerJSON = await worldRes.json()

            fs.writeFileSync(worldMarkerDataFile, JSON.stringify(worldMarkerJSON, null, 4))

            //fetch earth towns

            let earthRes = await fetch(defaultAddress + earthMarkerEndpoint, {
                "headers": {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    "accept-language": "en-US,en;q=0.9",
                    "cache-control": "max-age=0",
                    "if-modified-since": "Sun, 14 Nov 2021 14:18:43 GMT",
                    "if-none-match": "\"1636899523701\"",
                    "sec-fetch-dest": "document",
                    "sec-fetch-mode": "navigate",
                    "sec-fetch-site": "none",
                    "sec-fetch-user": "?1",
                    "sec-gpc": "1",
                    "upgrade-insecure-requests": "1",
                    "cookie": this.cookie
                },
                "method": "GET"
            });

            const earthMarkerJSON = await earthRes.json()

            fs.writeFileSync(earthMarkerDataFile, JSON.stringify(earthMarkerJSON, null, 4))

            //Get saved towns

            let towns: [Town] = JSON.parse(fs.readFileSync(townsDataFile).toString())

            let count = 0

            //Create list of town data

            //process overworld towns
            worldMarkerJSON[1].markers.forEach((marker: MarkerIconData | MarkerPolygonData) => {

                let t = new Town("world")
                if (marker.type == "icon") {
                    t = t.fromIcon(marker, "world")
                    towns.push(t)
                    //console.log(`Processing Overworld towns... ${count} towns processed`)
                    count++
                }
            })

            //process earth towns

            earthMarkerJSON[1].markers.forEach((marker: MarkerIconData | MarkerPolygonData) => {

                let t = new Town("earth")
                if (marker.type == "icon") {
                    t = t.fromIcon(marker, "earth")
                    towns.push(t)
                    //console.log(`Processing Earth towns... ${count} towns processed`)
                    count++
                }
            })
            //sort
            towns.sort((a, b) => {

                return b.residents.length - a.residents.length

            })

            //save
           // fs.writeFileSync(townsDataFile, JSON.stringify(towns, null, 4))

            Client.user?.setActivity({type: "PLAYING", name: `CYT, ${count} Towns, ${this.players.players?.length} Players.`})
        } catch (error) { 
            console.log(error)
        }


        return

    }


}


