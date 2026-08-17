import type { Question } from "./types";

export const questions: Question[] = [
  {
    id: "sex",
    kind: "choice",
    title: "С кем Дарья сегодня работает?",
    description: "Это нужно только для корректного контекста рекомендаций по нагрузке.",
    options: [
      { value: "female", label: "Женщина" },
      { value: "male", label: "Мужчина" }
    ]
  },
  {
    id: "ageRange",
    kind: "choice",
    title: "Какой у тебя возрастной диапазон?",
    options: [
      { value: "under-16", label: "До 16 лет" },
      { value: "18-24", label: "18-24" },
      { value: "25-34", label: "25-34" },
      { value: "35-44", label: "35-44" },
      { value: "45+", label: "45+" }
    ]
  },
  {
    id: "heightCm",
    kind: "number",
    title: "Укажи текущий рост",
    description: "Это нужно только для более точного понимания исходных данных.",
    min: 100,
    max: 250,
    placeholder: "Например, 170",
    unit: "см"
  },
  {
    id: "weightKg",
    kind: "number",
    title: "Укажи текущий вес",
    description: "Без оценок и выводов. Просто стартовая точка для понимания запроса.",
    min: 30,
    max: 300,
    placeholder: "Например, 68",
    unit: "кг"
  },
  {
    id: "goal",
    kind: "choice",
    title: "Какая цель сейчас главная?",
    options: [
      { value: "weight-loss", label: "Снизить вес" },
      { value: "muscle-tone", label: "Подтянуть тело и стать сильнее" },
      { value: "recovery", label: "Вернуться к тренировкам после паузы" },
      { value: "wellbeing", label: "Улучшить самочувствие и режим" },
      {
        value: "other",
        label: "Свой вариант",
        detailLabel: "Расскажи о своей цели",
        detailPlaceholder: "Например: подготовиться к отпуску или убрать боли в спине",
        detailRequired: true
      }
    ]
  },
  {
    id: "injuries",
    kind: "choice",
    title: "Есть ли травмы или ограничения, которые важно учесть?",
    options: [
      { value: "none", label: "Нет, ограничений нет" },
      {
        value: "has-limitations",
        label: "Да, есть ограничения",
        detailLabel: "Что именно важно учитывать?",
        detailPlaceholder: "Например: колено, поясница, запрет на осевую нагрузку",
        detailRequired: true
      },
      {
        value: "other",
        label: "Свой вариант",
        detailLabel: "Опиши в свободной форме",
        detailPlaceholder: "Что важно знать Дарье перед стартом?",
        detailRequired: true
      }
    ]
  },
  {
    id: "experience",
    kind: "choice",
    title: "Какой у тебя опыт тренировок?",
    options: [
      { value: "new", label: "Только начинаю" },
      { value: "returning", label: "Раньше тренировался(ась), сейчас возвращаюсь" },
      { value: "regular", label: "Тренируюсь регулярно" }
    ]
  },
  {
    id: "nutrition",
    kind: "choice",
    title: "Следишь ли ты за питанием и КБЖУ?",
    options: [
      { value: "no", label: "Нет, пока не слежу" },
      { value: "sometimes", label: "Иногда слежу" },
      { value: "yes", label: "Да, отслеживаю стабильно" }
    ]
  },
  {
    id: "wellbeing",
    kind: "choice",
    title: "Как сейчас в целом ощущается твое состояние?",
    options: [
      { value: "great", label: "В целом хорошо" },
      { value: "tired", label: "Часто не хватает энергии" },
      { value: "stressed", label: "Есть стресс и перегруз" },
      {
        value: "other",
        label: "Свой вариант",
        detailLabel: "Опиши, как ты себя чувствуешь",
        detailPlaceholder: "Пара слов о текущем состоянии",
        detailRequired: true
      }
    ]
  },
  {
    id: "labTests",
    kind: "choice",
    title: "Сдаешь ли ты анализы и проверяешь показатели здоровья?",
    options: [
      { value: "regularly", label: "Да, проверяюсь регулярно" },
      { value: "sometimes", label: "Иногда" },
      { value: "never", label: "Почти никогда" }
    ]
  },
  {
    id: "sleep",
    kind: "choice",
    title: "Сколько ты обычно спишь?",
    options: [
      { value: "<6", label: "Меньше 6 часов" },
      { value: "6-7", label: "6-7 часов" },
      { value: "7-8", label: "7-8 часов" },
      { value: "8+", label: "8 часов и больше" }
    ]
  },
  {
    id: "readiness",
    kind: "choice",
    title: "Когда ты готов(а) начать?",
    options: [
      { value: "now", label: "Хочу начать сейчас" },
      { value: "this-week", label: "На этой неделе" },
      { value: "this-month", label: "В ближайший месяц" },
      { value: "not-sure", label: "Пока присматриваюсь" }
    ]
  }
];
