import React from 'react';
import { Link } from 'react-router-dom';
import type { Skill, Lesson } from '../../../shared/types/course';
import { useAuthStore } from '../../../stores/authStore';
import { LockClosedIcon, CheckCircleIcon, PlayCircleIcon } from '@heroicons/react/24/solid';
import { AnimatedLine } from '../../../features/skill-tree/ui/AnimatedLine';

// --- КОМПОНЕНТ УРОКА ---
interface LessonNodeProps {
    lesson: Lesson;
    isCompleted: boolean;
    courseId: number;
}
const LessonNode: React.FC<LessonNodeProps> = ({ lesson, isCompleted, courseId }) => {
    const lessonContent = (
        <div className={`w-full flex items-center gap-3 pl-4 py-2 bg-background rounded-md border text-left
                        ${isCompleted ? 'border-success/50' : 'border-border hover:border-primary'}
                        transition-colors duration-200
                        ${isCompleted ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
            {isCompleted ? (
                <CheckCircleIcon className="h-6 w-6 text-success flex-shrink-0" />
            ) : (
                <PlayCircleIcon className="h-6 w-6 text-primary flex-shrink-0" />
            )}
            <div>
                <p className="font-semibold text-text-primary">{lesson.title}</p>
                <p className="text-xs text-text-secondary">Награда: {lesson.xp_reward} XP</p>
            </div>
        </div>
    );

    if (isCompleted) {
        return <div className="pointer-events-none">{lessonContent}</div>;
    }

    return (
        <Link 
            to={`/courses/${courseId}/lessons/${lesson.id}`}
            state={{ lesson: lesson, courseId: courseId }}
        >
            {lessonContent}
        </Link>
    );
};

// --- КОМПОНЕНТ НАВЫКА ---
interface SkillNodeProps {
    skill: Skill;
    isUnlocked: boolean;
    completedLessons: number[];
    courseId: number;
    isFirst: boolean;
}
const SkillNode: React.FC<SkillNodeProps> = ({ skill, isUnlocked, completedLessons, courseId, isFirst }) => {
    const areAllLessonsInSkillCompleted = skill.lessons.length > 0 && skill.lessons.every(l => completedLessons.includes(l.id));
    
    const nodeIcon = (
        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white ${areAllLessonsInSkillCompleted ? 'bg-success' : 'bg-primary'}`}>
            {areAllLessonsInSkillCompleted ? <CheckCircleIcon className="h-8 w-8" /> : <span className="text-2xl font-bold">{skill.id}</span>}
        </div>
    );

    const lockedIcon = (
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-surface border-2 border-dashed border-border flex-shrink-0">
            <LockClosedIcon className="h-6 w-6 text-text-secondary" />
        </div>
    );

    const areChildrenUnlocked = isUnlocked && areAllLessonsInSkillCompleted;

    return (
        <div className="relative pl-12 pt-8">
            {/* Рендерим анимированную линию, только если это не первый узел */}
            {!isFirst && <AnimatedLine isActive={isUnlocked} />}
            
            <div className="flex items-start gap-5 relative z-10">
                {isUnlocked ? nodeIcon : lockedIcon}
                <div className={`pt-2 flex-grow transition-opacity duration-500 ${!isUnlocked && 'opacity-50'}`}>
                    <h3 className={`text-2xl font-bold ${isUnlocked ? 'text-text-primary' : 'text-text-secondary'}`}>{skill.title}</h3>
                    
                    {isUnlocked && skill.lessons.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {skill.lessons.map(lesson => (
                                <LessonNode 
                                    key={lesson.id} 
                                    lesson={lesson} 
                                    isCompleted={completedLessons.includes(lesson.id)}
                                    courseId={courseId}
                                />
                            ))}
                        </div>
                    )}

                    {skill.children && skill.children.length > 0 && (
                        <div className="mt-6 space-y-6">
                            {skill.children.map(childSkill => (
                                <SkillNode 
                                    key={childSkill.id} 
                                    skill={childSkill} 
                                    isUnlocked={areChildrenUnlocked}
                                    completedLessons={completedLessons}
                                    courseId={courseId}
                                    isFirst={false} // Дочерние узлы никогда не бывают первыми
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- ОСНОВНОЙ КОМПОНЕНТ ДЕРЕВА ---
interface SkillTreeProps {
    skills: Skill[];
    courseId: number;
}
export const SkillTree: React.FC<SkillTreeProps> = ({ skills, courseId }) => {
    const { progress } = useAuthStore();
    if (!skills || skills.length === 0) {
        return <p className="text-text-secondary text-center">Для этого курса пока не добавлено навыков.</p>;
    }

    let previousRootSkillCompleted = true; 

    return (
        <div className="space-y-6">
            {skills.map((skill, index) => {
                const areAllLessonsInCurrentSkillCompleted = skill.lessons.length > 0 && skill.lessons.every(l => progress.completedLessons.includes(l.id));
                const isCurrentSkillUnlocked = previousRootSkillCompleted;
                
                if (isCurrentSkillUnlocked) {
                    previousRootSkillCompleted = areAllLessonsInCurrentSkillCompleted;
                }

                return (
                    <SkillNode 
                        key={skill.id} 
                        skill={skill} 
                        isUnlocked={isCurrentSkillUnlocked}
                        completedLessons={progress.completedLessons}
                        courseId={courseId}
                        isFirst={index === 0}
                    />
                );
            })}
        </div>
    );
};