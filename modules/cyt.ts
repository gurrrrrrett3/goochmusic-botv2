//@typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
import fetch from "node-fetch"
import fs from "fs"
const fuzzyset = require("fuzzyset")

const dataFile = "./data/fetchPlayers.json"
const cookieFile = "./data/cookie.json"

const defaultAddress: string = "https://zion.craftyourtown.com"
const playerEndpoint: string = "/tiles/players.json"

export default class cyt {

    private lastFetch: number
    private fuzzy: any
    private interval = setInterval(() => {

        this.fetch()

    }, 3000)

    

    public address: string
    public cookie: string
    public players: {
    
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

    } = JSON.parse(fs.readFileSync(dataFile).toString())

    constructor(address?: string) {

        this.players = {}
        this.address = address ?? defaultAddress

        this.lastFetch = Date.now()
        this.fuzzy = [[0, ""]]
        this.cookie =  JSON.parse(fs.readFileSync(cookieFile).toString()).cookie
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
    
        } = JSON.parse(fs.readFileSync(dataFile).toString())

        const player = data.players?.find((p) => p.name == name)

        console.log(player)

        return player

    }

    private makeFuzzy() {

        this.fuzzy = fuzzyset(this.players.players?.map((p) => (p.name)))

    }

    private async fetch() {

       // if (Date.now() - this.lastFetch < 10000 && this.players.players) return

        const res = await fetch("https://zion.craftyourtown.com/tiles/players.json", {
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

          console.log(res.status)
          try {
            const json = await res.json()

            this.players = json
    
            this.makeFuzzy()
    
            fs.writeFileSync(dataFile, JSON.stringify(this.players, null, 4))
          } catch (error) {}
       

        return

    }
    

}


