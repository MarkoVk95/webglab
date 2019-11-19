import boxVertexShader from './shaders/boxVertexShader.glsl'
import boxFragmentShader from './shaders/boxFragmentShader.glsl'
import { Drawable, WallContainer } from './js/drawable'
import { glMatrix, mat4, mat3, vec3 } from 'gl-matrix'
import { boxIndices, boxVertices, boxTextST, boxW } from './resources/boxVectors'
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
    private boxTexture: WebGLTexture;
    private oldPosition: { x: number, y: number };
    private perspectiveEye: [number, number, number];
    private matViewUniformLocation: WebGLUniformLocation;
    private drag: boolean;

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
        this.setupListeners();

        this.objectList = Array.from([new bWallList(this.gl, this.program),
        new hWallList(this.gl, this.program),
        new vWallList(this.gl, this.program)
        ]);
        //requestAnimationFrame(this.draw.bind(this));

        Promise.all(this.objectList.filter(o => {
            if (!o["initializeTexture"]) return false;
            return true;
        }).map(o => o.initializeTexture())).then(() => this.initRecursiveLab());
    }

    private setupInitialUniforms(): void {
        this.gl.useProgram(this.program);
        this.matViewUniformLocation = this.gl.getUniformLocation(this.program, 'mView');
        const matProjUniformLocation: WebGLUniformLocation = this.gl.getUniformLocation(this.program, 'mProj');
        //-> setup -VIEWMATRIX-
        this.viewMatrix = mat4.create();
        this.perspectiveEye = [150, -150, 550];
        mat4.lookAt(this.viewMatrix, this.perspectiveEye, [this.perspectiveEye[0], this.perspectiveEye[1], 0], [0.0, 1.0, 0.0]);
        //-> setup -PROJECTION MATRIX-
        this.projMatrix = mat4.create();
        mat4.perspective(this.projMatrix, glMatrix.toRadian(45), this.gl.canvas.width / this.gl.canvas.height, 1, 2000);
        //-> setup -INITIAL UNIFORMS-
        this.gl.uniformMatrix4fv(this.matViewUniformLocation, false, this.viewMatrix);
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
        const textureAttribLocation: number = gl.getAttribLocation(program, 'a_textureVec');
        gl.vertexAttribPointer(
            positionAttribLocation, // Attribute location
            3, // Number of elements per attribute
            gl.FLOAT, // Type of elements
            false,
            3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
            0 // Offset from the beginning of a single vertex to this attribute
        );

        var boxTextureBufferObject: WebGLBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, boxTextureBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxTextST), gl.STATIC_DRAW);

        gl.vertexAttribPointer(
            textureAttribLocation, // Attribute location
            2, // Number of elements per attribute
            gl.FLOAT, // Type of elements
            false,
            0, // Size of an individual vertex
            0 * gl.FLOAT, // Offset from the beginning of a single vertex to this attribute
        );





        //-> ENABLE ATTRIBUTES
        gl.enableVertexAttribArray(positionAttribLocation);
        gl.enableVertexAttribArray(textureAttribLocation);
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
        this.canvas.addEventListener("mousedown", (e) => {
            this.oldPosition = { x: e.clientX, y: e.clientY };
            this.drag = true;
            e.preventDefault();
            return false;
        });
        this.canvas.addEventListener("mouseup", () => this.drag = false);
        this.canvas.addEventListener("mousemove", (e) => {
            if (this.drag) {
                let iMid = 9;  //i of the rotation element
                let jMid = 9;  // j of the rotation element
                let distX = 2 * boxW * iMid;
                distX += boxW;
                let distY = 2 * boxW * jMid;
                distY += boxW;
                let distZ = boxW;
                let angleX;
                if (e.clientX != this.oldPosition.x)
                    angleX = e.clientX > this.oldPosition.x ? 5 : -5;
                else angleX = 0;
                this.oldPosition.x = e.clientX;
                this.objectList.forEach((entry) => entry.rotateAroundObject(distX, distY, distZ, angleX, [0, 1, 0]));
                this.draw();
            }
        });
        document.addEventListener("keydown", (e) => {
            switch (e.key) {
                case "ArrowLeft":
                        this.perspectiveEye[0] = this.perspectiveEye[0] + 20;
                    break;
                case "ArrowRight":
                        this.perspectiveEye[0] = this.perspectiveEye[0] - 20;
                    break;
                case "ArrowUp":
                    this.perspectiveEye[2] = this.perspectiveEye[2] + 20;
                    break;
                case "ArrowDown":
                    this.perspectiveEye[2] = this.perspectiveEye[2] - 20;
                    break;
    
            }
            mat4.lookAt(this.viewMatrix, this.perspectiveEye, [this.perspectiveEye[0], this.perspectiveEye[1], 0], [0.0, 1.0, 0.0]);  
            this.gl.uniformMatrix4fv(this.matViewUniformLocation, false, this.viewMatrix);
            this.draw();
        });
    }

    private draw(): void {
        this.resize(this.gl.canvas as HTMLCanvasElement);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);

        this.objectList.forEach((entry) => entry.draw());

    }

    private initRecursiveLab() {
        interface drawableNode {
            i: number,
            j: number,
            visited: boolean
        }
        let current: drawableNode;
        let grid: drawableNode[][] = [];
        let stack: drawableNode[] = [];
        for (var i = 0; i < 20; i++) {
            grid[i] = [];
            for (var j = 0; j < 20; j++)
                grid[i][j] = { i, j, visited: false };
        }
        current = grid[0][0];
        const nextMove = () => {
            current.visited = true;
            let next = neighbour(current);
            if (next) {
                next.visited = true;
                stack.push(current);
                removeWall(current, next);
                current = next;
            }
            else if (stack.length > 0)
                current = stack.pop();
            else if (stack.length == 0)
                return;
            this.draw();

            setTimeout(nextMove.bind(this), 1);
        };

        const removeWall = (current, next) => {
            const i = current.i - next.i;
            if (i == 1 || i == -1)
                (this.objectList[2] as WallContainer).setWall(next.i, current.j);
            const j = current.j - next.j;
            if (j == 1 || j == -1)
                (this.objectList[1] as WallContainer).setWall(current.i, next.j);
        };

        const neighbour = (current) => {
            const neighbors: drawableNode[] = [];
            if (current.j - 1 > 0)
                var top = grid[current.i][(current.j) - 1];
            if (current.j + 1 < 20)
                var bottom = grid[current.i][(current.j) + 1];
            if (current.i - 1 > 0)
                var left = grid[(current.i) - 1][current.j];
            if (current.i + 1 < 20)
                var right = grid[(current.i) + 1][current.j];
            if (top && !top.visited) neighbors.push(top);
            if (right && !right.visited) neighbors.push(right);
            if (bottom && !bottom.visited) neighbors.push(bottom);
            if (left && !left.visited) neighbors.push(left);
            if (neighbors.length > 0) {
                var n = Math.floor(Math.random() * neighbors.length);
                return neighbors[n];
            }
        };

        // -> start the labyrinth
        nextMove();
    };

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