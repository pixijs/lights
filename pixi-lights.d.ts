/// <reference types="pixi.js" />
/// <reference types="pixi-layers" />

declare namespace PIXI.lights {
    const diffuseGroup: PIXI.display.Group;
    const normalGroup: PIXI.display.Group;
    const lightGroup: PIXI.display.Group;
    function registerPlugin(name: string, lightShader: LightShader): void;
    class Light extends PIXI.Container {
        constructor(color?: number, brightness?: number, vertices?: Float32Array, indices?: Float32Array);
        vertices: Float32Array;
        indices: Float32Array;
        blendMode: number;
        drawMode: number;
        dirty: number;
        lightHeight: number;
        falloff: number[];
        shaderName: string;
        useViewportQuad: boolean;
        color: number;
        brightness: number;
        private _color: number;
        private _colorRgba: number[];
        syncShader(shader: PIXI.Shader): void;
    }
    class LightShader extends PIXI.Shader {
        constructor(gl: WebGLRenderingContext, vertexSrc: string, fragmentSrc: string, customUniforms: any, customAttributes: any);
    }
    class DirectionalLight extends Light {
        constructor(color?: number, brightness?: number, target?: PIXI.PointLike | PIXI.DisplayObject);
        target: PIXI.PointLike | PIXI.DisplayObject;
        private _directionVector: PIXI.Point;
    }
    class DirectionalLightShader extends PIXI.Shader {
        constructor(gl: WebGLRenderingContext);
    }
    class AmbientLight extends Light {
        constructor(color?: number, brightness?: number);
    }
    class AmbientLightShader extends PIXI.Shader {
        constructor(gl: WebGLRenderingContext);
    }
    class PointLight extends Light {
        constructor(color?: number, brightness?: number);
    }
    class PointLightShader extends PIXI.Shader {
        constructor(gl: WebGLRenderingContext);
    }
    class WireframeShader extends PIXI.Shader {
        constructor(gl: WebGLRenderingContext);
    }
    class LightRenderer extends PIXI.ObjectRenderer {
    }
}

declare module "pixi-lights" {
    export = PIXI.lights;
}