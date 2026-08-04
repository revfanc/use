import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { h, nextTick } from "vue";
import useDialog, { createDialog } from "../useDialog";

describe("useDialog compatibility", () => {
  beforeEach(() => vi.useFakeTimers());

  afterEach(async () => {
    const dialog = useDialog();
    dialog.interceptors.before.clear();
    dialog.interceptors.after.clear();
    dialog.close(true);
    await nextTick();
    vi.runAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("keeps callback exposed on returned instances", async () => {
    const dialog = useDialog();

    dialog.open({ render: () => h("div", "content") });
    await nextTick();

    expect(dialog.getInstances()).toHaveLength(1);
    expect(dialog.getInstances()[0].callback).toBeTypeOf("function");
  });

  it("returns the established manual action and __options__", async () => {
    const dialog = useDialog();
    const resultPromise = dialog.open({
      render: () => h("div", "content"),
      position: "left",
      customValue: 42,
    });

    await nextTick();
    dialog.close();
    const result = await resultPromise;

    expect(result.action).toBe("manual");
    expect(result.__options__).toMatchObject({
      position: "left",
      customValue: 42,
    });
  });

  it("preserves interceptor ordering", async () => {
    const dialog = useDialog();
    const calls: string[] = [];

    dialog.interceptors.before.use((options) => {
      calls.push("before-1");
      return options;
    });
    dialog.interceptors.before.use((options) => {
      calls.push("before-2");
      return options;
    });
    dialog.interceptors.after.use((result) => {
      calls.push("after-1");
      return result;
    });
    dialog.interceptors.after.use((result) => {
      calls.push("after-2");
      return result;
    });

    const resultPromise = dialog.open({ render: () => h("div", "content") });
    for (let index = 0; index < 5; index++) await Promise.resolve();
    await nextTick();
    dialog.close();
    await resultPromise;

    expect(calls).toEqual(["before-2", "before-1", "after-1", "after-2"]);
    dialog.interceptors.before.clear();
    dialog.interceptors.after.clear();
  });

  it("removes its mount container when initial rendering fails", async () => {
    const dialog = useDialog();
    const childCount = document.body.childElementCount;
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    await expect(
      dialog.open({
        render() {
          throw new Error("render failed");
        },
      })
    ).rejects.toThrow("render failed");

    expect(document.body.childElementCount).toBe(childCount);
    expect(dialog.getInstances()).toHaveLength(0);
    warn.mockRestore();
  });

  it("offers isolated state through createDialog without changing useDialog", async () => {
    const first = createDialog({ position: "left" });
    const second = createDialog({ position: "right" });

    first.open({ render: () => h("div", { class: "first" }, "first") });
    second.open({ render: () => h("div", { class: "second" }, "second") });
    await nextTick();

    expect(first.getInstances()).toHaveLength(1);
    expect(second.getInstances()).toHaveLength(1);
    expect(document.querySelector(".first")?.parentElement?.className).toContain(
      "--left"
    );
    expect(
      document.querySelector(".second")?.parentElement?.className
    ).toContain("--right");

    first.close(true);
    second.close(true);
  });

  it("traps keyboard focus and restores the previous element when enabled", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "open";
    document.body.appendChild(trigger);
    trigger.focus();

    const dialog = createDialog();
    const resultPromise = dialog.open({
      initialFocus: ".second-action",
      ariaLabel: "Test dialog",
      render: () =>
        h("div", [
          h("button", { class: "first-action" }, "first"),
          h("button", { class: "second-action" }, "second"),
        ]),
    });

    await nextTick();
    await nextTick();

    const container = document.querySelector<HTMLElement>(
      '.revfanc-dialog-content[role="dialog"]'
    );
    const first = document.querySelector<HTMLElement>(".first-action")!;
    const second = document.querySelector<HTMLElement>(".second-action")!;

    expect(container?.getAttribute("aria-modal")).toBe("true");
    expect(container?.getAttribute("aria-label")).toBe("Test dialog");
    expect(document.activeElement).toBe(second);

    second.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      })
    );
    expect(document.activeElement).toBe(first);

    first.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      })
    );
    expect(document.activeElement).toBe(second);

    dialog.close();
    await resultPromise;
    await nextTick();
    expect(document.activeElement).toBe(trigger);

    trigger.remove();
  });
});
