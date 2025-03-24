import { EventBus  } from "../EventBus";
import { Game } from "../scenes/Game";
import { playerManager } from "./PlayerManager";

export { ProgressionManager, TutorialStep };


const TUTORIAL_DATA =  [
        {
            text: 'Awaiting Heart Rate Data',
            priority: 1,
            completionEvent: 'newHeartRate',
            // I feel like maybe this logic doesn't belong here
            onComplete: function(game: Game) {
                game.coins.spawnCoin(Phaser.Math.Between(50, 550), 0);
                return true;
            }
        },
        {
            text: 'Use the Left and Right Arrows to move the ship',
            priority: 2,
            completionEvent: 'coinCaptured',
            onComplete: function(game: Game) {
                game.coinsActive = true;
                return true;
            }
        },
        // This is a silent step which launches the shop planet after the first coin is captured
        {
            completionEvent: 'coinCaptured',
            onComplete: function() {
                console.log("Launching shop");
               // EventBus.emit('launchShop');
            }
        },
        {
            text: 'Collect coins',
            priority: 3,
            completionEvent: 'coinCaptured',
            onComplete: function() {
                if (playerManager.coinCount >= 5){
                    console.log("Got 5 coins");
                    return true;
                } 
                return false;
            }
        },
        {
            text: 'Profit',
            priority: 4,
            completionEvent: 'boogers',
            onComplete: function() {
                return true;
            }
        }
    ];

class ProgressionManager {
    
    tutorialSteps: TutorialStep[] = [];
    game: Game;

    activeStep: TutorialStep | null;

    constructor(game: Game) {
        for (let stepData of TUTORIAL_DATA) {
            this.tutorialSteps.push(new TutorialStep(stepData, this));
        }
        this.game = game;

        this.advanceTutorial();
    }

    advanceTutorial(){
        this.activeStep = this.getNextStep();
        EventBus.emit('tutorial-updated', this.activeStep);
        console.log(this.activeStep);
    }

    getNextStep(): TutorialStep | null {
        this.tutorialSteps.sort((a, b) => a.priority - b.priority);
        for (let step of this.tutorialSteps) {
            if (!step.completed && step.text) {
                return step;
            }
        }
        return null;
    }
}

class TutorialStep {
    text: string | null;
    completed: boolean;
    priority: number;
    completionEvent: string;
    onComplete: (game: Game) => boolean;
    tutorialManager: ProgressionManager;

    constructor(stepData: any, tutorialManager: ProgressionManager) {
        this.text = stepData.text;
        this.completed = stepData.completed ?? false;
        this.priority = stepData.priority ?? 1;
        this.completionEvent = stepData.completionEvent;
        this.onComplete = stepData.onComplete;
        this.tutorialManager = tutorialManager;
        
        EventBus.once(this.completionEvent, this.checkComplete, this);
    }

    getText() : string {
        return this.text || 'Default Text';
    }

    checkComplete() {
        this.completed = true;
        // EventBus.off(this.completionEvent);
        if (this.onComplete(this.tutorialManager.game))
            {
                this.tutorialManager.advanceTutorial();
            } else 
            {
                // Keep listening
                EventBus.once(this.completionEvent, this.checkComplete, this);
            }
    }
        
}