"use client";

import React, { useEffect } from "react";
import { Lecture } from "@/app/services/lectureAdminService";
import css from "../UserStatsModal/UserStatsModal.module.css";

interface LectureViewModalProps {
    lecture: Lecture | null;
    onClose: () => void;
}

const cleanHtmlForDarkMode = (htmlContent: string) => {
    if (!htmlContent) return "";
    return htmlContent
        .replace(/style="[^"]*color:[^";]*;?[^"]*"/g, "")
        .replace(/style='[^']*color:[^';]*;?[^']*'/g, "")
        .replace(/style="[^"]*background-color:[^";]*;?[^"]*"/g, "")
        .replace(/style='[^']*background-color:[^';]*;?[^']*'/g, "");
};

export default function LectureViewModal({ lecture, onClose }: LectureViewModalProps) {
    useEffect(() => {
        if (lecture) {
            const scrollY = window.scrollY;
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = "100%";
            document.body.style.overflowY = "scroll";
        } else {
            const scrollY = document.body.style.top;
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            document.body.style.overflowY = "";

            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || "0") * -1);
            }
        }

        return () => {
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            document.body.style.overflowY = "";
        };
    }, [lecture]);

    if (!lecture) return null;

    const cleanedContent = cleanHtmlForDarkMode(lecture.content_html);

    return (
        <div className={css.overlay} onClick={onClose}>
            <div className={css.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px" }}>
                <div className={css.header}>
                    <div>
                        <h2>{lecture.title}</h2>
                        <span className={css.premiumBadge} style={{ background: "#109cf1" }}>
                            ID теми: {lecture.topic_id.toUpperCase()}
                        </span>
                    </div>
                    <button className={css.closeBtn} onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className={css.content} style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: "10px" }}>
                    <section className={css.section}>
                        <h4 className={css.subTitle}>Префікс розділу</h4>
                        <p><span>{lecture.topic_prefix}</span></p>
                    </section>

                    <section className={css.section}>
                        <h4 className={css.subTitle}>Контент (Текст лекції)</h4>
                        <div
                            className="lecture-html-content"
                            style={{ lineHeight: "1.6", fontSize: "15px" }}
                            dangerouslySetInnerHTML={{ __html: cleanedContent }}
                        />
                    </section>
                </div>
            </div>
        </div>
    );
}