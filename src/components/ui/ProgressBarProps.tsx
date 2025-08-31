"use client";

import React from 'react';

type ProgressBarProps = {
    value: number; // Aktualna wartość (np. liczba zajętych miejsc)
    max: number;   // Maksymalna wartość (np. pojemność)
};

// Definiujemy naszą paletę kolorów z progami procentowymi
// Zaczynamy od najwyższego progu, aby funkcja działała poprawnie
const colorSteps = [
    { threshold: 100, color: 'bg-red-700' },          // 100% (pełne obłożenie)
    { threshold: 90, color: 'bg-red-600' },           // 90-99%
    { threshold: 80, color: 'bg-orange-500' },        // 80-89%
    { threshold: 70, color: 'bg-amber-500' },         // 70-79%
    { threshold: 60, color: 'bg-yellow-400' },        // 60-69%
    { threshold: 40, color: 'bg-lime-500' },          // 40-59%
    { threshold: 20, color: 'bg-green-500' },         // 20-39%
];
const defaultColor = 'bg-green-600'; // Kolor dla 0-19%

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max }) => {
    if (max === 0) {
        return (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-gray-400 h-2.5 rounded-full" style={{ width: '100%' }} title="Brak zdefiniowanej pojemności"></div>
            </div>
        );
    }

    const percentage = Math.max(0, Math.min(100, Math.round((value / max) * 100)));

    // Funkcja, która wybiera odpowiedni kolor na podstawie procentu
    const getColorForPercentage = (percent: number): string => {
        // Znajdź pierwszy próg, który jest mniejszy lub równy aktualnemu procentowi
        const step = colorSteps.find(s => percent >= s.threshold);
        // Jeśli znaleziono próg, użyj jego koloru. W przeciwnym razie użyj domyślnego.
        return step ? step.color : defaultColor;
    };

    const barColor = getColorForPercentage(percentage);

    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5" title={`${percentage}% zapełnienia`}>
            <div
                className={`${barColor} h-2.5 rounded-full transition-all duration-300 ease-in-out`}
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};

export default ProgressBar;