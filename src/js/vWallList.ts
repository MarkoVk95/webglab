import Drawable from "./drawable";
import { mat4 } from 'gl-matrix'
import { boxW, boxIndices } from '../resources/boxVectors'

export default class vWallList implements Drawable {
    private gl: WebGLRenderingContext;
    private walls: any[] = []
    private boxWorldUniformLocation: WebGLUniformLocation
    private program: WebGLProgram
    constructor(gl: WebGLRenderingContext, program: WebGLProgram) {
        this.gl = gl;
        this.program = program;
        this.boxWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
        for (let i = 0; i < 21; i++) {
            this.walls[i] = [];
            for (let j = 0; j < 21; j++) {
                this.walls[i][j] = mat4.create();
                mat4.translate(this.walls[i][j], this.walls[i][j], [(2 * boxW * i) - boxW, (-2 * boxW * j), 2 * boxW]);
                mat4.scale(this.walls[i][j], this.walls[i][j], [0.2, 1, 1]);
            }
        }
    }
    draw(): void {
        for (let i = 0; i < 21; i++)
            for (let j = 0; j < 20; j++) {
                this.gl.uniformMatrix4fv(this.boxWorldUniformLocation, false, this.walls[i][j]);
                this.gl.drawElements(this.gl.TRIANGLES, boxIndices.length, this.gl.UNSIGNED_SHORT, 0);
            }
    }
}