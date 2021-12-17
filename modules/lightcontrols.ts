import fetch from "node-fetch"
export default class Lights {
    private readonly address = "http://10.1.1.4:3333/"
    constructor() {}

    public on() {
        fetch(this.address + "on", {
            method: "post"
        }) 
    }

    public off() {
        fetch(this.address + "off", {
            method: "post"
        }) 
    }

    public set(color: string) {
        fetch(this.address, {
            method: "post",
            body: JSON.stringify({hex: color}),
            headers: {'Content-Type': 'application/json'}
        }) 
    }
}