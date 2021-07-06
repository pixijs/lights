import { main } from '@pixi-build-tools/rollup-configurator/main';

const config = main({
    external: ['@pixi/layers'],
    globals: {
        '@pixi/layers': 'PIXI.display',
    },
});

export default config;
