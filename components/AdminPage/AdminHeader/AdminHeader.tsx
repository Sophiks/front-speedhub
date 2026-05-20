"use client";

import React from "react";
import css from "./AdminHeader.module.css";

export type AdminTab = "users" | "lectures" | "tests" | "reviews";

interface AdminHeaderProps {
  currentTab: AdminTab;
  stats: {
    totalUsers?: number;
    premiumUsers?: number;
    totalLectures?: number;
    totalTests?: number;
    pendingReviews?: number;
    approvedReviews?: number;
  };
  onMenuToggle: () => void;
}

export default function AdminHeader({ currentTab, stats, onMenuToggle }: AdminHeaderProps) {
  const renderHeaderContent = () => {
    switch (currentTab) {
      case "users":
        return {
          title: "Користувачі",
          cards: [
            { label: "Всього користувачів:", value: stats.totalUsers ?? 0, isPremium: false },
            { label: "Преміум підписки:", value: stats.premiumUsers ?? 0, isPremium: true },
          ],
        };

      case "lectures":
        return {
          title: "Управління лекціями",
          cards: [
            { label: "Всього лекцій:", value: stats.totalLectures ?? 0, isPremium: false },
          ],
        };

      case "tests":
        return {
          title: "Управління тестами",
          cards: [
            { label: "Всього тем:", value: stats.totalTests ?? 0, isPremium: false },
          ],
        };

      case "reviews":
        return {
          title: "Модерація відгуків",
          cards: [
            { label: "Очікують перевірки:", value: stats.pendingReviews ?? 0, isPremium: true },
            { label: "Затверджено відгуків:", value: stats.approvedReviews ?? 0, isPremium: false },
          ],
        };

      default:
        return { title: "Панель адміністратора", cards: [] };
    }
  };

  const { title, cards } = renderHeaderContent();

  return (
      <header className={css.header}>
        <div className={css.titleBlock}>
          <button className={css.burgerBtn} onClick={onMenuToggle}>
            ☰
          </button>
          <h1 className={css.title}>{title}</h1>
        </div>

        <div className={css.statsGroup}>
          {cards.map((card, index) => (
              <div key={index} className={css.statCard}>
                <span className={css.statLabel}>{card.label}</span>
                <strong className={`${css.statValue} ${card.isPremium ? css.premiumText : ""}`}>
                  {card.value}
                </strong>
              </div>
          ))}
        </div>
      </header>
  );
}