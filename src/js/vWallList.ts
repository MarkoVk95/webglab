import { Drawable, WallContainer } from "./drawable";
import { glMatrix, mat4 } from 'gl-matrix'
import { boxW, boxIndices } from '../resources/boxVectors'
import * as vBoxTexture from '../resources/wall.png';

export default class vWallList extends WallContainer {
    private gl: WebGLRenderingContext;
    private walls: any[] = [];
    private boxWorldUniformLocation: WebGLUniformLocation;
    private program: WebGLProgram;
    private boxTexture: WebGLTexture;

    constructor(gl: WebGLRenderingContext, program: WebGLProgram) {
        super();
        this.gl = gl;
        this.program = program;
        this.boxWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
        for (let i = 0; i < 21; i++) {
            this.walls[i] = [];
            for (let j = 0; j < 20; j++) {
                this.walls[i][j] = mat4.create();
                mat4.translate(this.walls[i][j], this.walls[i][j], [(2 * boxW * i) - boxW, (-2 * boxW * j), 2 * boxW]);
                mat4.scale(this.walls[i][j], this.walls[i][j], [0.2, 1, 1]);
            }
        }
    }

    initializeTexture(): Promise<void> {
        return new Promise((resolve) => {
            const gl = this.gl;
            this.boxTexture = this.gl.createTexture();
            var boxImg: HTMLImageElement = new Image();
            boxImg.src = vBoxTexture;
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
        for (let i = 0; i < 21; i++)
            for (let j = 0; j < 20; j++) {
                if (!this.walls[i][j].visited) {
                    this.gl.uniformMatrix4fv(this.boxWorldUniformLocation, false, this.walls[i][j]);
                    this.gl.drawElements(this.gl.TRIANGLES, boxIndices.length, this.gl.UNSIGNED_SHORT, 0);
                }
            }
    }

    rotateAroundObject(distX: number, distY: number, distZ: number, angleX:number, axis: number[]): void {
        for (let i = 0; i < 21; i++)
            for (let j = 0; j < 20; j++) {
                mat4.scale(this.walls[i][j], this.walls[i][j], [5.0, 1, 1.0]);
                mat4.translate(this.walls[i][j], this.walls[i][j], [distX - (2 * boxW * i) + boxW, -distY + (2 * boxW * j), -distZ]);
                mat4.rotate(this.walls[i][j], this.walls[i][j], glMatrix.toRadian(angleX), axis);
                mat4.translate(this.walls[i][j], this.walls[i][j], [(2 * boxW * i) - distX - boxW, -((2 * boxW * j) - distY), distZ]);
                mat4.scale(this.walls[i][j], this.walls[i][j], [0.2, 1.0, 1.0]);
            }
    }

    setWall(i, j): void {
        this.walls[i][j].visited = true;
    }
}