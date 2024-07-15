import { Dialog } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';

/*
 * Validate required dialog fields upon display
 * - Provides a generic validation by checking if required form fields are populated
 * - Expect required fields in dialog body to contain attribute: data-form-required
 *
 * @params
 *
 * options - The dialog setup options
 * formValidationFunction - Optional custom validation function
 *
 * returns a call to dialog display
 */
export const showFormDialog = async (
  options: Partial<Dialog.IOptions<any>>,
  formValidationFunction?: (dialog: Dialog<any>) => void
): Promise<Dialog.IResult<any>> => {
  const dialogBody = options.body;
  const dialog = new Dialog(options);

  // Get dialog default action button
  const defaultButton = getDefaultButton(options, dialog.node);

  if (formValidationFunction) {
    formValidationFunction(dialog);
  } else {
    if (dialogBody instanceof Widget) {
      const fieldsToBeValidated = new Set();
      const validateDialogButton = (): void =>
        isFormValid(fieldsToBeValidated)
          ? enableButton(defaultButton)
          : disableButton(defaultButton);

      // Get elements that require validation and add event listeners
      dialogBody.node
        .querySelectorAll('select, input, textarea')
        .forEach((element: any) => {
          if (
            element.hasAttribute('data-form-required') ||
            element.type === 'number'
          ) {
            const elementTagName = element.tagName.toLowerCase();

            if (elementTagName === 'select' || element.type === 'number') {
              element.addEventListener('change', (event: Event) =>
                validateDialogButton()
              );
            }
            if (['input', 'textarea'].includes(elementTagName)) {
              element.addEventListener('keyup', (event: Event) =>
                validateDialogButton()
              );
            }

            fieldsToBeValidated.add(element);
          }
        });

      preventDefaultDialogHandler(
        () => isFormValid(fieldsToBeValidated),
        dialog
      );
      validateDialogButton();
    }
  }
  return dialog.launch();
};

export const disableButton = (button: HTMLButtonElement): void => {
  button.setAttribute('disabled', 'disabled');
};

export const enableButton = (button: HTMLButtonElement): void => {
  button.removeAttribute('disabled');
};

const getDefaultButton = (
  options: Partial<Dialog.IOptions<any>>,
  node: HTMLElement
): HTMLButtonElement => {
  const defaultButtonIndex =
    options.defaultButton ?? (options.buttons?.length ?? 0) - 1;
  return node
    .querySelector('.jp-Dialog-footer')
    ?.getElementsByTagName('button')[defaultButtonIndex]!;
};

// Prevent user from bypassing validation upon pressing the 'Enter' key
const preventDefaultDialogHandler = (
  isFormValidFn: () => boolean,
  dialog: Dialog<any>
): void => {
  const dialogHandleEvent = dialog.handleEvent;
  // Get dialog default action button
  const defaultButton = dialog.node.querySelector('.jp-Dialog-footer')?.getElementsByTagName('button')[1];
  dialog.handleEvent = async (event: Event): Promise<void> => {
    if (
      event instanceof KeyboardEvent &&
      event.type === 'keydown' &&
      event.key === 'Enter'
    ) {
      // Prevent action when form dialog is not valid
      if (!isFormValidFn()) {
        event.stopPropagation();
        event.preventDefault();
      }
      // When 'Enter' key is pressed while on input dialog and the input isn't Literal Chat or the attached checkbox, force focus to submit button
      const dialogInput = dialog.node.getElementsByTagName('input')[0];
      if (dialogInput && !['messages', 'attachNode'].includes(dialogInput.name)) {
        await defaultButton.focus();
      }
    } else {
      dialogHandleEvent.call(dialog, event);
    }
  };
};

// Returns true if given element is valid
const isFieldValid = (element: any): boolean => {
  if (element.type === 'number') {
    // Allow any number or an empty string for number inputs
    return element.value === '' || !isNaN(Number(element.value.trim()))
      ? true
      : false;
  }
  // For other input types, continue to check whether the input is not an empty string
  return element.value.trim() ? true : false;
};

// Returns true if form dialog has all fields validated
const isFormValid = (fieldToBeValidated: Set<any>): boolean => {
  for (const field of fieldToBeValidated.values()) {
    if (!isFieldValid(field)) {
      return false;
    }
  }
  return true;
};