import {WallContainer} from "./drawable";
import { mat4 } from 'gl-matrix'
import { boxW, boxIndices } from '../resources/boxVectors'

export default class hWallList extends WallContainer {
    private gl: WebGLRenderingContext;
    private walls: any[] = []
    private boxWorldUniformLocation: WebGLUniformLocation
    private program: WebGLProgram
    constructor(gl: WebGLRenderingContext, program: WebGLProgram) {
        super();
        this.gl = gl;
        this.program = program;
        this.boxWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
        for (let i = 0; i < 20; i++) {
            this.walls[i] = [];
            for (let j = 0; j < 21; j++) {
                this.walls[i][j] = mat4.create();
                mat4.translate(this.walls[i][j], this.walls[i][j], [(2 * boxW * i), (-2 * boxW * j) + boxW, 2 * boxW]);
                mat4.scale(this.walls[i][j], this.walls[i][j], [1, 0.2, 1]);
            }
        }
    }
    draw(): void {
        for (let i = 0; i < 20; i++)
            for (let j = 0; j < 21; j++) {
                if(!this.walls[i][j].visited)
                   { 
                this.gl.uniformMatrix4fv(this.boxWorldUniformLocation, false, this.walls[i][j]);
                this.gl.drawElements(this.gl.TRIANGLES, boxIndices.length, this.gl.UNSIGNED_SHORT, 0);}
            }
    }
    setWall(i:number, j:number):void {
        this.walls[i][j].visited = true;
    }
}