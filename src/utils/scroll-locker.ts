// 常量
const DIRECTION_UP = "01";
const DIRECTION_DOWN = "10";
const LOCK_CLASS_NAME = "revfanc-scroll-locker";

// 工具函数
const preventDefault = (
  event: TouchEvent,
  isStopPropagation: boolean
): void => {
  if (typeof event.cancelable !== "boolean" || event.cancelable) {
    event.preventDefault();
  }
  if (isStopPropagation) {
    event.stopPropagation();
  }
};

const getScrollParent = (
  el: HTMLElement,
  root: Window | HTMLElement = window
): HTMLElement | Window => {
  let node: HTMLElement | null = el;

  while (
    node &&
    node.tagName !== "HTML" &&
    node.tagName !== "BODY" &&
    node.nodeType === 1 &&
    node !== root
  ) {
    const { overflowY } = window.getComputedStyle(node);
    if (/scroll|auto|overlay/i.test(overflowY)) {
      return node;
    }
    node = node.parentNode as HTMLElement;
  }

  return root;
};

interface ScrollLocker {
  lock: (root: HTMLElement) => void;
  unlock: (el: HTMLElement) => void;
}

// 创建滚动锁定器
const createScrollLocker = (): ScrollLocker => {
  const rootElements: HTMLElement[] = [];
  let lockCount = 0;
  let startY = 0;
  let deltaY = 0;
  let direction = "";

  const resetTouchStatus = (): void => {
    direction = "";
    deltaY = 0;
    startY = 0;
  };

  const touchStart = (event: TouchEvent): void => {
    resetTouchStatus();
    startY = event.touches[0].clientY;
  };

  const touchMove = (event: TouchEvent): void => {
    const touch = event.touches[0];
    deltaY = touch.clientY - startY;

    if (!direction) {
      direction = Math.abs(deltaY) > 0 ? "vertical" : "";
    }
  };

  const isVertical = (): boolean => direction === "vertical";

  const onTouchMove = (event: TouchEvent): void => {
    touchMove(event);

    const moveDirection = deltaY > 0 ? DIRECTION_DOWN : DIRECTION_UP;
    const el = getScrollParent(
      event.target as HTMLElement,
      rootElements[rootElements.length - 1]
    ) as HTMLElement;

    const { scrollHeight, offsetHeight, scrollTop } = el;

    let status = "11";

    if (scrollTop === 0) {
      status = offsetHeight >= scrollHeight ? "00" : "01";
    } else if (scrollTop + offsetHeight >= scrollHeight) {
      status = "10";
    }

    if (
      status !== "11" &&
      isVertical() &&
      !(parseInt(status, 2) & parseInt(moveDirection, 2))
    ) {
      preventDefault(event, true);
    }
  };

  const lock = (root: HTMLElement): void => {
    rootElements.push(root);
    document.addEventListener("touchstart", touchStart);
    document.addEventListener("touchmove", onTouchMove, { passive: false });

    if (!lockCount) {
      document.body.classList.add(LOCK_CLASS_NAME);
    }

    lockCount++;
  };

  const unlock = (): void => {
    if (lockCount) {
      rootElements.pop();
      lockCount--;

      if (!lockCount) {
        document.removeEventListener("touchstart", touchStart);
        document.removeEventListener("touchmove", onTouchMove);

        document.body.classList.remove(LOCK_CLASS_NAME);
      }
    }
  };

  return {
    lock,
    unlock,
  };
};

// 导出单例
export const scrollLocker = createScrollLocker();
