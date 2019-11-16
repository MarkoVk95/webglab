import boxVertexShader from './shaders/boxVertexShader.glsl'
import boxFragmentShader from './shaders/boxFragmentShader.glsl'
import Drawable from './js/drawable'

class CanvasApp {
    private canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext;
    private viewMatrix: Float32Array;
    private projMatrix: Float32Array;
    private objectList: Drawable[] = [];
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
        //this.setupListeners();
        requestAnimationFrame(this.mainLoop.bind(this));

    }

    private setupProgram(): void {
        const vertexShader: WebGLShader = this.compileShader(this.gl.VERTEX_SHADER, boxVertexShader);
        const fragmentShader: WebGLShader = this.compileShader(this.gl.FRAGMENT_SHADER, boxFragmentShader);
        const program = this.createProgram(vertexShader, fragmentShader);

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