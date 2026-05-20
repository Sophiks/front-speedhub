"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { reviewAdminService, Review } from "@/app/services/reviewAdminService";
import ConfirmModal from "@/components/Modals/ConfirmModal/ConfirmModal";
import styles from "../TestManager/TestManager.module.css";

export default function ReviewManager() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>("all");

    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        mongoId: string;
        fullName: string;
    }>({
        isOpen: false,
        mongoId: "",
        fullName: "",
    });

    const loadReviews = useCallback(async () => {
        try {
            setLoading(true);
            const data = await reviewAdminService.getAllReviews();
            setReviews(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    const handleApprove = async (mongoId: string) => {
        try {
            await reviewAdminService.approveReview(mongoId);
            loadReviews();
        } catch (err) {
            alert("Помилка при затвердженні!");
        }
    };

    const openDeleteConfirm = (mongoId: string, fullName: string) => {
        setConfirmConfig({
            isOpen: true,
            mongoId,
            fullName,
        });
    };

    const closeDeleteConfirm = () => {
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
    };

    const handleConfirmDelete = async () => {
        try {
            await reviewAdminService.deleteReview(confirmConfig.mongoId);
            loadReviews();
            closeDeleteConfirm();
        } catch (err) {
            alert("Помилка при видаленні відгуку!");
        }
    };

    const filteredReviews = useMemo(() => {
        if (filterStatus === "all") return reviews;
        if (filterStatus === "pending") return reviews.filter((r) => !r.isApproved);
        if (filterStatus === "approved") return reviews.filter((r) => r.isApproved);
        return reviews;
    }, [reviews, filterStatus]);

    if (loading) return <div className={styles.loading}>Завантаження відгуків...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <h3>Відгуки ({filteredReviews.length})</h3>
                    <select
                        className={styles.topicSelect}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Всі відгуки</option>
                        <option value="pending">⏳ Очікують перевірки</option>
                        <option value="approved">✅ Затверджені</option>
                    </select>
                </div>
            </header>

            <div className={styles.tableWrapper}>
                <table className={styles.tableContainer}>
                    <thead>
                    <tr className={styles.tableHeader}>
                        <th>Користувач</th>
                        <th>Текст відгуку</th>
                        <th>Статус</th>
                        <th>Дії</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredReviews.length === 0 ? (
                        <tr className={styles.tableRow}>
                            <td colSpan={4} className={styles.tableCell} style={{ textAlign: "center", color: "#718096" }}>
                                Відгуків у цій категорії немає
                            </td>
                        </tr>
                    ) : (
                        filteredReviews.map((r) => {
                            const fullName = `${r.name || ""} ${r.surname || ""}`.trim() || "Анонім";

                            return (
                                <tr key={r._id} className={styles.tableRow}>
                                    <td className={styles.tableCell}>
                                        <strong>{fullName}</strong>
                                        <div style={{ fontSize: "12px", color: "#718096", marginTop: "2px" }}>
                                            Студент SpeedHub
                                        </div>
                                    </td>
                                    <td className={styles.tableCell} style={{ maxWidth: "450px", whiteSpace: "normal" }}>
                                        {r.text}
                                    </td>
                                    <td className={styles.tableCell}>
                                        <span
                                            className={r.isApproved ? styles.idBadge : styles.deleteButton}
                                            style={{
                                                background: r.isApproved ? "#28a745" : "#ffc107",
                                                color: r.isApproved ? "#fff" : "#000",
                                                padding: "4px 8px",
                                                borderRadius: "6px",
                                                fontSize: "12px"
                                            }}
                                        >
                                            {r.isApproved ? "Затверджено" : "Модерація"}
                                        </span>
                                    </td>
                                    <td className={styles.tableCell}>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            {!r.isApproved && (
                                                <button
                                                    className={styles.editButton}
                                                    style={{ background: "#109cf1", color: "#fff" }}
                                                    onClick={() => handleApprove(r._id)}
                                                >
                                                    Затвердити
                                                </button>
                                            )}
                                            <button
                                                className={styles.deleteButton}
                                                onClick={() => openDeleteConfirm(r._id, fullName)}
                                            >
                                                Видалити
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </div>

            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                title="Видалення відгуку"
                message={`Ви впевнені, що хочете видалити відгук від користувача ${confirmConfig.fullName}? Цю дію неможливо скасувати.`}
                onConfirm={handleConfirmDelete}
                onCancel={closeDeleteConfirm}
                type="danger"
                confirmText="Видалити"
            />
        </div>
    );
}