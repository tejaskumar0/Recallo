import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert
} from "react-native";
import { useEffect, useState } from "react";
import { generateQuiz, QuizQuestion, QuizResponse } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Trophy } from "lucide-react-native";

const palette = {
  background: "#f2efe0ff",
  card: "#FFFFFF",
  textPrimary: "#2b2100",
  textSecondary: "#6b623f",
  accent: "#fef08a",
  border: "rgba(0, 0, 0, 0.08)",
  success: "#4caf50",
  error: "#f44336",
  info: "#2196f3",
  optionDefault: "#f5f5f5",
  optionSelected: "#fef08a",
  optionCorrect: "#c8e6c9",
  optionWrong: "#ffcdd2"
};

const shadow = {
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
};

export default function QuizTakingScreen() {
  const { friendId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    if (!user?.id || !friendId) return;
    
    try {
      setLoading(true);
      const quizData = await generateQuiz(user.id, friendId as string);
      setQuiz(quizData);
      setSelectedAnswers(new Array(quizData.questions.length).fill(null));
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to generate quiz. Please try again.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (submitted) return; // Don't allow changing answers after submission
    
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = () => {
    // Check if all questions are answered
    const unansweredCount = selectedAnswers.filter(a => a === null).length;
    if (unansweredCount > 0) {
      Alert.alert(
        "Incomplete Quiz",
        `You have ${unansweredCount} unanswered question${unansweredCount > 1 ? 's' : ''}. Are you sure you want to submit?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Submit Anyway", onPress: submitQuiz }
        ]
      );
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = () => {
    if (!quiz) return;
    
    let correctCount = 0;
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        correctCount++;
      }
    });
    
    setScore(correctCount);
    setSubmitted(true);
    setShowResults(true);
    setCurrentQuestionIndex(0);
  };

  const getOptionStyle = (optionIndex: number) => {
    if (!submitted) {
      return selectedAnswers[currentQuestionIndex] === optionIndex
        ? styles.optionSelected
        : styles.optionDefault;
    }
    
    const currentQuestion = quiz?.questions[currentQuestionIndex];
    const isCorrect = currentQuestion?.correct_answer === optionIndex;
    const isSelected = selectedAnswers[currentQuestionIndex] === optionIndex;
    
    if (isCorrect) return styles.optionCorrect;
    if (isSelected && !isCorrect) return styles.optionWrong;
    return styles.optionDefault;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.accent} />
          <Text style={styles.loadingText}>Generating your quiz...</Text>
          <Text style={styles.loadingSubtext}>This may take a moment</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!quiz) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load quiz</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  if (showResults && submitted) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quiz Results</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.resultsCard}>
            <Trophy size={64} color={percentage >= 70 ? palette.success : palette.textSecondary} />
            <Text style={styles.scoreText}>
              {score} / {quiz.questions.length}
            </Text>
            <Text style={styles.percentageText}>{percentage}%</Text>
            <Text style={styles.friendText}>
              Quiz about {quiz.friend_name}
            </Text>
            
            <View style={styles.resultMessage}>
              <Text style={styles.resultMessageText}>
                {percentage >= 90 ? "Outstanding! You have an excellent memory!" :
                 percentage >= 70 ? "Great job! You remember most details well." :
                 percentage >= 50 ? "Good effort! There's room for improvement." :
                 "Keep practicing! Pay more attention to conversations."}
              </Text>
            </View>
          </View>

          <View style={styles.reviewSection}>
            <Text style={styles.reviewTitle}>Review Your Answers</Text>
            {quiz.questions.map((question, index) => {
              const isCorrect = selectedAnswers[index] === question.correct_answer;
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.reviewItem}
                  onPress={() => {
                    setShowResults(false);
                    setCurrentQuestionIndex(index);
                  }}
                >
                  <View style={styles.reviewItemHeader}>
                    {isCorrect ? (
                      <CheckCircle size={20} color={palette.success} />
                    ) : (
                      <XCircle size={20} color={palette.error} />
                    )}
                    <Text style={styles.reviewItemNumber}>Question {index + 1}</Text>
                  </View>
                  <Text style={styles.reviewItemTopic}>{question.topic}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => {
                setSelectedAnswers(new Array(quiz.questions.length).fill(null));
                setSubmitted(false);
                setShowResults(false);
                setCurrentQuestionIndex(0);
                setScore(0);
              }}
            >
              <Text style={styles.retakeButtonText}>Retake Quiz</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.backHomeButton}
              onPress={() => router.push("/(stack)/home")}
            >
              <Text style={styles.backHomeButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={palette.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quiz: {quiz.friend_name}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.questionCard}>
          <Text style={styles.topicLabel}>{currentQuestion.topic}</Text>
          <Text style={styles.question}>{currentQuestion.question}</Text>
          
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  getOptionStyle(index)
                ]}
                onPress={() => handleSelectOption(index)}
                disabled={submitted}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionLetter}>
                    <Text style={styles.optionLetterText}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={styles.optionText}>{option}</Text>
                </View>
                {submitted && index === currentQuestion.correct_answer && (
                  <CheckCircle size={20} color={palette.success} />
                )}
                {submitted && index === selectedAnswers[currentQuestionIndex] && 
                 index !== currentQuestion.correct_answer && (
                  <XCircle size={20} color={palette.error} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {submitted && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>Explanation:</Text>
              <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
            </View>
          )}
        </View>

        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentQuestionIndex === 0 && styles.navButtonDisabled
            ]}
            onPress={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft size={20} color={
              currentQuestionIndex === 0 ? palette.textSecondary : palette.textPrimary
            } />
            <Text style={[
              styles.navButtonText,
              currentQuestionIndex === 0 && styles.navButtonTextDisabled
            ]}>Previous</Text>
          </TouchableOpacity>

          {!submitted && currentQuestionIndex === quiz.questions.length - 1 ? (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitQuiz}
            >
              <Text style={styles.submitButtonText}>Submit Quiz</Text>
            </TouchableOpacity>
          ) : submitted && currentQuestionIndex === quiz.questions.length - 1 ? (
            <TouchableOpacity
              style={styles.viewResultsButton}
              onPress={() => setShowResults(true)}
            >
              <Text style={styles.viewResultsButtonText}>View Results</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.navButton,
                currentQuestionIndex === quiz.questions.length - 1 && styles.navButtonDisabled
              ]}
              onPress={handleNext}
              disabled={currentQuestionIndex === quiz.questions.length - 1}
            >
              <Text style={[
                styles.navButtonText,
                currentQuestionIndex === quiz.questions.length - 1 && styles.navButtonTextDisabled
              ]}>Next</Text>
              <ChevronRight size={20} color={
                currentQuestionIndex === quiz.questions.length - 1 ? palette.textSecondary : palette.textPrimary
              } />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: palette.textPrimary,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: palette.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: palette.accent,
    borderRadius: 4,
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: palette.textSecondary,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  questionCard: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...shadow,
  },
  topicLabel: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: palette.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  question: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    color: palette.textPrimary,
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionDefault: {
    backgroundColor: palette.optionDefault,
    borderColor: palette.border,
  },
  optionSelected: {
    backgroundColor: palette.optionSelected,
    borderColor: palette.accent,
  },
  optionCorrect: {
    backgroundColor: palette.optionCorrect,
    borderColor: palette.success,
  },
  optionWrong: {
    backgroundColor: palette.optionWrong,
    borderColor: palette.error,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionLetterText: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: palette.textPrimary,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: palette.textPrimary,
    lineHeight: 22,
  },
  explanationContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: palette.background,
    borderRadius: 12,
  },
  explanationTitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: palette.textPrimary,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: palette.textSecondary,
    lineHeight: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: palette.card,
    borderRadius: 12,
    ...shadow,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: palette.textPrimary,
    marginHorizontal: 4,
  },
  navButtonTextDisabled: {
    color: palette.textSecondary,
  },
  submitButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: palette.accent,
    borderRadius: 12,
    ...shadow,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: palette.textPrimary,
  },
  viewResultsButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: palette.success,
    borderRadius: 12,
    ...shadow,
  },
  viewResultsButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    color: palette.textPrimary,
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: palette.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    color: palette.error,
  },
  resultsCard: {
    backgroundColor: palette.card,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    ...shadow,
  },
  scoreText: {
    fontSize: 48,
    fontFamily: 'Nunito-ExtraBold',
    color: palette.textPrimary,
    marginTop: 16,
  },
  percentageText: {
    fontSize: 32,
    fontFamily: 'Nunito-Bold',
    color: palette.textSecondary,
    marginTop: 8,
  },
  friendText: {
    fontSize: 18,
    fontFamily: 'Nunito-Regular',
    color: palette.textSecondary,
    marginTop: 12,
  },
  resultMessage: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  resultMessageText: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: palette.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
  },
  reviewSection: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    ...shadow,
  },
  reviewTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: palette.textPrimary,
    marginBottom: 16,
  },
  reviewItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  reviewItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewItemNumber: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: palette.textPrimary,
    marginLeft: 8,
  },
  reviewItemTopic: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: palette.textSecondary,
    marginLeft: 28,
  },
  actionButtons: {
    gap: 12,
  },
  retakeButton: {
    paddingVertical: 16,
    backgroundColor: palette.accent,
    borderRadius: 12,
    alignItems: 'center',
    ...shadow,
  },
  retakeButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: palette.textPrimary,
  },
  backHomeButton: {
    paddingVertical: 16,
    backgroundColor: palette.card,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: palette.border,
  },
  backHomeButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: palette.textPrimary,
  },
});