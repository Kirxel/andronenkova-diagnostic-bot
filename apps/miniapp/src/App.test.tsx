import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import * as api from "./lib/api";

vi.mock("./lib/api", () => ({
  submitDiagnostic: vi.fn().mockResolvedValue(undefined)
}));

describe("App", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("preserves answers when moving back", async () => {
    render(<App />);
    const user = userEvent.setup();

    await user.click(screen.getByLabelText("Женщина"));
    await user.click(screen.getByRole("button", { name: "Продолжить" }));
    await user.click(screen.getByRole("button", { name: "Назад" }));

    expect(screen.getByLabelText("Женщина")).toBeChecked();
  });

  it("requires details for custom option and shows success after submit", async () => {
    render(<App />);
    const user = userEvent.setup();

    await user.click(screen.getByLabelText("Женщина"));
    await user.click(screen.getByRole("button", { name: "Продолжить" }));
    await user.click(screen.getByLabelText("25-34"));
    await user.click(screen.getByRole("button", { name: "Продолжить" }));
    await user.type(screen.getByPlaceholderText("Например, 68"), "65");
    await user.click(screen.getByRole("button", { name: "Продолжить" }));
    await user.click(screen.getByLabelText("Свой вариант"));
    await user.click(screen.getByRole("button", { name: "Продолжить" }));

    expect(
      screen.getByText("Добавь пару слов, чтобы Дарья увидела контекст")
    ).toBeInTheDocument();

    await user.type(
      screen.getByLabelText("Расскажи о своей цели"),
      "Хочу вернуть регулярность и хорошее самочувствие"
    );
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
    await user.click(screen.getByRole("button", { name: "Отправить анкету" }));

    expect(api.submitDiagnostic).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("Анкета отправлена")).toBeInTheDocument();
  });
});
