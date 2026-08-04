import { describe, expectTypeOf, it } from "vitest";
import type { VNode } from "vue";
import useDialog from "../useDialog";
import type {
  DialogResult,
  UseDialogCallback,
  UseDialogOptions,
  UseDialogOpenOptions,
  UseDialogRenderProps,
} from "../useDialog/types";

interface ConfirmResult {
  action: "confirm";
  userId: number;
}

interface DialogAttrs {
  params: {
    name: string;
  };
}

describe("useDialog public types", () => {
  it("supports a controller-wide result and attrs type", () => {
    const dialog = useDialog<ConfirmResult, DialogAttrs>();

    expectTypeOf(dialog.open).toBeFunction();
    expectTypeOf(dialog.close).parameters.toEqualTypeOf<[all?: boolean]>();
    expectTypeOf(dialog.getInstances()).items.toHaveProperty("callback");
    expectTypeOf(dialog.interceptors.after.use)
      .parameter(0)
      .parameter(0)
      .toEqualTypeOf<DialogResult<ConfirmResult>>();
  });

  it("connects callback, beforeClose and result types", () => {
    expectTypeOf<UseDialogCallback<ConfirmResult>>()
      .parameter(0)
      .toEqualTypeOf<DialogResult<ConfirmResult>>();

    expectTypeOf<
      NonNullable<UseDialogOptions<ConfirmResult>["beforeClose"]>
    >()
      .parameter(1)
      .toEqualTypeOf<DialogResult<ConfirmResult>>();
  });

  it("provides typed custom attrs to render functions", () => {
    type Props = UseDialogRenderProps<ConfirmResult, DialogAttrs>;
    const options: UseDialogOptions<ConfirmResult, DialogAttrs> = {
      params: { name: "dialog" },
      render(props) {
        expectTypeOf(props.attrs.params.name).toEqualTypeOf<string>();
        props.callback({ action: "confirm", userId: 1 });
        // @ts-expect-error confirm results require userId
        props.callback({ action: "confirm" });
        return {} as VNode;
      },
    };

    expectTypeOf<Props["attrs"]>().toEqualTypeOf<DialogAttrs>();
    expectTypeOf<Props["callback"]>().toEqualTypeOf<
      UseDialogCallback<ConfirmResult>
    >();
    expectTypeOf<UseDialogOptions<ConfirmResult, DialogAttrs>["render"]>()
      .extract<(...args: any[]) => VNode>()
      .toBeFunction();
    expectTypeOf(options).toMatchTypeOf<
      UseDialogOptions<ConfirmResult, DialogAttrs>
    >();
    expectTypeOf<UseDialogOpenOptions<ConfirmResult, DialogAttrs>>()
      .toHaveProperty("params")
      .toEqualTypeOf<DialogAttrs["params"]>();
  });
});
