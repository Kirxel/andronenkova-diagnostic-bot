type TelegramThemeParams = {
  bg_color?: string;
  secondary_bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  accent_text_color?: string;
  destructive_text_color?: string;
};

type TelegramSafeAreaInset = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

type TelegramWebApp = {
  initData?: string;
  themeParams?: TelegramThemeParams;
  safeAreaInset?: TelegramSafeAreaInset;
  ready?: () => void;
  expand?: () => void;
  onEvent?: (event: string, callback: () => void) => void;
  offEvent?: (event: string, callback: () => void) => void;
};

type TelegramWindow = Window & {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
};

export type TelegramContext = {
  isAvailable: boolean;
  initData: string;
  startParam: string | null;
  theme: TelegramThemeParams;
  safeArea: Required<TelegramSafeAreaInset>;
};

const defaultSafeArea = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0
};

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (window as TelegramWindow).Telegram?.WebApp ?? null;
}

export function readTelegramContext(): TelegramContext {
  const webApp = getTelegramWebApp();
  const params = new URLSearchParams(window.location.search);

  return {
    isAvailable: Boolean(webApp),
    initData: webApp?.initData ?? "",
    startParam: params.get("tgWebAppStartParam"),
    theme: webApp?.themeParams ?? {},
    safeArea: {
      top: webApp?.safeAreaInset?.top ?? 0,
      bottom: webApp?.safeAreaInset?.bottom ?? 0,
      left: webApp?.safeAreaInset?.left ?? 0,
      right: webApp?.safeAreaInset?.right ?? 0
    }
  };
}

export function initializeTelegramApp(sync: () => void): () => void {
  const webApp = getTelegramWebApp();
  if (!webApp) {
    sync();
    return () => undefined;
  }

  webApp.ready?.();
  webApp.expand?.();
  sync();

  const handleThemeChange = () => sync();
  const handleSafeAreaChange = () => sync();

  webApp.onEvent?.("themeChanged", handleThemeChange);
  webApp.onEvent?.("safeAreaChanged", handleSafeAreaChange);

  return () => {
    webApp.offEvent?.("themeChanged", handleThemeChange);
    webApp.offEvent?.("safeAreaChanged", handleSafeAreaChange);
  };
}

export function applyTelegramTheme(context: TelegramContext): void {
  const root = document.documentElement;
  const { theme, safeArea } = context;

  if (theme.bg_color) {
    root.style.setProperty("--tg-bg-color", theme.bg_color);
  }
  if (theme.secondary_bg_color) {
    root.style.setProperty("--tg-surface-color", theme.secondary_bg_color);
  }
  if (theme.text_color) {
    root.style.setProperty("--tg-text-color", theme.text_color);
  }
  if (theme.hint_color) {
    root.style.setProperty("--tg-muted-color", theme.hint_color);
  }
  if (theme.button_color) {
    root.style.setProperty("--tg-accent-color", theme.button_color);
  }
  if (theme.button_text_color) {
    root.style.setProperty("--tg-accent-contrast", theme.button_text_color);
  }
  if (theme.link_color) {
    root.style.setProperty("--tg-link-color", theme.link_color);
  }
  if (theme.accent_text_color) {
    root.style.setProperty("--tg-highlight-color", theme.accent_text_color);
  }
  if (theme.destructive_text_color) {
    root.style.setProperty("--tg-error-color", theme.destructive_text_color);
  }

  root.style.setProperty("--safe-area-top", `${safeArea.top}px`);
  root.style.setProperty("--safe-area-bottom", `${safeArea.bottom}px`);
  root.style.setProperty("--safe-area-left", `${safeArea.left}px`);
  root.style.setProperty("--safe-area-right", `${safeArea.right}px`);
}

