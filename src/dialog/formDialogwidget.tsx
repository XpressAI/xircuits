import { ReactWidget, Dialog } from '@jupyterlab/apputils';
import { MessageLoop } from '@lumino/messaging';
import { Widget } from '@lumino/widgets';

export const formDialogWidget = (
  dialogComponent: JSX.Element
): Dialog.IBodyWidget<any> => {
  const widget = ReactWidget.create(dialogComponent) as Dialog.IBodyWidget<any>;

  // Immediately update the body even though it has not yet attached in
  // order to trigger a render of the DOM nodes from the React element.
  MessageLoop.sendMessage(widget, Widget.Msg.UpdateRequest);

  widget.getValue = (): any => {
      const form = widget.node.querySelector('form');
      let formValues: { [key: string]: any } = {};
      for (const element of Object.values(
        form?.elements ?? []
      ) as HTMLInputElement[]) {
        switch (element.name) {
          case 'messages':
            formValues = JSON.parse(element.value);
            break;
          case 'checkbox':
            formValues[element.name] = element.checked;
            break;
          default:
            formValues[element.name] = element.value;
            break;
        }
      }
      return formValues;
    };

    return widget;
};