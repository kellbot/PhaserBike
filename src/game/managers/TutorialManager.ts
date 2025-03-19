import { EventBus  } from "../EventBus";
import { Game } from "../scenes/Game";

export { TutorialManager, TutorialStep };

const TUTORIAL_DATA =  [
        {
            text: 'Connect Heart Rate Monitor or Enable HRM Simulator',
            completed: false,
            priority: 1,
            completionEvent: 'newHeartRate',
            // I feel like maybe this logic doesn't belong here
            onComplete: function(game: Game) {
                console.log("Launching a coin");
                game.coins.spawnCoin(Phaser.Math.Between(50, 550), 0);
            }
        },
        {
            text: 'Press spacebar to use the tractor beam to capture a coin',
            completed: false,
            priority: 2,
            completionEvent: 'coinCaptured',
            onComplete: function() {
                console.log('Coin captured');
            }
        },
    ];

class TutorialManager {
    
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
            if (!step.completed) {
                return step;
            }
        }
        return null;
    }
}

class TutorialStep {
    text: string;
    completed: boolean;
    priority: number;
    completionEvent: string;
    onComplete: (game: Game) => void;
    tutorialManager: TutorialManager;

    constructor(stepData: any, tutorialManager: TutorialManager) {
        this.text = stepData.text;
        this.completed = stepData.completed ?? false;
        this.priority = stepData.priority ?? 1;
        this.completionEvent = stepData.completionEvent;
        this.onComplete = stepData.onComplete;
        this.tutorialManager = tutorialManager;
        
        EventBus.once(this.completionEvent, this.complete, this);
    }

    complete() {
        this.completed = true;
        // EventBus.off(this.completionEvent);
        this.onComplete(this.tutorialManager.game);
        this.tutorialManager.advanceTutorial();
    }
        
}