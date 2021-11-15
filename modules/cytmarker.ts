import { parse } from "node-html-parser" 

export default class Town {

    public name: string
    public mayor: string
    public assistants: string[]
    public color: string
    public residents: string[]
    public pvp: boolean
    public chunks: number
    public world: "earth" | "world"
    public coords: Coords

    constructor(world: "earth" | "world") { 

        this.world = world
        this.name = ""
        this.chunks = 0
        this.color = ""
        this.mayor = ""
        this.pvp = false
        this.residents = [""]
        this.assistants = [""]

        this.coords = {
            x: 0,
            z: 0
        }

    }

    fromIcon(data: MarkerIconData, world: World) {

        let town = new Town(world)

        town.coords = data.point
        town.chunks = 0
        
        const popupData = parse(data.popup).rawText.split("\n")

        town.name = popupData[2].trim().replace(/ \(.+\)/g, "")
        town.mayor = popupData[5].trim()
        town.assistants = popupData[8].trim().split(",").map((r) => r.trim())
        town.pvp = popupData[11].trim() == "true" ? true : false
        town.residents = popupData[13].trim().replace("Residents: ", "").split(",").map((r) => r.trim())

        return town

    }

}

export type MarkerPolygonData = {

    "fillColor": string,
    "popup": string,
    "color": string,
    "tooltip": string,
    "type": "polygon",
    "points": [[{
        "x": number,
        "z": number
    }]]


}

export type MarkerIconData = {

    "tooltip_anchor": {
        "z": number,
        "x": number
    },
    "popup": string,
    "size": {
        "z": number,
        "x": number
    },
    "anchor": {
        "z": number,
        "x": number
    },
    "tooltip": string,
    "icon": string,
    "type": "icon",
    "point": {
        "z": number,
        "x": number
    }
}

type World = "world" | "earth"

type Coords = {
    x: number
    z: number
}

