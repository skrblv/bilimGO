import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Card } from '../../../shared/ui/Card';
import type { ContentBlock } from '../../../shared/types/course';

const variants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -30, scale: 0.98, transition: { duration: 0.2, ease: "easeIn" } },
};

const renderBlock = (block: ContentBlock) => {
    switch (block.type) {
        case 'text':
            const formattedContent = block.content.replace(/\*(.*?)\*/g, '<strong class="text-primary font-semibold">$1</strong>');
            return <p className="text-lg leading-relaxed text-text-primary" dangerouslySetInnerHTML={{ __html: formattedContent }} />;
        case 'code':
            return (
                <div className="text-sm rounded-lg overflow-hidden my-4 border border-border shadow-inner">
                    <SyntaxHighlighter language={block.language || 'python'} style={tomorrow} showLineNumbers customStyle={{ margin: 0, borderRadius: 0, padding: '1.25rem' }}>
                        {block.content}
                    </SyntaxHighlighter>
                </div>
            );
        case 'image':
            return (
                <figure className="my-4">
                    <img src={block.url} alt={block.caption || 'Иллюстрация к уроку'} className="w-full h-auto rounded-lg border border-border" />
                    {block.caption && <figcaption className="mt-2 text-center text-sm text-text-secondary">{block.caption}</figcaption>}
                </figure>
            );
        default:
            return null;
    }
};

interface TheoryBlockProps {
    blocks: ContentBlock[];
    step: number;
}

export const TheoryBlock = ({ blocks, step }: TheoryBlockProps) => {
    // --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
    // Проверяем, что массив 'blocks' не пустой и 'step' находится в его пределах
    if (!blocks || blocks.length === 0 || step >= blocks.length) {
        return (
            <Card className="!p-8 md:!p-10 border-2 border-border bg-gradient-to-br from-surface to-background">
                <p className="text-text-secondary">Для этого шага нет теоретического материала.</p>
            </Card>
        );
    }
    
    const currentBlock = blocks[step];

    return (
        <Card className="!p-8 md:!p-10 border-2 border-border bg-gradient-to-br from-surface to-background">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    variants={variants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    {renderBlock(currentBlock)}
                </motion.div>
            </AnimatePresence>
        </Card>
    );
};