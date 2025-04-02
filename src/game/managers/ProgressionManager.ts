import { EventBus  } from "../EventBus";
import { Spacefield } from "../scenes/Spacefield";
import { playerManager } from "./PlayerManager";

export { ProgressionManager, TutorialStep };


const TUTORIAL_DATA =  [
        {
            text: 'Awaiting Heart Rate Data',
            priority: 1,
            preload: true,
            completionEvent: 'newHeartRate',
            // I feel like maybe this logic doesn't belong here
            onComplete: function(game: Spacefield) {
                game.coins.isSpawnActive = true;
                game.coins.setSpawnRate(15);
                return true;
            }
        },
        {
            text: 'Step 1: try not to die. Use the left and right arrows.',
            priority: 5,
            completionEvent: '3-asteroids-dodged',
            onActivate: (game: Spacefield) => {
                game.asteroidManager.isSpawnActive = true},
            onComplete: () =>{ return true}
            
        },
        {
            text: 'Collect 3 coins',
            priority: 20,
            completionEvent: 'coinCaptured',
            preload: true,
            onComplete: function() {
                if (playerManager.coinCount >= 2){
                    return true;
                } 
                return false;
            }
        },
        {
            text: 'Raise your HR to go faster',
            priority: 30,
            completionEvent: 'newHeartRate',
            onActivate: (game: Spacefield) => {
                playerManager.isHRSpeedActive = true;
            },
            onComplete: function(game: Spacefield) {
                if (playerManager.playerHR >= playerManager.getZoneMin(2)) {
                    return true;
                }
                return false;
            }
        },

    ];

class ProgressionManager {
    
    tutorialSteps: TutorialStep[] = [];
    game: Spacefield;

    activeStep: TutorialStep | null;

    constructor(game: Spacefield) {
        for (let stepData of TUTORIAL_DATA) {
            this.tutorialSteps.push(new TutorialStep(stepData, this));
        }
        this.game = game;

        this.advanceTutorial();
    }

    advanceTutorial(){
        console.log("Tutorial advance", this.activeStep);
        this.activeStep = this.getNextStep();
        console.log("Tutorial advance", this.activeStep);
        if (this.activeStep?.onActivate) this.activeStep.onActivate(this.game);
        // If we didn't arm the event listener before we need to do it now
        if (!this.activeStep?.preload) this.activeStep?.setCompletionListener()
        EventBus.emit('tutorial-updated', this.activeStep);
        
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
    preload: boolean = false;
    onComplete: (game: Spacefield) => boolean;
    onActivate: (game: Spacefield) => null;
    tutorialManager: ProgressionManager;

    constructor(stepData: any, tutorialManager: ProgressionManager) {
        this.text = stepData.text;
        this.completed = stepData.completed ?? false;
        this.priority = stepData.priority ?? 1;
        this.completionEvent = stepData.completionEvent;
        this.preload = stepData.preload;
        this.onComplete = stepData.onComplete;
        if (stepData.onActivate) this.onActivate = stepData.onActivate;
        this.tutorialManager = tutorialManager;
        
        if (this.preload) this.setCompletionListener();
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
                this.setCompletionListener();
            }
    }

    setCompletionListener()
    {
        EventBus.once(this.completionEvent, this.checkComplete, this);
    }
        
}