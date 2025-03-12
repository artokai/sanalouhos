export class LetterGrid {
    [index: number]: string

    private _letters: string[];
    private _isFilled = false;

    public width = 0;
    public height = 0;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this._letters = new Array(width * height).fill("");
        this._isFilled = false;

        return new Proxy(this, {
            get: (target, prop) => {
                if (typeof prop === 'string' && !isNaN(Number(prop))) {
                    return target.get(Number(prop));
                }
                const value = target[prop as keyof LetterGrid];
                return typeof value === 'function' ? value.bind(target) : value;
            },
            set: (target, prop, value) => {
                if (typeof prop === 'string' && !isNaN(Number(prop))) {
                    target.set(Number(prop), value);
                    return true;
                }
                (target as any)[prop] = value;
                return true;
            }
        });        
    }

    public get(index: number): string {
        return this._letters[index];
    }

    public set(index: number, value: string): void {
        this._letters[index] = value;
        this._isFilled = this._letters.every((letter) => letter);
    }

    public getByCoords(x: number, y: number): string {
        return this._letters[y * this.width + x];
    }

    public setByCoords(x: number, y: number, value: string): void {
        this._letters[y * this.width + x] = value;
        this._isFilled = this._letters.every((letter) => letter);
    }

    public getIndex(x: number, y: number): number {
        return y * this.width + x;
    }

    public getCoords(index: number): [number, number] {
        return [index % this.width, Math.floor(index / this.width)];   
    }

    public isFilled(): boolean {
        return this._isFilled;
    }
}