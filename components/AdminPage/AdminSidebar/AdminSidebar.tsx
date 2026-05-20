"use client";

import React from "react";
import css from "./AdminSidebar.module.css";
import { AdminTab } from "../AdminHeader/AdminHeader";

interface AdminSidebarProps {
    activeTab: AdminTab;
    setActiveTab: (tab: AdminTab) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function AdminSidebar({
                                         activeTab,
                                         setActiveTab,
                                         isOpen,
                                         setIsOpen,
                                     }: AdminSidebarProps) {
    const menuItems: { id: AdminTab; label: string; icon: string }[] = [
        { id: "users", label: "Користувачі", icon: "👤" },
        { id: "lectures", label: "Лекції", icon: "📚" },
        { id: "tests", label: "Тести", icon: "📝" },
        { id: "reviews", label: "Відгуки", icon: "⭐" },
    ];

    return (
        <aside className={`${css.sidebar} ${isOpen ? css.sidebarOpen : css.sidebarClosed}`}>
            <div className={css.sidebarTop}>
                <h2 className={css.logo}>
                    Speed<span className={css.logoAccent}>hub</span> Admin
                </h2>
                <button className={css.closeSidebarBtn} onClick={() => setIsOpen(false)}>
                    ✕
                </button>
            </div>

            <nav className={css.nav}>
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            setActiveTab(item.id);
                            if (window.innerWidth <= 1024) setIsOpen(false);
                        }}
                        className={`${css.navBtn} ${activeTab === item.id ? css.active : ""}`}
                    >
                        <span className={css.icon}>{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className={css.footerMarker}>N</div>
        </aside>
    );
}