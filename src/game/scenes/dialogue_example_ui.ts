import dialogueExampleData from '../../data/dialogue/dialogue_example.json' assert {type: 'json'};

import { Scene } from "../../engine/actors/actors/scene/scene";
import { EE } from "../../engine/screen/game_screen";
import { DialogueBox } from "../../engine/actors/actors/ui/dialogue_box";
import { DrawnGraphics } from '../../engine/actors/actors/ui/drawn_graphics';

/** 
 * @class
 * @extends {Scene}
 * 
 * Dialogue Example UI Scene
 */
export class DialogueExampleUI extends Scene {
    protected dialogueBox!: DialogueBox;
    protected panelBackground!: DrawnGraphics;

    /**
     * Initialise the scene
     * 
     * @public
     * @override
     * @async
     * @returns {Promise<void>}
     */
    public override async init(): Promise<void> {
        const {dialogue, avatars, emojies} = dialogueExampleData;

        this.dialogueBox = this.getChildByLabel('dialogueBox') as DialogueBox;
        this.panelBackground = this.dialogueBox.getChildByLabel('panelBackground') as DrawnGraphics;

        await this.dialogueBox.setAvatarData(avatars);
        await this.dialogueBox.setEmojiData(emojies);
        
        this.dialogueBox.setDialogueData(dialogue);

        /**
         * @listens DialogueBox#event:dialogue_entry_complete
         */
        EE.on('dialogue_entry_complete', () => {
            this.dialogueBox.nextDialogueStep();
        });

        /**
         * @listens DialogueBox#event:dialogue_complete
         */
        EE.on('dialogue_complete', () => {
            this.dialogueBox.hide();
        });

        /**
         * @listens DialogueExampleScene#event:show_dialogue
         */
        EE.on('show_dialogue', () => {
            this.dialogueBox.show();
        });

        /**
         * @listens DialogueExampleScene#event:hide_dialogue
         */
        EE.on('hide_dialogue', () => {
            this.dialogueBox.hide();
        });
    }

    /**
     * Called when the Scene is activated
     * Unpause the Dialogue Scene
     * 
     * @public
     * @override
     * @async
     * @returns {Promise<void>}
     */
    public override async onEnter(): Promise<void> {
        this.dialogueBox.pauseDialogue = false;
    }

    /**
     * Called when the Scene is deactivated
     * Pause the Dialogue Scene
     * 
     * @public
     * @override
     * @async
     * @returns {Promise<void>}
     */
    public override async onExit(): Promise<void> {
        this.dialogueBox.pauseDialogue = true;
    }

    /**
     * Resizes the elements of the scene
     * 
     * @public
     * @override
     * @param {number} width - Scaled Screen Width 
     * @param {number} height - Scaled Screen Height 
     * @param {number} scaleWithValue - Scale value that matches that of the Game Screen Space 
     * @param {number} scaleAgainstValue - Scale vale that inverts that of the Game Screen Space
     */
    public override resize(width: number, height: number, scaleWithValue: number, scaleAgainstValue: number) {
        super.resize(width, height, scaleWithValue, scaleAgainstValue);

        if (this.dialogueBox) {
            this.dialogueBox.pivot.x = this.panelBackground.width * 0.5;
        }
    }
}