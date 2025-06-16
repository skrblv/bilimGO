import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Card } from '../../../shared/ui/Card';
import type { ContentBlock } from '../../../shared/types/course';
import { InformationCircleIcon, ExclamationTriangleIcon, CheckCircleIcon, ChevronDownIcon, XCircleIcon } from '@heroicons/react/24/solid';

const variants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -30, scale: 0.98, transition: { duration: 0.2, ease: "easeIn" } },
};

// --- КОМПОНЕНТ ДЛЯ АКЦЕНТНЫХ БЛОКОВ ---
const AlertBlock = ({ block }: { block: ContentBlock }) => {
    // Явно указываем тип для alertStyles, чтобы TypeScript был спокоен
    const alertStyles: Record<string, { icon: React.ForwardRefExoticComponent<any>, bg: string, border: string, iconColor: string }> = {
        info: {
            icon: InformationCircleIcon,
            bg: 'bg-blue-900/40',
            border: 'border-blue-700',
            iconColor: 'text-blue-400',
        },
        success: {
            icon: CheckCircleIcon,
            bg: 'bg-green-900/40',
            border: 'border-green-700',
            iconColor: 'text-green-400',
        },
        warning: {
            icon: ExclamationTriangleIcon,
            bg: 'bg-yellow-900/40',
            border: 'border-yellow-700',
            iconColor: 'text-yellow-400',
        },
        // --- ВОТ ИСПРАВЛЕНИЕ ---
        // Добавляем недостающий стиль 'danger'
        danger: {
            icon: XCircleIcon,
            bg: 'bg-red-900/40',
            border: 'border-red-700',
            iconColor: 'text-red-400',
        }
    };
    
    const style = alertStyles[block.style || 'info'];
    const Icon = style.icon;

    return (
        <div className={`flex items-start gap-4 p-4 my-4 rounded-lg border ${style.bg} ${style.border}`}>
            <Icon className={`h-6 w-6 flex-shrink-0 mt-0.5 ${style.iconColor}`} />
            <p className="text-text-primary text-base">{block.content}</p>
        </div>
    );
};

// --- КОМПОНЕНТ ДЛЯ СПОЙЛЕРОВ ---
const DetailsBlock = ({ block }: { block: ContentBlock }) => {
    return (
        <details className="my-4 bg-surface/50 rounded-lg border border-border overflow-hidden group">
            <summary className="p-4 font-semibold text-text-primary cursor-pointer hover:bg-border/50 flex justify-between items-center list-none">
                <span>{block.summary}</span>
                <ChevronDownIcon className="h-5 w-5 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="p-4 border-t border-border bg-background/50">
                <p className="text-text-secondary leading-relaxed">{block.content}</p>
            </div>
        </details>
    )
}

// --- ОСНОВНАЯ ФУНКЦИЯ РЕНДЕРИНГА ---
const renderBlock = (block: ContentBlock) => {
    switch (block.type) {
        case 'text':
            const formattedContent = block.content.replace(/\*(.*?)\*/g, '<strong class="text-primary font-semibold">$1</strong>').replace(/`(.*?)`/g, '<code class="bg-border text-amber-400 px-1.5 py-0.5 rounded-md font-mono text-sm">$1</code>');
            return <p className="text-lg leading-relaxed text-text-primary" dangerouslySetInnerHTML={{ __html: formattedContent }} />;
        case 'code':
            return (
                <div className="text-sm rounded-lg overflow-hidden my-4 border border-border shadow-lg">
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-gray-800/80">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <SyntaxHighlighter language={block.language || 'python'} style={vscDarkPlus} showLineNumbers customStyle={{ margin: 0, borderRadius: 0, padding: '1.25rem', borderTopWidth: '1px', borderColor: '#30363D' }}>
                        {block.content}
                    </SyntaxHighlighter>
                </div>
            );
        case 'image':
            return (
                <figure className="my-4">
                    <img src={block.url} alt={block.caption || 'Иллюстрация к уроку'} className="w-full h-auto rounded-lg border-2 border-border" />
                    {block.caption && <figcaption className="mt-2 text-center text-sm text-text-secondary italic">{block.caption}</figcaption>}
                </figure>
            );
        case 'alert':
            return <AlertBlock block={block} />;
        case 'details':
            return <DetailsBlock block={block} />;
        case 'divider':
            return <hr className="my-8 border-border/50" />;
        default:
            return null;
    }
};

interface TheoryBlockProps {
    blocks: ContentBlock[];
    step: number;
}

export const TheoryBlock = ({ blocks, step }: TheoryBlockProps) => {
    const currentBlock = blocks[step];

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={step}
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                {currentBlock ? renderBlock(currentBlock) : <p>Контент не найден.</p>}
            </motion.div>
        </AnimatePresence>
    );
};