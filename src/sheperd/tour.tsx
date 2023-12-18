import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

export function startTour() {
  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      classes: 'shadow-md bg-purple-dark',
      scrollTo: true
    }
  });

  tour.addSteps([
    {
        id: 'step-1',
        text: [
          `
          <h1>Welcome to Xircuits!</h1>
          <p>
          Xircuits is a simple visual programming environment 
          for Jupyterlab.
          </p>
          `
        ],
        classes: 'shepherd shepherd-welcome',
        buttons: [
          {
            classes: 'shepherd-button-secondary',
            action: tour.cancel,
            text: 'Exit'
          },
          {
            action: tour.next,
            text: 'Start Tour'
          }
        ]
      },

      {
        id: 'step-2',
        text: [
          `
          You can start a new Xircuits workflow by selecting it in the launcher.
          `
        ],
        attachTo: {
          element: '.jp-LauncherCard[title="Create a new xircuits file"]',
          on: 'top'
        },
        classes: 'shepherd shepherd-welcome',
        advanceOn: { 
          selector: '.jp-LauncherCard[title="Create a new xircuits file"]', 
          event: 'click'
        }
      },
      {
        id: 'step-3',
        text: [
          `
          <p>
          This is your Xircuits workflow canvas. You can add nodes components to connect here.
          </p>
          `
        ],
        attachTo: {
          element: '.lm-Widget.jp-MainAreaWidget.xircuits-editor',
          on: 'left'
        },
        classes: 'shepherd shepherd-welcome',
        buttons: [
          {
            action: tour.next,
            text: 'Next'
          }
        ],
      },
      {
        id: 'component-library',
        text: [
          'This is your component libraries. Click on them to reveal the component inside the library. ',
          'For now, drag in the print component in the Template library.',
        ],
        attachTo: {
          element: '[data-id="xircuits-component-sidebar"]',
          on: 'left'
        },
        classes: 'shepherd shepherd-welcome',
        advanceOn: { 
          selector: '[data-id="xircuits-component-sidebar"]', 
          event: 'click'
        }
      },
      {
        id: 'followup',
        title: 'Learn more',
        text: 'Star Xicuits on Github so you remember it for your next project!',
        scrollTo: true,
        buttons: [
          {
            text: 'Done',
            action: tour.complete
          }
        ]
      }
    ]);
  tour.start();
}
