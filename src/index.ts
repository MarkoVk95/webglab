import boxVertexShader from './shaders/boxVertexShader.glsl'
import boxFragmentShader from './shaders/boxFragmentShader.glsl'
import Drawable from './js/drawable'
import { glMatrix, mat4, mat3, vec3 } from 'gl-matrix'
import { boxIndices, boxVertices, colorRGB } from './resources/boxVectors'
import bWallList from './js/bWallList'
import hWallList from './js/hWallList'
import vWallList from './js/vWallList'
class CanvasApp {
    private canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext;
    private program: WebGLProgram;
    private viewMatrix: mat4;
    private projMatrix: mat4;
    private objectList: Drawable[];
    constructor() {
        this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        this.gl = this.canvas.getContext("webgl");
        this.gl.clearColor(0.75, 0.85, 0.8, 1.0);

        if (!this.gl) {
            alert('Your browser does not support WebGL');
        }
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);

        this.setupProgram();
        this.setupBuffers();
        this.setupInitialUniforms();
        //this.setupListeners();

        this.objectList = Array.from([new bWallList(this.gl, this.program),
                                       ]);
        requestAnimationFrame(this.mainLoop.bind(this));

    }

    private setupInitialUniforms(): void {
        this.gl.useProgram(this.program);
        const matViewUniformLocation: WebGLUniformLocation = this.gl.getUniformLocation(this.program, 'mView');
        const matProjUniformLocation: WebGLUniformLocation = this.gl.getUniformLocation(this.program, 'mProj');
        //setup -VIEWMATRIX-
        this.viewMatrix = mat4.create();
        mat4.lookAt(this.viewMatrix, [150, -150, 550], [150.0, -150.0, 0.0], [0.0, 1.0, 0.0]);
        //setup -PROJECTION MATRIX-
        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, glMatrix.toRadian(45),this.gl.canvas.width  / this.gl.canvas.height, 1, 2000);
        //setup -INITIAL UNIFORMS-
        this.gl.uniformMatrix4fv(matViewUniformLocation, false, this.viewMatrix);
        this.gl.uniformMatrix4fv(matProjUniformLocation, false, this.projMatrix);
    }

    private setupBuffers(): void {
        const gl: WebGLRenderingContext = this.gl;
        const program: WebGLProgram = this.program;

        const boxVertexBufferObject: WebGLBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);
        const boxIndexBufferObject: WebGLBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

        const positionAttribLocation: number = gl.getAttribLocation(program, 'vertPosition');
        const colorAttribLocation: number = gl.getAttribLocation(program, 'vertColor');
        gl.vertexAttribPointer(
            positionAttribLocation, // Attribute location
            3, // Number of elements per attribute
            gl.FLOAT, // Type of elements
            false,
            3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
            0 // Offset from the beginning of a single vertex to this attribute
        );
        var boxRGBBufferObject: WebGLBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, boxRGBBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(colorRGB), gl.STATIC_DRAW);

        gl.vertexAttribPointer(
            colorAttribLocation, // Attribute location
            3, // Number of elements per attribute
            gl.UNSIGNED_BYTE, // Type of elements
            true,
            0, // Size of an individual vertex
            0 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
        );

        gl.enableVertexAttribArray(positionAttribLocation);
        gl.enableVertexAttribArray(colorAttribLocation);
    }

    private setupProgram(): void {
        const vertexShader: WebGLShader = this.compileShader(this.gl.VERTEX_SHADER, boxVertexShader);
        const fragmentShader: WebGLShader = this.compileShader(this.gl.FRAGMENT_SHADER, boxFragmentShader);
        this.program = this.createProgram(vertexShader, fragmentShader);
    }

    private compileShader(SHADER_TYPE: number, shaderString: string) {
        const shader: WebGLShader = this.gl.createShader(SHADER_TYPE);
        this.gl.shaderSource(shader, shaderString);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('ERROR compiling shader!', this.gl.getShaderInfoLog(shader));
            return;
        }
        return shader;
    }

    private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
        const program: WebGLProgram = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('ERROR linking program!', this.gl.getProgramInfoLog(program));
            return;
        }
        this.gl.validateProgram(program);
        if (!this.gl.getProgramParameter(program, this.gl.VALIDATE_STATUS)) {
            console.error('ERROR validating program!', this.gl.getProgramInfoLog(program));
            return;
        }
        return program;
    }

    private setupListeners(): void {
        throw new Error("Method not implemented.");
    }

    private mainLoop(): void {
        this.draw();
    }

    private draw(): void {
        this.resize(this.gl.canvas as HTMLCanvasElement);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);
        for (const entry of this.objectList) {
            entry.draw();
        }
    }

    private resize(canvas: HTMLCanvasElement): void {
        // Lookup the size the browser is displaying the canvas.
        const displayWidth: number = canvas.clientWidth;
        const displayHeight: number = canvas.clientHeight;

        // Check if the canvas is not the same size.
        if (canvas.width != displayWidth ||
            canvas.height != displayHeight) {

            // Make the canvas the same size
            canvas.width = displayWidth;
            canvas.height = displayHeight;
        }
    }
}

new CanvasApp();