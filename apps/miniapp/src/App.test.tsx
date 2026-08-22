import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import * as api from "./lib/api";

vi.mock("./lib/api", () => ({
  submitDiagnostic: vi.fn().mockResolvedValue(undefined)
}));

type MockTelegramUser = {
  id: number;
  username?: string;
  first_name?: string;
};

type MockTelegramWebApp = {
  initData: string;
  themeParams?: Record<string, string>;
  safeAreaInset?: Record<string, number>;
  ready?: () => void;
  expand?: () => void;
  onEvent?: () => void;
  offEvent?: () => void;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: MockTelegramWebApp;
    };
  }
}

function setTelegramUser(user?: MockTelegramUser) {
  if (!user) {
    delete window.Telegram;
    return;
  }

  const initData = new URLSearchParams({
    user: JSON.stringify(user),
    auth_date: "1724112000",
    hash: "test-hash"
  }).toString();

  window.Telegram = {
    WebApp: {
      initData,
      ready: vi.fn(),
      expand: vi.fn(),
      onEvent: vi.fn(),
      offEvent: vi.fn()
    }
  };
}

async function fillBaseFlow(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByLabelText("Женщина"));
  await user.click(screen.getByRole("button", { name: "Продолжить" }));
  await user.click(screen.getByLabelText("25-34"));
  await user.click(screen.getByRole("button", { name: "Продолжить" }));
  await user.type(screen.getByPlaceholderText("Например, 170"), "170");
  await user.click(screen.getByRole("button", { name: "Продолжить" }));
  await user.type(screen.getByPlaceholderText("Например, 68"), "65");
  await user.click(screen.getByRole("button", { name: "Продолжить" }));
  await user.click(screen.getByLabelText("Снизить вес"));
  await user.click(screen.getByLabelText("Улучшить самочувствие и режим"));
  await user.click(screen.getByRole("button", { name: "Продолжить" }));
  await user.click(screen.getByLabelText("Нет, ограничений нет"));
  await user.click(screen.getByRole("button", { name: "Продолжить" }));
  await user.click(screen.getByLabelText("Только начинаю"));
  await user.click(screen.getByRole("button", { name: "Продолжить" }));
  await user.click(screen.getByLabelText("Нет, пока не слежу"));
  await user.click(screen.getByRole("button", { name: "Продолжить" }));
  await user.click(screen.getByLabelText("В целом хорошо"));
  await user.click(screen.getByRole("button", { name: "Продолжить" }));
  await user.click(screen.getByLabelText("Иногда"));
  await user.click(screen.getByRole("button", { name: "Продолжить" }));
  await user.click(screen.getByLabelText("7-8 часов"));
  await user.click(screen.getByRole("button", { name: "Продолжить" }));
  await user.click(screen.getByLabelText("Хочу начать сейчас"));
}

describe("App", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    delete window.Telegram;
    vi.clearAllMocks();
  });

  it("preserves selected goals when moving back", async () => {
    render(<App />);
    const user = userEvent.setup();

    await user.click(screen.getByLabelText("Женщина"));
    await user.click(screen.getByRole("button", { name: "Продолжить" }));
    await user.click(screen.getByLabelText("18-24"));
    await user.click(screen.getByRole("button", { name: "Продолжить" }));
    await user.type(screen.getByPlaceholderText("Например, 170"), "170");
    await user.click(screen.getByRole("button", { name: "Продолжить" }));
    await user.type(screen.getByPlaceholderText("Например, 68"), "65");
    await user.click(screen.getByRole("button", { name: "Продолжить" }));
    await user.click(screen.getByLabelText("Снизить вес"));
    await user.click(screen.getByLabelText("Улучшить самочувствие и режим"));
    await user.click(screen.getByRole("button", { name: "Продолжить" }));
    await user.click(screen.getByRole("button", { name: "Назад" }));

    expect(screen.getByLabelText("Снизить вес")).toBeChecked();
    expect(screen.getByLabelText("Улучшить самочувствие и режим")).toBeChecked();
  });

  it("requires at least one goal before moving forward", async () => {
    render(<App />);
    const user = userEvent.setup();

    await user.click(screen.getByLabelText("Женщина"));
    await user.click(screen.getByRole("button", { name: "Продолжить" }));
    await user.click(screen.getByLabelText("18-24"));
    await user.click(screen.getByRole("button", { name: "Продолжить" }));
    await user.type(screen.getByPlaceholderText("Например, 170"), "170");
    await user.click(screen.getByRole("button", { name: "Продолжить" }));
    await user.type(screen.getByPlaceholderText("Например, 68"), "65");
    await user.click(screen.getByRole("button", { name: "Продолжить" }));
    await user.click(screen.getByRole("button", { name: "Продолжить" }));

    expect(screen.getByText("Выбери хотя бы один вариант, чтобы продолжить")).toBeInTheDocument();
  });

  it("shows optional contact step and submits filled contact data", async () => {
    render(<App />);
    const user = userEvent.setup();

    await fillBaseFlow(user);
    await user.click(screen.getByRole("button", { name: "Продолжить" }));

    expect(
      screen.getByRole("heading", { name: "Контакты для связи" })
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText("Телефон"), "+7 999 123-45-67");
    await user.type(screen.getByLabelText("MAX: ник или ссылка"), "@kirill_max");
    await user.click(screen.getByRole("button", { name: "Отправить анкету" }));

    expect(api.submitDiagnostic).toHaveBeenCalledTimes(1);
    expect(api.submitDiagnostic).toHaveBeenCalledWith(
      expect.objectContaining({
        answers: expect.objectContaining({
          goal: ["weight-loss", "wellbeing"],
          contactPhone: "+7 999 123-45-67",
          contactMax: "@kirill_max"
        })
      })
    );
    expect(await screen.findByText("Анкета отправлена")).toBeInTheDocument();
  });

  it("shows contact step even when telegram username exists and allows empty submit", async () => {
    setTelegramUser({ id: 1, username: "kirill", first_name: "Кирилл" });
    render(<App />);
    const user = userEvent.setup();

    await fillBaseFlow(user);
    await user.click(screen.getByRole("button", { name: "Продолжить" }));

    expect(
      screen.getByRole("heading", { name: "Контакты для связи" })
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Отправить анкету" }));

    expect(api.submitDiagnostic).toHaveBeenCalledTimes(1);
    expect(api.submitDiagnostic).toHaveBeenCalledWith(
      expect.objectContaining({
        answers: expect.not.objectContaining({
          contactPhone: expect.anything(),
          contactMax: expect.anything()
        })
      })
    );
    expect(await screen.findByText("Анкета отправлена")).toBeInTheDocument();
  });
});
