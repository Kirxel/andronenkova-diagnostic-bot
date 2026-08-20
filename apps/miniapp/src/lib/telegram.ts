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

type TelegramThemeMode = "light" | "dark";

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
  themeMode: TelegramThemeMode;
  safeArea: Required<TelegramSafeAreaInset>;
};

const defaultSafeArea = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0
};

const TELEGRAM_SCRIPT_SRC = "https://telegram.org/js/telegram-web-app.js?63";

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (window as TelegramWindow).Telegram?.WebApp ?? null;
}

export async function ensureTelegramWebApp(timeoutMs = 2500): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  if (getTelegramWebApp()) {
    return;
  }

  const existingScript = document.querySelector<HTMLScriptElement>(
    `script[src="${TELEGRAM_SCRIPT_SRC}"]`
  );

  if (existingScript) {
    await waitForTelegramWebApp(timeoutMs);
    return;
  }

  const script = document.createElement("script");
  script.src = TELEGRAM_SCRIPT_SRC;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);

  await waitForTelegramWebApp(timeoutMs);
}

function waitForTelegramWebApp(timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    if (getTelegramWebApp()) {
      resolve();
      return;
    }

    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      if (getTelegramWebApp()) {
        window.clearInterval(interval);
        resolve();
        return;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        window.clearInterval(interval);
        resolve();
      }
    }, 100);
  });
}

export function readTelegramContext(): TelegramContext {
  const webApp = getTelegramWebApp();
  const params = new URLSearchParams(window.location.search);
  const theme = webApp?.themeParams ?? {};

  return {
    isAvailable: Boolean(webApp),
    initData: webApp?.initData ?? "",
    startParam: params.get("tgWebAppStartParam"),
    theme,
    themeMode: resolveThemeMode(theme),
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
  const { theme, themeMode, safeArea } = context;

  root.dataset.telegramTheme = themeMode;

  setThemeVariable(root, "--app-accent-color", theme.button_color);
  setThemeVariable(root, "--app-accent-contrast", theme.button_text_color);
  setThemeVariable(root, "--app-link-color", theme.link_color);
  setThemeVariable(root, "--app-highlight-color", theme.accent_text_color);
  setThemeVariable(root, "--app-error-color", theme.destructive_text_color);

  root.style.setProperty("--safe-area-top", `${safeArea.top}px`);
  root.style.setProperty("--safe-area-bottom", `${safeArea.bottom}px`);
  root.style.setProperty("--safe-area-left", `${safeArea.left}px`);
  root.style.setProperty("--safe-area-right", `${safeArea.right}px`);
}

function setThemeVariable(root: HTMLElement, variableName: string, value: string | undefined) {
  if (value) {
    root.style.setProperty(variableName, value);
    return;
  }

  root.style.removeProperty(variableName);
}

function resolveThemeMode(theme: TelegramThemeParams): TelegramThemeMode {
  const bgColor = theme.bg_color ?? theme.secondary_bg_color;
  const parsed = bgColor ? parseRgbColor(bgColor) : null;

  if (!parsed) {
    return "light";
  }

  return getRelativeLuminance(parsed) < 0.5 ? "dark" : "light";
}

function parseRgbColor(input: string): [number, number, number] | null {
  const normalized = input.trim().toLowerCase();

  if (/^#([0-9a-f]{3}){1,2}$/.test(normalized)) {
    const hex = normalized.slice(1);
    const expanded = hex.length === 3
      ? hex
          .split("")
          .map((char) => char + char)
          .join("")
      : hex;

    return [
      Number.parseInt(expanded.slice(0, 2), 16),
      Number.parseInt(expanded.slice(2, 4), 16),
      Number.parseInt(expanded.slice(4, 6), 16)
    ];
  }

  const rgbMatch = normalized.match(
    /^rgba?\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})(?:\s*,\s*[\d.]+\s*)?\)$/
  );

  if (!rgbMatch) {
    return null;
  }

  return [
    Number.parseInt(rgbMatch[1], 10),
    Number.parseInt(rgbMatch[2], 10),
    Number.parseInt(rgbMatch[3], 10)
  ];
}

function getRelativeLuminance([red, green, blue]: [number, number, number]): number {
  const channels = [red, green, blue].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}
