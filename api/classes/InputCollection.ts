import { Definable } from "./Definable";
import { KeyboardButton } from "../types/KeyboardButton";
import { fireAlert } from "../functions/fireAlert";
import { getToken } from "../functions/getToken";
import { state } from "../state";

export interface CreateInputCollectionOptionsKeyboardButton {
  numlock?: boolean;
  value: string;
  withoutNumlock?: boolean;
}
export interface CreateInputCollectionOptions {
  /**
   * An array of numbers that correlate to inputs on a controller
   */
  gamepadButtons?: number[];
  /**
   * An array of strings that represents different inputs on a keyboard
   */
  keyboardButtons?: CreateInputCollectionOptionsKeyboardButton[];
  /**
   * An array of numbers that represents different inputs on a mouse
   */
  mouseButtons?: number[];
  name: string;
}
export class InputCollection extends Definable {
  private readonly _buttonsAddElement: HTMLButtonElement;
  private readonly _buttonsClearElement: HTMLButtonElement;
  private readonly _buttonsResetElement: HTMLButtonElement;
  private readonly _defaultGamepadButtons: number[];
  private readonly _defaultKeyboardButtons: KeyboardButton[];
  private readonly _defaultMouseButtons: number[];
  private _gamepadButtons: number[];
  private _keyboardButtons: KeyboardButton[];
  private _mouseButtons: number[];
  private readonly _valuesEmptyElement: HTMLSpanElement;
  private readonly _valuesGamepadElement: HTMLSpanElement;
  private readonly _valuesKeyboardElement: HTMLSpanElement;
  private readonly _valuesMouseElement: HTMLSpanElement;
  public constructor(options: CreateInputCollectionOptions) {
    super(getToken());
    if (state.values.isInitialized) {
      throw new Error(
        `Attempted to create InputCollection "${this._id}" after initialization.`,
      );
    }
    const controlsGridElement: HTMLElement | null =
      document.getElementById("controls-grid");
    if (controlsGridElement === null) {
      throw new Error(
        `An attempt was made to add InputCollection "${this._id}" to the pause menu with no controls grid element in the DOM.`,
      );
    }
    const gamepadButtons: number[] = options.gamepadButtons ?? [];
    this._defaultGamepadButtons = [...gamepadButtons];
    this._gamepadButtons = [...gamepadButtons];
    const keyboardButtons: KeyboardButton[] = (
      options.keyboardButtons ?? []
    ).map(
      (
        keyboardButton: CreateInputCollectionOptionsKeyboardButton,
      ): KeyboardButton => ({
        numlock: keyboardButton.numlock ?? false,
        value: keyboardButton.value,
        withoutNumlock: keyboardButton.withoutNumlock ?? false,
      }),
    );
    this._defaultKeyboardButtons = [...keyboardButtons];
    this._keyboardButtons = [...keyboardButtons];
    const mouseButtons: number[] = options.mouseButtons ?? [];
    this._defaultMouseButtons = [...mouseButtons];
    this._mouseButtons = [...mouseButtons];
    // Info
    const infoElement: HTMLDivElement = document.createElement("div");
    infoElement.classList.add("controls-info");
    // Name section
    const nameSectionElement: HTMLDivElement = document.createElement("div");
    infoElement.appendChild(nameSectionElement);
    const nameTextElement: HTMLSpanElement = document.createElement("span");
    nameTextElement.innerText = options.name;
    nameSectionElement.appendChild(nameTextElement);
    // Values section
    const valuesSectionElement: HTMLDivElement = document.createElement("div");
    infoElement.appendChild(valuesSectionElement);
    this._valuesEmptyElement = document.createElement("span");
    this._valuesEmptyElement.classList.add("controls-info-values-empty");
    this._valuesEmptyElement.innerText = "No inputs set";
    this._valuesMouseElement = document.createElement("span");
    this._valuesGamepadElement = document.createElement("span");
    this._valuesKeyboardElement = document.createElement("span");
    valuesSectionElement.appendChild(this._valuesEmptyElement);
    valuesSectionElement.appendChild(this._valuesMouseElement);
    valuesSectionElement.appendChild(this._valuesGamepadElement);
    valuesSectionElement.appendChild(this._valuesKeyboardElement);
    // Buttons section
    const buttonsSectionElement: HTMLDivElement = document.createElement("div");
    this._buttonsAddElement = document.createElement("button");
    this._buttonsAddElement.innerText = "Add input";
    this._buttonsAddElement.addEventListener("click", (): void => {
      const bodyElement: HTMLElement | null = document.createElement("div");
      fireAlert({
        bodyElement,
        showCancelButton: true,
        showConfirmButton: true,
        title: "Add input",
      });
    });
    this._buttonsClearElement = document.createElement("button");
    this._buttonsClearElement.innerText = "Clear inputs";
    this._buttonsClearElement.addEventListener("click", (): void => {
      this.clear();
      this.updateValuesElements();
    });
    this._buttonsResetElement = document.createElement("button");
    this._buttonsResetElement.innerText = "Reset to defaults";
    this._buttonsResetElement.addEventListener("click", (): void => {
      this.resetToDefault();
    });
    buttonsSectionElement.appendChild(this._buttonsAddElement);
    buttonsSectionElement.appendChild(this._buttonsClearElement);
    buttonsSectionElement.appendChild(this._buttonsResetElement);
    infoElement.appendChild(buttonsSectionElement);
    controlsGridElement.appendChild(infoElement);
    this.updateValuesElements();
  }

  public get gamepadButtons(): number[] {
    return this._gamepadButtons;
  }

  public get keyboardButtons(): KeyboardButton[] {
    return this._keyboardButtons;
  }

  public get mouseButtons(): number[] {
    return this._mouseButtons;
  }

  public resetToDefault(): void {
    this._gamepadButtons = [...this._defaultGamepadButtons];
    this._keyboardButtons = [...this._defaultKeyboardButtons];
    this._mouseButtons = [...this._defaultMouseButtons];
    this.updateValuesElements();
  }

  private clear(): void {
    this._gamepadButtons.length = 0;
    this._keyboardButtons.length = 0;
    this._mouseButtons.length = 0;
  }

  private updateValuesElements(): void {
    this._valuesMouseElement.innerText = `Mouse: ${this._mouseButtons.join(
      ", ",
    )}`;
    if (this._mouseButtons.length === 0) {
      this._valuesMouseElement.style.display = "none";
    } else {
      this._valuesMouseElement.style.display = "block";
    }
    this._valuesGamepadElement.innerText = `Gamepad: ${this._gamepadButtons.join(
      ", ",
    )}`;
    if (this._gamepadButtons.length === 0) {
      this._valuesGamepadElement.style.display = "none";
    } else {
      this._valuesGamepadElement.style.display = "block";
    }
    this._valuesKeyboardElement.innerText = `Keyboard: ${this._keyboardButtons
      .map(
        (keyboardButton: KeyboardButton): string =>
          `${keyboardButton.value}${
            keyboardButton.numlock ? " (NumLock)" : ""
          }${keyboardButton.withoutNumlock ? " (no NumLock)" : ""}`,
      )
      .join(", ")}`;
    if (this._keyboardButtons.length === 0) {
      this._valuesKeyboardElement.style.display = "none";
    } else {
      this._valuesKeyboardElement.style.display = "block";
    }
    const isEmpty: boolean =
      this._mouseButtons.length > 0 ||
      this._gamepadButtons.length > 0 ||
      this._keyboardButtons.length > 0;
    this._buttonsClearElement.style.display = isEmpty ? "block" : "none";
    this._valuesEmptyElement.style.display = !isEmpty ? "block" : "none";
  }
}
/**
 * @returns String that can be used to identify the Handler
 */
export const createInputCollection = (
  options: CreateInputCollectionOptions,
): string => new InputCollection(options).id;
