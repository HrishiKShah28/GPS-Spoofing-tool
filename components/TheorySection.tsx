
import React, { useState } from 'react';
import { THEORY_CONTENT } from '../constants';
import { ChevronDownIcon } from './icons';

interface AccordionItemProps {
    title: string;
    content: string;
    isOpen: boolean;
    onClick: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, content, isOpen, onClick }) => {
    return (
        <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-800/50 shadow-sm backdrop-blur-sm">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center p-4 text-left font-bold text-cyan-400 hover:bg-slate-700/50"
            >
                <span className="font-orbitron">{title}</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
                className={`transition-all duration-500 ease-in-out grid ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
                <div className="overflow-hidden">
                     <div className="p-4 text-slate-300 whitespace-pre-line bg-slate-900/50 border-t border-slate-700">
                        {content}
                    </div>
                </div>
            </div>
        </div>
    );
};


export const TheorySection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <footer className="p-4 lg:p-6 bg-slate-900/50 border-t border-slate-700 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-4 text-center text-slate-300 font-orbitron">Educational Briefing</h2>
            <div className="max-w-4xl mx-auto space-y-2">
                {THEORY_CONTENT.map((item, index) => (
                    <AccordionItem
                        key={index}
                        title={item.title}
                        content={item.content}
                        isOpen={openIndex === index}
                        onClick={() => handleToggle(index)}
                    />
                ))}
            </div>
        </footer>
    );
};
