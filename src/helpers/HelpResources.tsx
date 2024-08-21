import { JupyterFrontEnd } from '@jupyterlab/application';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { ITranslator } from '@jupyterlab/translation';
import { xircuitsIcon } from '../ui-components/icons';
import { commandIDs } from '../commands/CommandIDs';

interface HelpResource {
  text: string;
  url: string;
}

export function addHelpResources(
  app: JupyterFrontEnd,
  mainMenu: IMainMenu,
  translator: ITranslator
): void {
  const { commands } = app;
  const trans = translator.load('xircuits');

  const resources: HelpResource[] = [
    {
      text: trans.__('Xircuits Documentation'),
      url: 'https://xircuits.io/docs/main/'
    },
    {
      text: trans.__('Tutorials'),
      url: 'https://xircuits.io/docs/category/tutorials'
    },
    {
      text: trans.__('How-Tos'),
      url: 'https://xircuits.io/docs/category/how-tos'
    },
  ];

  const xircuitsHelpGroup = [];

  resources.forEach((resource, index) => {
    const commandId = `${commandIDs.helpOpenResource}:${index}`;
    commands.addCommand(commandId, {
      label: resource.text,
      icon: xircuitsIcon,
      execute: () => {
        window.open(resource.url);
      }
    });

    xircuitsHelpGroup.push({ command: commandId });
  });

  // Add the Xircuits help group to the beginning of the Help menu
  mainMenu.helpMenu.addGroup(xircuitsHelpGroup, -1);
}