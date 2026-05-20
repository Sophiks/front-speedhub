'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AddReviewModal from './AddReviewModal';
import styles from './ReviewsSection.module.css';

const BASE_URL = "https://speedhub-back.onrender.com/api/reviews";

interface Review {
    _id?: string;
    user: string;
    name: string;
    surname: string;
    text: string;
    photo: string;
    isApproved: boolean;
    createdAt: string;
}

export const ReviewsSection: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // 🔥 Стейт для модалки

    const getAvatarUrl = (photoPath: string): string => {
        if (!photoPath) return '/images/reviewsImg/default-avatar.jpg';
        if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
            return photoPath;
        }
        let safePath = photoPath;
        if (safePath.endsWith('.png')) {
            safePath = safePath.replace('.png', '.jpg');
        }
        if (!safePath.startsWith('/')) {
            return `/images/reviewsImg/${safePath}`;
        }
        return safePath;
    };

    const setDefaultAvatar = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const target = event.target as HTMLImageElement;
        target.src = `https://ui-avatars.com/api/?name=Student&background=109cf1&color=fff&size=300`;
    };

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await axios.get<Review[]>(BASE_URL);
            setReviews(response.data);
        } catch (error) {
            console.error('Помилка при отриманні відгуків з БД:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const approvedReviews = reviews.filter(review => review.isApproved === true);

    const nextSlide = () => {
        setActiveIndex((prevIndex) =>
            prevIndex === approvedReviews.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevSlide = () => {
        setActiveIndex((prevIndex) =>
            prevIndex === 0 ? approvedReviews.length - 1 : prevIndex - 1
        );
    };

    return (
        <section className={styles.reviewsSection}>
            <div className={styles.container}>
                <div className={styles.headerBlock}>
                    <h2 className={styles.title}>
                        Що про нас говорять <span>студенти</span>
                    </h2>
                    <p className={styles.subtitle}>
                        Відгуки реальних користувачів платформи SpeedHub
                    </p>

                    <button
                        className={styles.writeReviewBtn}
                        onClick={() => setIsModalOpen(true)}
                    >
                        ✍️ Залишити відгук
                    </button>
                </div>

                {loading ? (
                    <div className={styles.loaderBlock}>
                        <div className="spinner-border text-light" role="status">
                            <span className="visually-hidden">Завантаження...</span>
                        </div>
                    </div>
                ) : approvedReviews.length === 0 ? (
                    <div className={styles.emptyBlock}>
                        <p>Поки немає затверджених відгуків.</p>
                    </div>
                ) : (
                    <div className={styles.carouselWrapper}>

                        {/* Кнопка Вліво */}
                        <button className={styles.arrowButton} onClick={prevSlide} aria-label="Попередній відгук">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>

                        {/* Картка */}
                        <div className={styles.carouselCard}>
                            <div className={styles.imageSide}>
                                <img
                                    src={getAvatarUrl(approvedReviews[activeIndex].photo)}
                                    alt={`${approvedReviews[activeIndex].name}`}
                                    className={styles.bigAvatar}
                                    onError={setDefaultAvatar}
                                />
                            </div>

                            <div className={styles.contentSide}>
                                <div className={styles.quoteIcon}>“</div>
                                <p className={styles.reviewText}>
                                    {approvedReviews[activeIndex].text}
                                </p>
                                <div className={styles.userMeta}>
                                    <h3 className={styles.userName}>
                                        {approvedReviews[activeIndex].name} {approvedReviews[activeIndex].surname}
                                    </h3>
                                    <span className={styles.userStatus}>Студент SpeedHub</span>
                                </div>
                            </div>
                        </div>

                        {/* Кнопка Вправо */}
                        <button className={styles.arrowButton} onClick={nextSlide} aria-label="Наступний відгук">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>

                    </div>
                )}
            </div>

            <AddReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchReviews}
            />
        </section>
    );
};