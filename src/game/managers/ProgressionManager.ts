import { EventBus  } from "../EventBus";
import { Game } from "../scenes/Game";
import { playerManager } from "./PlayerManager";

export { ProgressionManager, TutorialStep };


const TUTORIAL_DATA =  [
        {
            text: 'Awaiting Heart Rate Data',
            priority: 1,
            preload: true,
            completionEvent: 'newHeartRate',
            // I feel like maybe this logic doesn't belong here
            onComplete: function(game: Game) {
                game.coins.isSpawnActive = true;
                game.coins.setSpawnRate(15);
                return true;
            }
        },
        {
            text: 'Use the Left and Right Arrows to move the ship to a coin',
            priority: 2,
            preload: true,
            completionEvent: 'coinCaptured',
            onComplete: function(game: Game) {
                return true;
            }
        },
        {
            text: 'Collect coins',
            priority: 3,
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
            priority: 4,
            completionEvent: 'newHeartRate',
            onComplete: function(game: Game) {
                if (playerManager.playerHR >= playerManager.getZoneMin(2)) {
                    return true;
                }
                return false;
            }
        },
        {
            text: 'If you can dodge a wrench, you can dodge an asteroid',
            priority: 10,
            completionEvent: 'notimplemented',
            onActivate: (game: Game) => {
                game.asteroids.isSpawnActive = true},
            onComplete: () =>{ return false}
            
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
    onComplete: (game: Game) => boolean;
    onActivate: (game: Game) => null;
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