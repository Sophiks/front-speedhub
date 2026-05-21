"use client";

import React, { useState } from "react";
import css from "./PremiumPage.module.css";

interface Plan {
    id: string;
    name: string;
    price: number;
    period: string;
    badge?: string;
    features: string[];
}

export default function PremiumPage() {
    const [selectedPlan, setSelectedPlan] = useState<string>("monthly");
    const [loading, setLoading] = useState<boolean>(false);

    const plans: Plan[] = [
        {
            id: "monthly",
            name: "Місячний Premium",
            price: 450,
            period: "місяць",
            badge: "Популярно",
            features: [
                "Глибока статистика та аналіз результатів",
                "Функція «Робота над помилками»",
                "Історія складенхи та нескладених іспитів",
                "Оновлення статистики реальному часі",
            ],
        },
        {
            id: "year",
            name: "Річний доступ",
            price: 1250,
            period: "назавжди",
            badge: "Вигідно",
            features: [
                "Усі функції місячного тарифу",
                "Доступ до матеріалів на цілий рік",
                "Економія понад 70% при довгому навчанні",
            ],
        },
    ];

    const handlePayment = async () => {
        try {
            setLoading(true);

            alert(`Ініціалізація оплати для тарифу: ${selectedPlan === "monthly" ? "Місячний" : "Річний"}. Перенаправлення на платіжну систему...`);

        } catch (err) {
            console.error("Помилка оплати:", err);
        } finally {
            setLoading(false);
        }
    };

    const currentPlanObj = plans.find((p) => p.id === selectedPlan)!;

    return (
        <main className={css.main}>
            <div className={css.container}>
                {/* Заголовок */}
                <header className={css.header}>
                    <span className={css.accentBadge}>SpeedHub Premium</span>
                    <h1 className={css.title}>Включи максимальну швидкість навчання</h1>
                    <p className={css.subtitle}>
                        Отримай доступ до закритих інструментів аналітики, роботи над помилками та тренажерів іспитів для гарантованого складання на права з першого разу.
                    </p>
                </header>

                <div className={css.contentGrid}>
                    {/* ЛІВА ЧАСТИНА: Перемикач та вибір тарифу */}
                    <div className={css.plansSection}>
                        <h2 className={css.sectionTitle}>Оберіть тарифний план:</h2>
                        <div className={css.plansList}>
                            {plans.map((plan) => {
                                const isSelected = plan.id === selectedPlan;
                                return (
                                    <div
                                        key={plan.id}
                                        className={`${css.planCard} ${isSelected ? css.selectedCard : ""}`}
                                        onClick={() => setSelectedPlan(plan.id)}
                                    >
                                        {plan.badge && <span className={css.planBadge}>{plan.badge}</span>}
                                        <div className={css.planCardHeader}>
                                            <div className={css.radioCircle}>
                                                {isSelected && <div className={css.radioInner} />}
                                            </div>
                                            <div className={css.planInfo}>
                                                <h3>{plan.name}</h3>
                                                <p>Доступ до всього функціоналу платформи</p>
                                            </div>
                                        </div>
                                        <div className={css.planPrice}>
                                            <span className={css.currency}>₴</span>
                                            <span className={css.priceValue}>{plan.price}</span>
                                            <span className={css.periodText}>/ {plan.period}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ПРАВА ЧАСТИНА: Чек-аут панель з фічами */}
                    <div className={css.checkoutSection}>
                        <div className={css.checkoutCard}>
                            <h3 className={css.checkoutTitle}>Ваше замовлення:</h3>
                            <div className={css.selectedPlanSummary}>
                                <span className={css.summaryName}>{currentPlanObj.name}</span>
                                <span className={css.summaryPrice}>{currentPlanObj.price} ₴</span>
                            </div>

                            <hr className={css.divider} />

                            {/* Список фіч обраного плану */}
                            <ul className={css.featureList}>
                                {currentPlanObj.features.map((feature, i) => (
                                    <li key={i} className={css.featureItem}>
                                        <span className={css.checkIcon}>✦</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {/* Безпека */}
                            <div className={css.secureNotice}>
                                <span>🔒 Захищена оплата SSL. Дані шифруються платіжним шлюзом.</span>
                            </div>

                            {/* Кнопка Оплатити */}
                            <button
                                className={css.payBtn}
                                onClick={handlePayment}
                                disabled={loading}
                            >
                                {loading ? "Обробка..." : `Оплатити ${currentPlanObj.price} ₴`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}