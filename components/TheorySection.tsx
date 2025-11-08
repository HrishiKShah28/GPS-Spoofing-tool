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
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center p-4 text-left font-bold text-blue-700 hover:bg-blue-50"
            >
                <span>{title}</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
                className={`transition-all duration-500 ease-in-out grid ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
                <div className="overflow-hidden">
                     <div className="p-4 text-gray-600 whitespace-pre-line bg-gray-50 border-t border-gray-200">
                        {content}
                    </div>
                </div>
            </div>
        </div>
    );
};


export const TheorySection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <footer className="p-4 lg:p-6 bg-white border-t border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Educational Briefing</h2>
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
