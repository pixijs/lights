/// <reference types="pixi.js" />
/// <reference types="pixi-layers" />
declare module PIXI.lights {
    export const diffuseGroup: PIXI.display.Group;
    export const normalGroup: PIXI.display.Group;
    export const lightGroup: PIXI.display.Group;

    export function registerPlugin(name: string, lightShader: LightShader): void;

    export class Light extends PIXI.Container {
        constructor(color?: number, brightness?: number, vertices?: Float32Array, indices?: Float32Array);
        vertices: Float32Array;
        indices: Float32Array;
        blendMode: number;
        drawMode: number;
        dirty: number;
        lightHeight: number;
        falloff: Array<number>;
        shaderName: string;
        useViewportQuad: boolean;
        color: number;
        brightness: number;

        private _color: number;
        private _colorRgba: Array<number>;

        syncShader(shader: PIXI.Shader): void;
    }

    export class LightShader extends PIXI.Shader {
        constructor(gl: WebGLRenderingContext, vertexSrc: string, fragmentSrc: string, customUniforms: any, customAttributes: any);
    }

    export class DirectionalLight extends Light {
        constructor(color?: number, brightness?: number, target?: PIXI.PointLike | PIXI.DisplayObject);
        target: PIXI.PointLike | PIXI.DisplayObject;
        private _directionVector: PIXI.Point;
    }

    export class DirectionalLightShader extends PIXI.Shader {
        constructor(gl: WebGLRenderingContext);
    }

    export class AmbientLight extends Light {
        constructor(color?: number, brightness?: number);

    }

    export class AmbientLightShader extends PIXI.Shader {
        constructor(gl: WebGLRenderingContext);
    }

    export class PointLight extends Light {
        constructor(color?: number, brightness?: number);

    }

    export class PointLightShader extends PIXI.Shader {
        constructor(gl: WebGLRenderingContext);
    }

    export class WireframeShader extends PIXI.Shader {
        constructor(gl: WebGLRenderingContext);
    }

    export class LightRenderer extends PIXI.ObjectRenderer {
    }
}
