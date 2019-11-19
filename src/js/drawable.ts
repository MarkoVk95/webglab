export interface Drawable {
    draw(): void;
    initializeTexture(): Promise<void>;
    rotateAroundObject(distX:number, distY:number, distZ:number, angleX:number, axis: number[]): void;
}
export abstract class WallContainer implements Drawable {
    abstract draw(): void;
    abstract initializeTexture(): Promise<void>;
    abstract setWall(i:number, j:number):void;
    abstract rotateAroundObject(distX:number, distY:number, distZ:number, angleX:number, axis: number[]): void;
}