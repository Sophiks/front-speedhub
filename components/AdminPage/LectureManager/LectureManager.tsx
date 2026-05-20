"use client";

import React, { useEffect, useState, useCallback } from "react";
import { lectureAdminService, Lecture } from "@/app/services/lectureAdminService";
import ConfirmModal from "@/components/Modals/ConfirmModal/ConfirmModal";
import LectureViewModal from "./LectureViewModal";
import EditLectureModal from "./EditLectureModal";
import styles from "../TestManager/TestManager.module.css";

export default function LectureManager() {
    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [loading, setLoading] = useState(true);

    const [viewingLecture, setViewingLecture] = useState<Lecture | null>(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);

    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        mongoId: string;
        lectureTitle: string;
    }>({
        isOpen: false,
        mongoId: "",
        lectureTitle: "",
    });

    const loadLectures = useCallback(async () => {
        try {
            setLoading(true);
            const data = await lectureAdminService.getAllLectures();
            setLectures(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadLectures();
    }, [loadLectures]);

    const handleSave = async (lectureData: Partial<Lecture>) => {
        try {
            await lectureAdminService.saveLecture(lectureData, editingLecture?._id);
            setIsEditModalOpen(false);
            loadLectures();
        } catch (err) {
            alert("Помилка при збереженні лекції!");
        }
    };

    const openDeleteConfirm = (mongoId: string, lectureTitle: string) => {
        setConfirmConfig({
            isOpen: true,
            mongoId,
            lectureTitle,
        });
    };

    const closeDeleteConfirm = () => {
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
    };

    const handleConfirmDelete = async () => {
        try {
            await lectureAdminService.deleteLecture(confirmConfig.mongoId);
            loadLectures();
            closeDeleteConfirm();
        } catch (err) {
            alert("Помилка при видаленні лекції!");
        }
    };

    if (loading) return <div className={styles.loading}>Завантаження лекцій...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <h3>Лекції ({lectures.length})</h3>
                </div>
                <button
                    className={styles.addButton}
                    onClick={() => {
                        setEditingLecture(null);
                        setIsEditModalOpen(true);
                    }}
                >
                    + Створити лекцію
                </button>
            </header>

            <div className={styles.tableWrapper}>
                <table className={styles.tableContainer}>
                    <thead>
                    <tr className={styles.tableHeader}>
                        <th>ID</th>
                        <th>Назва лекції / Розділу</th>
                        <th>Перегляд</th>
                        <th>Дії</th>
                    </tr>
                    </thead>
                    <tbody>
                    {lectures.length === 0 ? (
                        <tr className={styles.tableRow}>
                            <td colSpan={4} className={styles.tableCell} style={{ textAlign: "center", color: "#718096" }}>
                                Лекцій у базі даних не знайдено
                            </td>
                        </tr>
                    ) : (
                        lectures.map((l) => (
                            <tr key={l._id} className={styles.tableRow}>
                                <td className={styles.tableCell} style={{ width: "80px" }}>
                                    <strong className={styles.idBadge}>{l.topic_id.toUpperCase()}</strong>
                                </td>

                                <td className={styles.tableCell}>
                            <span style={{ fontWeight: "500", color: "var(--section-text-title)" }}>
                                {l.title}
                            </span>
                                </td>

                                <td className={styles.tableCell} style={{ width: "130px", textAlign: "center" }}>
                                    <button
                                        onClick={() => setViewingLecture(l)}
                                        style={{
                                            background: "#e3f2fd",
                                            color: "#109cf1",
                                            border: "none",
                                            padding: "6px 12px",
                                            borderRadius: "6px",
                                            fontSize: "12px",
                                            cursor: "pointer",
                                            fontWeight: "600",
                                            whiteSpace: "nowrap",
                                            display: "inline-block"
                                        }}
                                    >
                                        👁️ Детальніше
                                    </button>
                                </td>

                                <td className={styles.tableCell} style={{ width: "180px", textAlign: "right" }}>
                                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                        <button
                                            className={styles.editButton}
                                            onClick={() => {
                                                setEditingLecture(l);
                                                setIsEditModalOpen(true);
                                            }}
                                        >
                                            Редагувати
                                        </button>
                                        <button
                                            className={styles.deleteButton}
                                            onClick={() => openDeleteConfirm(l._id, l.title)}
                                        >
                                            Видалити
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {viewingLecture && (
                <LectureViewModal
                    lecture={viewingLecture}
                    onClose={() => setViewingLecture(null)}
                />
            )}

            {isEditModalOpen && (
                <EditLectureModal
                    lecture={editingLecture}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSave}
                />
            )}

            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                title="Видалення лекції"
                message={`Ви впевнені, що хочете видалити лекцію "${confirmConfig.lectureTitle}"? Цю дію неможливо скасувати.`}
                onConfirm={handleConfirmDelete}
                onCancel={closeDeleteConfirm}
                type="danger"
                confirmText="Видалити"
            />
        </div>
    );
}