import { EventBus  } from "../EventBus";

export { TutorialManager, TutorialStep };

const TUTORIAL_DATA =  [
        {
            text: 'Connect Heart Rate Monitor or Enable HRM Simulator',
            completed: false,
            priority: 1,
            completionEvent: 'heart-rate-update',
            onComplete: function() {
                console.log('HRM Connected');
            }
        },
        {
            text: 'Use the tractor beam to capture a coin',
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

    activeStep: TutorialStep | null;

    constructor() {
        for (let stepData of TUTORIAL_DATA) {
            this.tutorialSteps.push(new TutorialStep(stepData, this));
        }


        this.activeStep = this.getNextStep();
    }

    handleStepCompletion(){
        console.log("Step completed");
        this.activeStep = this.getNextStep();
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
    onComplete: Function;
    tutorialManager: TutorialManager;

    constructor(stepData: any, tutorialManager: TutorialManager) {
        this.text = stepData.text;
        this.completed = stepData.completed ?? false;
        this.priority = stepData.priority ?? 1;
        this.completionEvent = stepData.completionEvent;
        this.onComplete = stepData.onComplete;
        this.tutorialManager = tutorialManager;
        
        EventBus.on(this.completionEvent, this.complete, this);
    }

    complete() {
        this.completed = true;
        EventBus.off(this.completionEvent);
        this.onComplete();
        this.tutorialManager.handleStepCompletion();
    }
        
}