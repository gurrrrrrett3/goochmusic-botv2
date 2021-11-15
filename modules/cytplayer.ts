export default class Player {

    public armor: number
    public health: number
    public name: string
    public uuid: string
    public world: string
    public x: number
    public z: number
    public yaw: number

    constructor(data?: {armor:number , health: number, name: string, uuid: string, world: string, x: number, z: number, yaw:number }) {

        if(!data) {
            data = {armor:0 , health: 0, name: "a", uuid: "a", world: "a", x: 0, z: 0, yaw: 0 }
        }

        this.armor = data.armor
        this.health = data.health
        this.name = data.name
        this.uuid = data.uuid
        this.world = data.world
        this.x = data.x
        this.z = data.z
        this.yaw = data.yaw 

    }

    public export() {

        return { armor: this.armor , health: this.health, name: this.name, uuid: this.uuid, world: this.world, x: this.x, z: this.z, yaw: this.yaw }
    }

}