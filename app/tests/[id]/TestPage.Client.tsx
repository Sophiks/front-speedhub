"use client";

import React, { useState, useEffect } from "react";
import css from "./TestPage.module.css";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { getTestsByTheme } from "@/lib/api";
import { userService } from "@/app/services/userService";
import TestResults from "@/components/TestPage/TestResults/TestResults";
import QuestionStepper from "@/components/TestPage/QuestionStepper/QuestionStepper";
import TestProgress from "@/components/TestPage/TestProgress/TestProgress";
import QuestionContent from "@/components/TestPage/QuestionContent/QuestionContent";
import { Test } from "@/types/tests";
import QuestionOptions from "@/components/TestPage/QuestionOptions/QuestionOptions";
import TestControls from "@/components/TestPage/TestControls/TestControls";
import Loading from "@/app/loading";

const fallbackQuestion: Test = {
  _id: "q1",
  id: "r1q4",
  image: [],
  question: "Чи належить до проїзної частини велосипедна смуга?",
  options: [
    { _id: "o1", id: 1, text: "Так, належить." },
    { _id: "o2", id: 2, text: "Ні, не належить." },
  ],
  correct_option_id: 1,
  explanation:
      "Велосипедна смуга виконується в межах проїзної частини, тому вона до неї належить.",
};

const themeMap: Record<string, string> = {
  "r1": "Тема 1. Загальні положення",
  "r2": "Тема 2. Обов'язки і права водіїв механічних транспортних засобів",
  "r3": "Тема 3. Рух транспортних засобів із спеціальними сигналами",
  "r4": "Тема 4. Обов'язки і права пішоходів",
  "r5": "Тема 5. Обов'язки і права пасажирів",
  "r6": "Тема 6. Вимоги до велосипедистів",
  "r7": "Тема 7. Вимоги до осіб, які керують гужовим транспортом, і погоничів тварин",
  "r8_1": "Тема 8 (Частина 1). Регулювання дорожнього руху (регульовані перехрестя)",
  "r8_2": "Тема 8 (Частина 2). Регулювання дорожнього руху (нерегульовані перехрестя)",
  "r9": "Тема 9. Попереджувальні сигнали",
  "r10": "Тема 10. Початок руху та зміна його напрямку",
  "r11": "Тема 11. Розташування транспортних засобів на дорозі",
  "r12": "Тема 12. Швидкість руху",
  "r13": "Тема 13. Дистанція, інтервал, зустрічний роз'їзд",
  "r14": "Тема 14. Обгін",
  "r15": "Тема 15. Зупинка і стоянка",
  "r16_1": "Тема 16 (Частина 1). Проїзд перехресть (регульовані перехрестя)",
  "r16_2": "Тема 16 (Частина 2). Проїзд перехресть (нерегульовані перехрестя)",
  "r17": "Тема 17. Переваги маршрутних транспортних засобів",
  "r18": "Тема 18. Проїзд пішохідних переходів і зупинок транспортних засобів",
  "r19": "Тема 19. Користування зовнішніми світловими приладами",
  "r20": "Тема 20. Рух через залізничні переїзди",
  "r21": "Тема 21. Перевезення пасажирів",
  "r22": "Тема 22. Перевезення вантажу",
  "r23": "Тема 23. Буксирування та експлуатація транспортних составів",
  "r24": "Тема 24. Навчальна їзда",
  "r25": "Тема 25. Рух транспортних засобів у колонах",
  "r26": "Тема 26. Рух у житловій та пішохідній зоні",
  "r27": "Тема 27. Рух по автомагістралях і дорогах для автомобілів",
  "r28": "Тема 28. Рух по гірських дорогах і на крутих спусках",
  "r29": "Тема 29. Міжнародний рух",
  "r30": "Тема 30. Номерні, розпізнавальні знаки, написи і позначення",
  "r31": "Тема 31. Технічний стан транспортних засобів та їх обладнання",
  "r32": "Тема 32. Окремі питання дорожнього руху, що потребують узгодження",
  "r33": "Тема 33. Дорожні знаки",
  "r34": "Тема 34. Дорожня розмітка",
  "r35": "Тема 35. Основи безпечного водіння",
  "r36": "Тема 36. Основи права в області дорожнього руху",
  "r37": "Тема 37. Надання домедичної допомоги",
  "r38": "Тема 38. Етика водіння, культура та відпочинок водія",
  "r39": "Тема 39. Європротокол",
  "r47": "Тема 40. Додаткові питання щодо категорій B1, B (Безпека)"
};

const TestPageClient = () => {
  const { id } = useParams<{ id: string }>();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
      Record<string, number>
  >({});
  const [isFinished, setIsFinished] = useState(false);
  const [checkedAnswers, setCheckedAnswers] = useState<Record<string, boolean>>(
      {},
  );
  const [mistakeIds, setMistakeIds] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  const { data: tests, isLoading } = useQuery({
    queryKey: ["testByTheme", id],
    queryFn: () => getTestsByTheme(id),
    refetchOnMount: false,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentIndex]);

  useEffect(() => {
    if (isFinished && !isSaved && tests) {
      const correctCount = tests.reduce(
          (acc, q) =>
              selectedAnswers[q.id] === q.correct_option_id ? acc + 1 : acc,
          0,
      );

      userService
          .updateStats("unit", {
            unitId: id,
            correctAnswers: correctCount,
            incorrectAnswers: (tests?.length || 0) - correctCount,
            totalQuestions: tests?.length || 0,
            timeSpent: 0,
            mistakes: mistakeIds,
            isPassed: correctCount / (tests?.length || 1) >= 0.9,
          })
          .then(() => setIsSaved(true))
          .catch((err) => console.error("Error saving theme stats:", err));
    }
  }, [isFinished, isSaved, tests, selectedAnswers, mistakeIds, id]);

  if (isLoading) {
    return <Loading />;
  }

  const currentQuestion = tests ? tests[currentIndex] : fallbackQuestion;
  const totalQuestions = tests?.length || 0;
  const isCurrentChecked = checkedAnswers[currentQuestion.id];

  const currentThemeTitle = themeMap[id] || `Тема: ${id?.toUpperCase()}`;

  const handleOptionSelect = (optionId: number) => {
    if (isCurrentChecked) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const handleCheckAnswer = () => {
    setCheckedAnswers((prev) => ({ ...prev, [currentQuestion.id]: true }));

    if (
        selectedAnswers[currentQuestion.id] !== currentQuestion.correct_option_id
    ) {
      setMistakeIds((prev) => [...new Set([...prev, currentQuestion.id])]);
    }
  };

  const handleNext = () =>
      currentIndex < totalQuestions - 1 && setCurrentIndex((prev) => prev + 1);
  const handlePrev = () =>
      currentIndex > 0 && setCurrentIndex((prev) => prev - 1);
  const handleFinish = () => setIsFinished(true);

  const handleRetry = () => {
    setIsFinished(false);
    setIsSaved(false);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setCheckedAnswers({});
    setMistakeIds([]);
  };

  if (isFinished) {
    const correctAnswersCount = tests?.reduce((acc, question) => {
      return selectedAnswers[question.id] === question.correct_option_id
          ? acc + 1
          : acc;
    }, 0);

    return (
        <section className={css.section}>
          <div className={css.container}>
            <TestResults
                correctAnswersCount={correctAnswersCount}
                totalQuestions={totalQuestions}
                onRetry={handleRetry}
            />
          </div>
        </section>
    );
  }

  return (
      <section className={css.section}>
        <div className={css.container}>

          {/* НОВИЙ БЛОК: Виведення теми над основною карткою тесту */}
          <div className={css.topThemeBadge}>
            <span className={css.badgeIcon}>📚</span>
            <h1 className={css.themeTitle}>{currentThemeTitle}</h1>
          </div>

          <div className={css.testWrapper}>
            <QuestionStepper
                questions={tests || []}
                currentIndex={currentIndex}
                checkedAnswers={checkedAnswers}
                selectedAnswers={selectedAnswers}
                onStepClick={setCurrentIndex}
            />
            <TestProgress
                currentIndex={currentIndex}
                totalQuestions={totalQuestions}
            />
            <QuestionContent question={currentQuestion} />
            <QuestionOptions
                question={currentQuestion}
                selectedAnswerId={selectedAnswers[currentQuestion.id]}
                isCurrentChecked={isCurrentChecked}
                onOptionSelect={handleOptionSelect}
            />
            <TestControls
                currentIndex={currentIndex}
                totalQuestions={totalQuestions}
                isCurrentChecked={isCurrentChecked}
                hasSelectedAnswer={!!selectedAnswers[currentQuestion.id]}
                onPrev={handlePrev}
                onNext={handleNext}
                onCheck={handleCheckAnswer}
                onFinish={handleFinish}
            />
          </div>
        </div>
      </section>
  );
};

export default TestPageClient;