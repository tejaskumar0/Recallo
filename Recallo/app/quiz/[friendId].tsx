import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircle, ChevronLeft, ChevronRight, Trophy, XCircle } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { generateQuiz, QuizResponse } from "../../services/api";

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
  const [submittedQuestions, setSubmittedQuestions] = useState<boolean[]>([]);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

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
      setSubmittedQuestions(new Array(quizData.questions.length).fill(false));
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
    if (submittedQuestions[currentQuestionIndex]) return; // Don't allow changing answers after submission
    
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

  const handleSubmitCurrentQuestion = () => {
    if (!quiz) return;
    
    if (selectedAnswers[currentQuestionIndex] === null) {
      Alert.alert("No Answer Selected", "Please select an answer before submitting.");
      return;
    }
    
    const newSubmitted = [...submittedQuestions];
    newSubmitted[currentQuestionIndex] = true;
    setSubmittedQuestions(newSubmitted);
    
    // Update score if answer is correct
    if (selectedAnswers[currentQuestionIndex] === quiz.questions[currentQuestionIndex].correct_answer) {
      setScore(score + 1);
    }
    
    // Check if this was the last question
    if (currentQuestionIndex === quiz.questions.length - 1) {
      // All questions answered, mark quiz as completed
      setQuizCompleted(true);
    }
  };

  const handleFinishQuiz = () => {
    setShowResults(true);
  };

  const getOptionStyle = (optionIndex: number) => {
    if (!submittedQuestions[currentQuestionIndex]) {
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
          <Image
            source={require("../../assets/images/loader.gif")}
            style={styles.loader}
            resizeMode="contain"
          />
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

  if (showResults && quizCompleted) {
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
              const wasAnswered = selectedAnswers[index] !== null;
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
                    {!wasAnswered ? (
                      <View style={styles.unansweredIcon}>
                        <Text style={styles.unansweredIconText}>-</Text>
                      </View>
                    ) : isCorrect ? (
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
                setSubmittedQuestions(new Array(quiz.questions.length).fill(false));
                setQuizCompleted(false);
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
                disabled={submittedQuestions[currentQuestionIndex]}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionLetter}>
                    <Text style={styles.optionLetterText}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={styles.optionText}>{option}</Text>
                </View>
                {submittedQuestions[currentQuestionIndex] && index === currentQuestion.correct_answer && (
                  <CheckCircle size={20} color={palette.success} />
                )}
                {submittedQuestions[currentQuestionIndex] && index === selectedAnswers[currentQuestionIndex] && 
                 index !== currentQuestion.correct_answer && (
                  <XCircle size={20} color={palette.error} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {submittedQuestions[currentQuestionIndex] && (
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

          {!submittedQuestions[currentQuestionIndex] ? (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitCurrentQuestion}
            >
              <Text style={styles.submitButtonText}>Submit Answer</Text>
            </TouchableOpacity>
          ) : quizCompleted ? (
            <TouchableOpacity
              style={styles.viewResultsButton}
              onPress={handleFinishQuiz}
            >
              <Text style={styles.viewResultsButtonText}>View Results</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.navButton}
              onPress={handleNext}
            >
              <Text style={styles.navButtonText}>Next Question</Text>
              <ChevronRight size={20} color={palette.textPrimary} />
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: palette.background,
  },
  loader: {
    width: "100%",
    height: "25%",
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    color: palette.textPrimary,
    marginBottom: 4,
  },
  loadingSubtext: {
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
  unansweredIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: palette.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unansweredIconText: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    color: '#ffffff',
  },
});