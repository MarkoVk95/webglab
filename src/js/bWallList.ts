import { Drawable } from "./drawable";
import { glMatrix, mat4 } from 'gl-matrix'
import { boxW, boxIndices } from '../resources/boxVectors'

import * as bottomBoxTexture from '../resources/bottomBox.png';

export default class bWallList implements Drawable {
    private gl: WebGLRenderingContext;
    private walls: any[] = [];
    private boxWorldUniformLocation: WebGLUniformLocation;
    private program: WebGLProgram;
    private boxTexture: WebGLTexture;

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
    initializeTexture(): Promise<void> {
        return new Promise((resolve) => {
            const gl = this.gl;
            this.boxTexture = this.gl.createTexture();
            var boxImg: HTMLImageElement = new Image();
            boxImg.src = bottomBoxTexture;
            boxImg.addEventListener('load', () => {

                gl.bindTexture(gl.TEXTURE_2D, this.boxTexture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texImage2D(
                    gl.TEXTURE_2D,
                    0,
                    gl.RGBA,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    boxImg
                );
                resolve();
            });

        });
    }

    draw(): void {
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.boxTexture);
        for (let i = 0; i < 20; i++)
            for (let j = 0; j < 20; j++) {
                this.gl.uniformMatrix4fv(this.boxWorldUniformLocation, false, this.walls[i][j]);
                this.gl.drawElements(this.gl.TRIANGLES, boxIndices.length, this.gl.UNSIGNED_SHORT, 0);
            }
    }

    rotateAroundObject(distX: number, distY: number, distZ: number,angleX:number, axis: number[]): void {
        for (var i = 0; i < 20; i++)
            for (var j = 0; j < 20; j++) {
                mat4.translate(this.walls[i][j], this.walls[i][j], [distX - (2 * boxW * i), -distY + (2 * boxW * j),distZ]);        
                mat4.rotate(this.walls[i][j], this.walls[i][j], glMatrix.toRadian(angleX), axis);
                mat4.translate(this.walls[i][j], this.walls[i][j], [(2 * boxW * i) - distX, -((2 * boxW * j) - distY), -distZ]);
            }
    }
}