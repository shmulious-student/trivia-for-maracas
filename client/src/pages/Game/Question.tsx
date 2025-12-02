import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/useGameStore';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { CheckCircle, XCircle, ArrowRight, Clock } from 'lucide-react';

const Question: React.FC = () => {
    const { language, t } = useLanguage();
    const { user } = useAuth();
    const { questions, currentQuestionIndex, submitAnswer, nextQuestion, answers } = useGameStore();

    const question = questions[currentQuestionIndex];
    const selectedAnswer = answers[question.id];
    const hasAnswered = selectedAnswer !== undefined;

    // Timer Logic
    const [timeLeft, setTimeLeft] = React.useState(0);
    const timerRef = React.useRef<any>(null);

    const isTimerEnabled = user?.preferences?.isTimerEnabled ?? true;
    const initialTime = user?.preferences?.gameTimer ?? 30;

    React.useEffect(() => {
        if (!isTimerEnabled || hasAnswered) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        setTimeLeft(initialTime);
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    submitAnswer(question.id, -1); // Time's up
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [question.id, hasAnswered, isTimerEnabled, initialTime]);

    const handleAnswer = (index: number) => {
        if (!hasAnswered) {
            submitAnswer(question.id, index);
        }
    };

    if (!question) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary"></div>
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-4 py-8">
            <motion.div
                key={question.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full space-y-8"
            >
                {/* Progress Bar */}
                <div className="w-full bg-bg-tertiary h-2 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-accent-primary"
                        initial={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
                        animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                <div className="text-center space-y-2">
                    <span className="text-sm font-medium text-text-muted uppercase tracking-wider">
                        {t('common.question')} {currentQuestionIndex + 1} / {questions.length}
                    </span>

                    {isTimerEnabled && (
                        <div className={cn(
                            "flex items-center justify-center gap-2 text-xl font-mono font-bold mt-2",
                            timeLeft <= 5 ? "text-error animate-pulse" : "text-accent-primary"
                        )}>
                            <Clock size={20} />
                            {timeLeft}s
                        </div>
                    )}
                    <h2 className="text-3xl md:text-4xl font-bold text-text-primary leading-tight">
                        {question.text[language]}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    {question.options.map((option, index) => {
                        const isSelected = selectedAnswer === index;
                        const isCorrect = index === question.correctAnswerIndex;

                        let variant = "glass-panel hover:border-accent-primary/50 hover:bg-bg-secondary/80";
                        let icon = null;

                        if (hasAnswered) {
                            if (isCorrect) {
                                variant = "bg-success/20 border-success text-success shadow-[0_0_15px_var(--color-success)]";
                                icon = <CheckCircle className="ms-auto text-success" size={20} />;
                            } else if (isSelected) {
                                variant = "bg-error/20 border-error text-error";
                                icon = <XCircle className="ms-auto text-error" size={20} />;
                            } else {
                                variant = "glass-panel opacity-50";
                            }
                        }

                        return (
                            <motion.button
                                key={index}
                                onClick={() => handleAnswer(index)}
                                disabled={hasAnswered}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={!hasAnswered ? { scale: 1.02 } : {}}
                                whileTap={!hasAnswered ? { scale: 0.98 } : {}}
                                className={cn(
                                    "relative p-6 text-lg font-semibold rounded-xl border-2 text-start transition-all duration-200 flex items-center w-full",
                                    variant
                                )}
                            >
                                <span className="flex-grow">{option.text[language]}</span>
                                {icon}
                            </motion.button>
                        );
                    })}
                </div>

                <AnimatePresence>
                    {hasAnswered && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="flex justify-center pt-8"
                        >
                            <Button
                                onClick={nextQuestion}
                                size="lg"
                                className="text-xl px-12 shadow-xl"
                            >
                                {currentQuestionIndex < questions.length - 1 ? t('common.next') : t('common.finish')}
                                <ArrowRight className="ms-2" size={24} />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default Question;

