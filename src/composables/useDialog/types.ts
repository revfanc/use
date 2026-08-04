import type {
  AppContext,
  ComponentPublicInstance,
  CSSProperties,
  VNode,
} from "vue";

/** A deliberately permissive default kept for backwards compatibility. */
export interface UseDialogRes {
  [key: string]: any;
}

export interface DialogSystemResult extends UseDialogRes {
  action: "manual" | "overlay";
}

export type DialogResult<TResult extends UseDialogRes = UseDialogRes> =
  | TResult
  | DialogSystemResult;

export interface UseDialogCallback<
  TResult extends UseDialogRes = UseDialogRes,
> {
  (res: DialogResult<TResult>): void;
}

export interface UseDialogRenderProps<
  TResult extends UseDialogRes = UseDialogRes,
  TAttrs extends Record<string, any> = Record<string, any>,
> {
  callback: UseDialogCallback<TResult>;
  attrs: TAttrs;
  [key: string]: any;
}

export interface UseDialogRenderFunction<
  TResult extends UseDialogRes = UseDialogRes,
  TAttrs extends Record<string, any> = Record<string, any>,
> {
  (props?: UseDialogRenderProps<TResult, TAttrs>): VNode;
}

export type UseDialogRender<
  TResult extends UseDialogRes = UseDialogRes,
  TAttrs extends Record<string, any> = Record<string, any>,
> = (props: UseDialogRenderProps<TResult, TAttrs>) => VNode;

export interface UseDialogBeforeClose<
  TResult extends UseDialogRes = UseDialogRes,
> {
  (
    close: UseDialogClose<TResult>,
    params: DialogResult<TResult>
  ): void | Promise<void>;
}

export type DialogInitialFocus =
  | string
  | HTMLElement
  | (() => HTMLElement | null);

export interface UseDialogClose<TResult extends UseDialogRes = UseDialogRes> {
  (res?: DialogResult<TResult>): void;
}

export interface UseDialogOptions<
  TResult extends UseDialogRes = UseDialogRes,
  TAttrs extends Record<string, any> = Record<string, any>,
> {
  render:
    | UseDialogRender<TResult, TAttrs>
    | object
    | undefined;
  position?: "center" | "top" | "bottom" | "left" | "right";
  zIndex?: number;
  closeOnClickOverlay?: boolean;
  overlayStyle?: CSSProperties;
  beforeClose?: UseDialogBeforeClose<TResult>;
  /** Trap keyboard focus inside the dialog. Enabled by default. */
  trapFocus?: boolean;
  /** Restore focus to the previously active element after closing. */
  restoreFocus?: boolean;
  /** Element, selector within the dialog, or resolver used for initial focus. */
  initialFocus?: DialogInitialFocus;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  [key: string]: any;
}

export type UseDialogOpenOptions<
  TResult extends UseDialogRes = UseDialogRes,
  TAttrs extends Record<string, any> = Record<string, any>,
> = UseDialogOptions<TResult, TAttrs> & TAttrs;

export type DialogResolvedResult<
  TResult extends UseDialogRes = UseDialogRes,
  TOptions extends UseDialogOptions<any, any> = UseDialogOptions<TResult>,
> = DialogResult<TResult> & {
  __options__: Omit<TOptions, "render">;
};

export type DialogWrapperInstance<
  TResult extends UseDialogRes = UseDialogRes,
> = ComponentPublicInstance & {
  callback: UseDialogCallback<TResult>;
};

export interface DialogInterceptorManager<T> {
  use(
    resolved: (value: T) => T | Promise<T>,
    rejected?: (error: any) => any
  ): number;
  eject(id: number): void;
  clear(): void;
}

export interface DialogInterceptors<
  TOptions extends UseDialogOptions<any, any> = UseDialogOptions,
  TResult extends UseDialogRes = UseDialogRes,
> {
  before: DialogInterceptorManager<TOptions>;
  after: DialogInterceptorManager<DialogResult<TResult>>;
}

export interface UseDialogController<
  TDefaultResult extends UseDialogRes = UseDialogRes,
  TDefaultAttrs extends Record<string, any> = Record<string, any>,
> {
  open<
    TResult extends UseDialogRes = TDefaultResult,
    TAttrs extends Record<string, any> = TDefaultAttrs,
    TOptions extends UseDialogOpenOptions<TResult, TAttrs> = UseDialogOpenOptions<
      TResult,
      TAttrs
    >,
  >(
    options: TOptions,
    appContext?: AppContext
  ): Promise<DialogResolvedResult<TResult, TOptions>>;
  close(all?: boolean): void;
  getInstances(): DialogWrapperInstance[];
  setOptions(
    options: Partial<UseDialogOpenOptions<TDefaultResult, TDefaultAttrs>>
  ): void;
  interceptors: DialogInterceptors<
    UseDialogOpenOptions<TDefaultResult, TDefaultAttrs>,
    TDefaultResult
  >;
}
