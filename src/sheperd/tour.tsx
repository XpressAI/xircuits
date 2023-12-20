import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { offset } from '@floating-ui/dom';
import { findElementByText } from './utils';

export function startTour() {
  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    confirmCancel: true,
    keyboardNavigation: false,
    defaultStepOptions: {
      classes: 'shadow-md bg-purple-dark',
      scrollTo: true,
      cancelIcon: {
				enabled: true
			},
      modalOverlayOpeningPadding: 3,
      modalOverlayOpeningRadius: 3,
      floatingUIOptions: {
        middleware: [offset(20)]
      }
    }
  });

  tour.addSteps([
    {
        id: 'step-1',
        title: 'Welcome to Xircuits!',
        text: [
          `
          Xircuits is a simple visual programming environment 
          for Jupyterlab. Would you like a quick tutorial on how things work?
          `
        ],
        beforeShowPromise: function() {
          return new Promise(function(resolve) {
            setTimeout(resolve, 2000);
          });
        },
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
        ],
      },

      {
        id: 'step-2',
        title: 'Starting a New Workflow',
        text: [
          `
          You can start a new Xircuits workflow by selecting it in the launcher.
          `
        ],
        attachTo: {
          element: '.jp-LauncherCard[title="Create a new xircuits file"]',
          on: 'top'
        },
        advanceOn: { 
          selector: '.jp-LauncherCard[title="Create a new xircuits file"]', 
          event: 'click'
        }
      },
      {
        id: 'step-3',
        title: 'The Xircuits Canvas',
        text: [
          `
          <p>
          This is your Xircuits workflow canvas. You can add nodes components to connect here.
          </p>
          `
        ],
        attachTo: {
          element: function() {
            var el = document.querySelector('.jp-MainAreaWidget.xircuits-editor');
            return el ? el : undefined;
          },
          on: 'left'
        },
        buttons: [
          {
            action: tour.next,
            text: 'Next'
          }
        ],
        beforeShowPromise: function() {
          return new Promise(function(resolve) {
            setTimeout(resolve, 500);
          });
        },
      },
      {
        id: 'component-library-1',
        title: 'Xircuits Component Libraries',
        text: [
          'You can access your Xircuits component libraries from the sidebar.',
        ],
        attachTo: {
          element: '[data-id="xircuits-component-sidebar"]',
          on: 'left'
        },
        advanceOn: { 
          selector: '[data-id="xircuits-component-sidebar"]', 
          event: 'click'
        }
      },
      {
        id: 'component-library-2',
        title: 'Xircuits Component Library',
        text: [
          'Each of these sections are individual component libraries from your `xai_components` directory. Clicking on them will reveal the components inside.',
        ],
        attachTo: {
          element: '#xircuits-component-sidebar',
          on: 'left'
        },
        buttons: [
          {
            action: tour.next,
            text: 'Next'
          }
        ],
      },
      {
        id: 'component-library-3',
        title: 'Xircuits Component Library',
        text: [
          "Let's try dragging in a component. Open the Utils Component library..."
        ],
        attachTo: {
          element: function() {
            return findElementByText('.accordion__button[id^="accordion__heading-"][data-accordion-component="AccordionItemButton"]', "UTILS");
          },
          on: 'right'
        },
        when: {
          show: function() {
            const element = findElementByText('.accordion__button[id^="accordion__heading-"][data-accordion-component="AccordionItemButton"]', "UTILS");
            if (element) {
              element.addEventListener('click', function() {
                tour.next();
              }, { once: true });
            }
          }
        }
      },
      {
        id: 'component-library-4',
        title: 'Xircuits Component Library',
        text: ["And drag the Print component into the canvas."],
        attachTo: {
          element: ".lm-Widget.lm-Panel.lm-SplitPanel.lm-BoxPanel-child",
          on: 'bottom'
        },
        buttons: [
          {
            action: tour.next,
            text: 'Next'
          }
        ],
      },
      {
        id: 'xircuits-components-1',
        title: 'Xircuits Components',
        text: [
          "This is the Print component. In Xircuits, each component will execute a specific command."
        ],
        scrollTo: false,
        attachTo: {
          element: '[data-default-node-name="Print"]',
          on: 'right'
        },
        buttons: [
          {
            action: tour.next,
            text: 'Next'
          }
        ],
      },
      {
        id: 'xircuits-components-2',
        title: 'Xircuits Components',
        text: [
          "You can click on the `i` to show a tooltip that describes the component."
        ],
        scrollTo: false,
        attachTo: {
          element: '[data-default-node-name="Print"] .react-toggle.description',
          on: 'right'
        },
        buttons: [
          {
            action: tour.next,
            text: 'Next'
          }
        ],
      },
      {
        id: 'xircuits-workflow-1',
        title: 'Starting on your Workflow',
        text: [
          "In Xircuits, you can indicate the flow of process by connecting triangle [▶] ports. Take note the order is important, you can only connect from an outPort..."
        ],
        scrollTo: false,
        attachTo: {
          element: '[data-default-node-name="Start"] [data-name="out-0"]',
          on: 'bottom'
        },
        buttons: [
          {
            action: tour.next,
            text: 'Next'
          }
        ],
      },
      {
        id: 'xircuits-workflow-2',
        title: 'Starting on your Workflow',
        text: [
          "To another inPort."
        ],
        scrollTo: false,
        attachTo: {
          element: '[data-default-node-name="Print"] [data-name="in-0"]',
          on: 'bottom'
        },
        buttons: [
          {
            action: tour.next,
            text: 'Next'
          }
        ],
      },
      {
        id: 'xircuits-workflow-3',
        title: 'Starting on your Workflow',
        text: [
          "Try connecting Start to Print, then Print to Start!"
        ],
        attachTo: {
          element: '.lm-Widget.lm-Panel.lm-SplitPanel.lm-BoxPanel-child',
          on: 'bottom'
        },
        buttons: [
          {
            action: tour.next,
            text: 'Next'
          }
        ],
      },
      {
        id: 'xircuits-workflow-4',
        title: 'Adding Parameters',
        text: [
          "You're almost there! As you can see, the `Print` component has an extra inPort. In Xircuits, you can supply parameters to a component to adjust their output. You can do that by supplying parameter components."
        ],
        scrollTo: false,
        attachTo: {
          element: '[data-default-node-name="Print"] [data-name="parameter-any-msg"]',
          on: 'bottom'
        },
        buttons: [
          {
            action: tour.next,
            text: 'Next'
          }
        ],
      },
      {
        id: 'xircuits-workflow-5',
        title: 'Adding Parameters',
        text: [
          "Let's supply it with a parameter component. Open the `GENERAL` component library..."
        ],
        attachTo: {
          element: function() {
            return findElementByText('.accordion__button[id^="accordion__heading-"][data-accordion-component="AccordionItemButton"]', "GENERAL");
          },          
          on: 'right'
        },
        when: {
          show: function() {
            const element = findElementByText('.accordion__button[id^="accordion__heading-"][data-accordion-component="AccordionItemButton"]', "GENERAL");
            if (element) {
              element.addEventListener('click', function() {
                tour.next();
              }, { once: true });
            }
          }
        }
      },
      {
        id: 'component-library-6',
        title: 'Adding Parameters',
        text: ["And drag the Literal String component into the canvas. A input dialogue will spawn. Fill it with anything you'd like, say 'Hello Xircuits!'."],
        attachTo: {
          element: ".lm-Widget.lm-Panel.lm-SplitPanel.lm-BoxPanel-child",
          on: 'bottom'
        },
        buttons: [
          {
            action: tour.next,
            text: 'Next'
          }
        ],
      },
      {
        id: 'component-library-7',
        title: 'Adding Parameters',
        text: ["Finally, connect the `Literal String` component to `Print` `msg` inPort. The final step should look like this. <img src='https://github.com/XpressAI/xircuits/assets/68586800/80c77edf-7ea8-40a7-9ebf-0812d5a41d11' style='width: auto; height: auto;'>"],
        attachTo: {
          element: ".lm-Widget.lm-Panel.lm-SplitPanel.lm-BoxPanel-child",
          on: 'bottom'
        },
        buttons: [
          {
            action: tour.next,
            text: 'Next'
          }
        ],
      },
      {
        id: 'running-xircuits-1',
        title: 'Running a Xircuits Workflow',
        text: ["And you're done! To run a Xircuits workflow, press the 'Run and Compile Xircuits' button on the toolbar."],
        attachTo: {
          element: 'button[title="Compile and Run Xircuits"]',
          on: 'bottom'
        },
        show: function() {
          const element = document.querySelector('button[title="Compile and Run Xircuits"]');
          if (element) {
            element.addEventListener('click', function() {
              tour.next();
            }, { once: true });
          }
        },
        buttons: [
          {
            action: tour.next,
            text: 'Next'
          }
        ],
      },
      {
        id: 'followup',
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
