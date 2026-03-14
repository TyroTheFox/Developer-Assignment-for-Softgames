import dialogueExampleData from '../../data/dialogue/dialogue_example.json' assert {type: 'json'};

import { Scene } from "../../engine/actors/actors/scene/scene";
import { EE } from "../../engine/screen/game_screen";
import { DialogueBox } from "../../engine/actors/actors/ui/dialogue_box";

export class DialogueExampleUI extends Scene {
    protected dialogueBox!: DialogueBox;

    public override async init(): Promise<void> {
        const {dialogue, avatars, emojies} = dialogueExampleData;

        this.dialogueBox = this.getChildByLabel('dialogueBox') as DialogueBox;

        await this.dialogueBox.setAvatarData(avatars);
        await this.dialogueBox.setEmojiData(emojies);
        
        this.dialogueBox.setDialogueData(dialogue);

        // this.dialogueBox.nextDialogueStep();

        EE.on('dialogue_entry_complete', () => {
            this.dialogueBox.nextDialogueStep();
        });

        EE.on('dialogue_complete', () => {
            this.dialogueBox.hide();
        });

        EE.on('showDialogue', () => {
            this.dialogueBox.show();
        });

        EE.on('hideDialogue', () => {
            this.dialogueBox.hide();
        });
    }

    public override async onEnter(): Promise<void> {
        this.dialogueBox.pauseDialogue = false;
    }

    public override async onExit(): Promise<void> {
        this.dialogueBox.pauseDialogue = true;
    }
}