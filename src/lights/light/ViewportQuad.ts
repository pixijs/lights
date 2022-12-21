import { Rectangle, Quad } from '@pixi/core';

/**
 * @extends PIXI.Quad
 * @memberof PIXI.lights
 */
export class ViewportQuad extends Quad
{
    /**
     * Update
     * @param {PIXI.Rectangle} viewport -
     */
    update(viewport: Rectangle): void
    {
        const b = this.buffers[0].data as Float32Array;

        const x1 = viewport.x;
        const y1 = viewport.y;
        const x2 = viewport.x + viewport.width;
        const y2 = viewport.y + viewport.height;

        if (b[0] !== x1 || b[1] !== y1
            || b[4] !== x2 || b[5] !== y2)
        {
            b[0] = b[6] = x1;
            b[1] = b[3] = y1;
            b[2] = b[4] = x2;
            b[5] = b[7] = y2;
            this.buffers[0].update();
        }
    }

    static _instance: ViewportQuad = new ViewportQuad();
}
