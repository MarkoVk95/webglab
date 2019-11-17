export interface Drawable {
    draw(): void;
}
export abstract class WallContainer implements Drawable {
    abstract draw(): void;
    abstract setWall(i:number, j:number):void;
}