import { CSSProperties, VNode, ComponentPublicInstance } from "vue";

export type DialogWrapperInstance = ComponentPublicInstance<
  {
    close: () => void;
    open: (props: Record<string, any>) => void;
  }
>;

export interface UseDialogOpenOptions {
  show?: boolean;
  render?: (() => VNode) | null;
  position?: "center" | "top" | "bottom" | "left" | "right";
  closeOnClickOverlay?: boolean;
  overlayStyle?: CSSProperties | null;
  zIndex?: number;
  beforeClose?:
    | ((
        close: (params: UseDialogOpenRes) => void,
        params: UseDialogOpenRes
      ) => void)
    | null;
  onAction?: (params: UseDialogOpenRes) => void;
}

export interface UseDialogOpenRes {
  action: string;
  data?: any;
  options?: UseDialogOpenOptions;
}
