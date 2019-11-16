import Drawable from "./drawable";

export default class vWallList implements Drawable {
    private gl: WebGLRenderingContext;
    constructor(gl: WebGLRenderingContext) { 
        this.gl = gl;
    }
    draw(): void {
        throw new Error("Method not implemented.");
    }
}