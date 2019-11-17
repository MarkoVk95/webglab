import {Drawable} from "./drawable";
import { mat4 } from 'gl-matrix'
import { boxW, boxIndices } from '../resources/boxVectors'
export default class bWallList implements Drawable {
    private gl: WebGLRenderingContext;
    private walls: any[] = []
    private boxWorldUniformLocation: WebGLUniformLocation
    private program: WebGLProgram
    constructor(gl: WebGLRenderingContext, program: WebGLProgram) {
        this.gl = gl;
        this.program = program;
        this.boxWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
        for (let i = 0; i < 20; i++) {
            this.walls[i] = [];
            for (let j = 0; j < 20; j++) {
                this.walls[i][j] = mat4.create();
                mat4.translate(this.walls[i][j], this.walls[i][j], [(2 * boxW * i), (-2 * boxW * j), 0]);
            }
        }
    }
    draw(): void {
        for (let i = 0; i < 20; i++)
            for (let j = 0; j < 20; j++) {
                this.gl.uniformMatrix4fv(this.boxWorldUniformLocation, false, this.walls[i][j]);
                this.gl.drawElements(this.gl.TRIANGLES, boxIndices.length, this.gl.UNSIGNED_SHORT, 0);
            }
    }
}