export interface Drawable {
    draw(): void;
    initializeTexture(): Promise<void>;
}
export abstract class WallContainer implements Drawable {
    abstract draw(): void;
    abstract initializeTexture(): Promise<void>;
    abstract setWall(i:number, j:number):void;
}