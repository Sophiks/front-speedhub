"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import css from "./LecturePage.module.css";

interface Lecture {
    _id: string;
    topic_id: string;
    topic_prefix: string;
    title: string;
    content_html: string;
}

export default function LecturePage() {
    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeLectureId, setActiveLectureId] = useState<string>("");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const fetchLectures = async () => {
            try {
                setLoading(true);
                const res = await fetch("https://speedhub-back.onrender.com/api/lectures");
                if (!res.ok) throw new Error("Помилка при отриманні лекцій");
                const data: Lecture[] = await res.json();

                const sortedData = (data || []).sort((a, b) =>
                    a.topic_id.localeCompare(b.topic_id, undefined, { numeric: true, sensitivity: "base" })
                );

                setLectures(sortedData);

                if (sortedData.length > 0) {
                    setActiveLectureId(sortedData[0]._id);
                }
            } catch (err) {
                console.error("Помилка завантаження даних лекцій:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLectures();
    }, []);

    const handleLectureSelect = (id: string) => {
        setActiveLectureId(id);

        if (window.innerWidth <= 768) {
            setSidebarOpen(false);
        }
    };

    const currentLecture = lectures.find((l) => l._id === activeLectureId) || lectures[0];

    if (loading) {
        return <div className={css.centeredState}>Завантаження всіх розділів ПДР...</div>;
    }

    return (
        <main className={css.mainLayout}>
            {/* Ліва панель */}
            <aside className={`${css.sidebar} ${sidebarOpen ? css.sidebarOpen : css.sidebarClosed}`}>
                <div className={css.sidebarHeader}>
                    <h2>Теорія ПДР</h2>
                    <button className={css.toggleBtn} onClick={() => setSidebarOpen(false)}>
                        ◀
                    </button>
                </div>

                <div className={css.sidebarContent}>
                    <div className={css.lectureList}>
                        {lectures.map((lec) => {
                            const isActive = lec._id === activeLectureId;
                            return (
                                <button
                                    key={lec._id}
                                    className={`${css.lectureItem} ${isActive ? css.activeItem : ""}`}
                                    onClick={() => handleLectureSelect(lec._id)} // 👈 Викликаємо нашу нову розумну функцію
                                >
                                    <span className={css.lectureTitleText}>{lec.title}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </aside>

            {!sidebarOpen && (
                <button className={css.floatingOpenBtn} onClick={() => setSidebarOpen(true)}>
                    📚 Список розділів
                </button>
            )}

            {/* Права панель */}
            <section className={css.contentArea}>
                {currentLecture ? (
                    <div className={css.lectureContainer}>
                        <header className={css.lectureHeader}>
                            <span className={css.topicBadge}>Розділ: {currentLecture.topic_id.toUpperCase()}</span>
                            <h1 className={css.mainTitle}>{currentLecture.title}</h1>
                        </header>

                        {/* Контент лекції */}
                        <article
                            className={css.articleBody}
                            dangerouslySetInnerHTML={{ __html: currentLecture.content_html }}
                        />

                        {/* Тест */}
                        <div className={css.testNavigationBlock}>
                            <div className={css.testCard}>
                                <div className={css.testCardHeader}>
                                    <div className={css.iconWrapper}>⚡</div>
                                    <div className={css.testCardText}>
                                        <h3>Перевірка знань теми</h3>
                                        <p>Пройдіть офіційні екзаменаційні питання за матеріалами цієї лекції.</p>
                                    </div>
                                </div>
                                {/* Веде на сторінку конкретного тесту  */}
                                <Link href={`/tests/${currentLecture.topic_id}`} className={css.startTestBtn}>
                                    Скласти тест
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={css.centeredState}>Оберіть тему зі списку ліворуч</div>
                )}
            </section>
        </main>
    );
}