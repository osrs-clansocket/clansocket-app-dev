export type ClickHandler = (e: MouseEvent) => void | Promise<void>;
export type SubmitHandler = (e: SubmitEvent) => void | Promise<void>;
export type InputHandler = (e: Event) => void;
export type ChangeHandler = (e: Event) => void;
export type KeyHandler = (e: KeyboardEvent) => void;
export type FocusHandler = (e: FocusEvent) => void;
export type PointerHandler = (e: PointerEvent) => void;

export interface HandlerDescriptor<T> {
    handler: T;
    capture?: boolean;
    once?: boolean;
    passive?: boolean;
    raw?: boolean;
}

export type ClickProp = ClickHandler | HandlerDescriptor<ClickHandler>;
export type SubmitProp = SubmitHandler | HandlerDescriptor<SubmitHandler>;
export type InputProp = InputHandler | HandlerDescriptor<InputHandler>;
export type ChangeProp = ChangeHandler | HandlerDescriptor<ChangeHandler>;
export type KeyProp = KeyHandler | HandlerDescriptor<KeyHandler>;
export type FocusProp = FocusHandler | HandlerDescriptor<FocusHandler>;
export type PointerProp = PointerHandler | HandlerDescriptor<PointerHandler>;
