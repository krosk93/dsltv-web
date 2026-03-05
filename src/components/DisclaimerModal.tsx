'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';
import styles from './DisclaimerModal.module.css';

export default function DisclaimerModal() {
    const t = useTranslations('disclaimer_modal');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hasAccepted = localStorage.getItem('dsltv_disclaimer_accepted');
        if (!hasAccepted) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('dsltv_disclaimer_accepted', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.iconWrap}>
                    <AlertTriangle size={32} />
                </div>
                <h2 className={styles.title}>{t('title')}</h2>
                <p className={styles.message}>{t('message')}</p>
                <button className={styles.button} onClick={handleAccept}>
                    {t('button')}
                </button>
            </div>
        </div>
    );
}
