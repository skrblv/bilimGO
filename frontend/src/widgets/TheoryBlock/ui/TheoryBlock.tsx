import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Card } from '../../../shared/ui/Card';
import type { ContentBlock } from '../../../shared/types/course';

interface TheoryBlockProps {
    blocks: ContentBlock[];
    step: number;
}

const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const renderBlock = (block: ContentBlock) => {
    switch (block.type) {
        case 'text':
            return <p className="text-lg leading-relaxed text-text-primary">{block.content}</p>;
        case 'code':
            return (
                <div className="text-sm rounded-lg overflow-hidden my-4 border border-border">
                    <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400">{block.language}</div>
                    <SyntaxHighlighter language={block.language || 'python'} style={vscDarkPlus} showLineNumbers customStyle={{ margin: 0, borderRadius: 0 }}>
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
}

export const TheoryBlock = ({ blocks, step }: TheoryBlockProps) => {
    const currentBlock = blocks[step];

    return (
        <Card>
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
        </Card>
    );
};