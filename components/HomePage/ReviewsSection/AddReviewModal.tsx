"use client";

import React, { useState, useRef } from "react";
import axios from "axios";
import css from "./AddReviewModal.module.css";

interface AddReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddReviewModal({ isOpen, onClose, onSuccess }: AddReviewModalProps) {
    const [text, setText] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null); // 🔥 Зберігаємо сам файл, а не Base64
    const [previewUrl, setPreviewUrl] = useState(""); // Суто для відображення кружечка в інтерфейсі
    const [submitting, setSubmitting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    // Обробка вибору файлу
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("Файл занадто великий! Оберіть фото до 5 МБ.");
            return;
        }

        setSelectedFile(file); // Зберігаємо файл для відправки
        setPreviewUrl(URL.createObjectURL(file)); // Створюємо тимчасове посилання для тегу img
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) {
            alert("Будь ласка, напишіть текст відгуку!");
            return;
        }

        try {
            setSubmitting(true);

            // 1. Отримуємо токен користувача (перевір, як він у тебе називається в localStorage)
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Помилка авторизації! Будь ласка, увійдіть у свій акаунт, щоб залишити відгук.");
                return;
            }

            // 2. Створюємо FormData (оскільки бекенд приймає файли через multer)
            const formData = new FormData();
            formData.append("text", text.trim()); // Бекенд бере тільки text з body, ім'я та прізвище він сам шукає по User ID!

            if (selectedFile) {
                formData.append("photo", selectedFile); // Ключ має збігатися з тим, що очікує multer на бекенді (скоріш за все "photo" або "image")
            }

            // 3. Надсилаємо POST-запит з токеном авторизації
            const response = await axios.post("https://speedhub-back.onrender.com/api/reviews", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}` // Передаємо токен у хедері
                }
            });

            alert("Відгук успішно створено!");
            setText("");
            setSelectedFile(null);
            setPreviewUrl("");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Помилка при збереженні відгуку:", error);

            if (error.response) {
                const serverError = error.response.data?.error || "Не вдалося надіслати відгук.";
                alert(`Помилка: ${serverError}`);
            } else {
                alert("Не вдалося зв'язатися з сервером. Перевірте мережу.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={css.overlay} onClick={onClose}>
            <div className={css.modal} onClick={(e) => e.stopPropagation()}>
                <div className={css.header}>
                    <h2>Залишити відгук</h2>
                    <button className={css.closeBtn} onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className={css.form}>

                    {/* Завантаження аватара */}
                    <div className={css.photoUploadSection}>
                        <div className={css.avatarPreview}>
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" />
                            ) : (
                                <div className={css.avatarPlaceholder}>👤</div>
                            )}
                        </div>
                        <div className={css.uploadActions}>
                            <button
                                type="button"
                                className={css.uploadBtn}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {previewUrl ? "Змінити фото" : "Додати фото"}
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className={css.hiddenFileInput}
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <p className={css.uploadHint}>JPG, JPEG або PNG, до 5MB</p>
                        </div>
                    </div>

                    {/* 🔥 ЗВЕРНИ УВАГУ: Поля для імені та прізвища БІЛЬШЕ НЕ ПОТРІБНІ,
                        бо твій бекенд сам бере їх з моделі User за токеном! Залишаємо тільки текст відгуку */}
                    <div className={css.fieldGroup}>
                        <label>Ваш відгук *</label>
                        <textarea
                            className={css.textarea}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Напишіть ваші враження від навчання на платформі SpeedHub..."
                            required
                        />
                    </div>

                    <div className={css.actions}>
                        <button type="button" className={css.cancelBtn} onClick={onClose} disabled={submitting}>
                            Скасувати
                        </button>
                        <button type="submit" className={css.saveBtn} disabled={submitting}>
                            {submitting ? "Надсилання..." : "Надіслати"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}