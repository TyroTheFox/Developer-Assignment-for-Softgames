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

/**
 * Singleton Asset Loader Class
 * Loads the Game Assets
 * 
 * @class
 */
export class AssetLoader {
    static #instance: AssetLoader;

    private assetBundleList: string[] = [];
    private assetManifest: AssetManifestEntry[] = [];

    /**
     * @private
     * @constructor
     */
    private constructor() {
        const assetBundles = assetManifestData.bundle;
        
        for (let i = 0; i < assetBundles.length; i++) {
            const assetBundle = assetBundles[i];

            this.assetBundleList.push(assetBundle.name);
            this.assetManifest.push(assetBundle);
        }
    }

    /**
     * @public
     * @get
     * @returns {AssetLoader}
     */
    public static get instance(): AssetLoader {
        if (!AssetLoader.#instance) {
            AssetLoader.#instance = new AssetLoader();
        }

        return AssetLoader.#instance;
    }

    /**
     * Loads an Asset
     * 
     * @public
     * @param {string} assetURL
     */
    public async loadAsset(assetURL: string) {
        await Assets.load(assetURL);
    }

    /**
     * Adds the Bundle Entry to the Asset Manifest
     * 
     * @public
     * @param {AssetManifestEntry} bundleData 
     */
    public addToAssetManifest(bundleData: AssetManifestEntry) {
        this.assetManifest.push(bundleData);
    }


    /**
     * Loads the Asset Manifest data into the Cache
     * Call this first to load data and initialise the Asset instance
     * 
     * @public
     * @async
     */
    public async loadAssetManifestBundleData() {
        await Assets.init({ manifest: { bundles: this.assetManifest } });
    }

    /**
     * Load the Asset Bundle Assets into the Cache
     * Call this after loading the Asset Manifest data
     * 
     * @public
     * @async
     */
    public async loadAssetBundles() {
        const promises = [];
        for (let i = 0; i < this.assetBundleList.length; i++) {
            const assetBundleData = this.assetBundleList[i];

            promises.push(this.loadAssetBundle(assetBundleData));
        }

        await Promise.all(promises);
    }

    /**
     * Loads a given, pre-loaded Asset Bundle
     * 
     * @param {string} bundleName
     * @async
     */
    public async loadAssetBundle(bundleName: string) {
        await Assets.loadBundle(bundleName);
    }

    /**
     * Loads all pre-loaded Asset Bundles in the background
     * 
     * @async
     */
    public async loadAssetBundles_Background() {
        await Assets.backgroundLoadBundle(this.assetBundleList);
    }
}