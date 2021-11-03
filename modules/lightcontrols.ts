import fetch from "node-fetch"
export default class Lights {
    private readonly address = "35.40.252.12"
    constructor() {}

    public on() {
        fetch(this.address + "on", {
            method: "PUSH"
        }) 
    }

    public off() {
        fetch(this.address + "off", {
            method: "PUSH"
        }) 
    }

    public set(color: string) {
        fetch(this.address, {
            method: "PUSH",
            body: JSON.stringify({hex: color})
        }) 
    }
}