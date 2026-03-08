import {Assets} from 'pixi.js';

import assetManifestData from '../../data/assets/asset_manifest.json' assert {type: 'json'};

export type AssetsManifestEntryData = {
    alias: string,
    src: string
};

export type AssetManifestEntry = {
    name: string,
    assets: AssetsManifestEntryData[]
};

export class AssetLoader {
    static #instance: AssetLoader;

    private assetBundleList: string[] = [];
    private assetManifest: AssetManifestEntry[] = [];

    private constructor() {
        const assetBundles = assetManifestData.bundle;
        
        for (let i = 0; i < assetBundles.length; i++) {
            const assetBundle = assetBundles[i];

            this.assetBundleList.push(assetBundle.name);
            this.assetManifest.push(assetBundle);
        }
    }

    public static get instance(): AssetLoader {
        if (!AssetLoader.#instance) {
            AssetLoader.#instance = new AssetLoader();
        }

        return AssetLoader.#instance;
    }

    public async loadAsset(assetURL: string) {
        await Assets.load(assetURL);
    }

    public addToAssetManifest(bundleData: AssetManifestEntry) {
        this.assetManifest.push(bundleData);
    }

    public async loadAssetManifestBundleData() {
        await Assets.init({ manifest: { bundles: this.assetManifest } });
    }

    public async loadAssetBundles() {
        for (let i = 0; i < this.assetBundleList.length; i++) {
            const assetBundleData = this.assetBundleList[i];

            await this.loadAssetBundle(assetBundleData);
        }
    }

    public async loadAssetBundle(bundleName: string) {
        await Assets.loadBundle(bundleName);
    }

    public async loadAssetBundles_Background() {
        await Assets.backgroundLoadBundle(this.assetBundleList);
    }
}