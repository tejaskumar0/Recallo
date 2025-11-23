import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, ChevronDown, Trophy, X, RotateCcw } from "lucide-react-native";
import { useAuth } from "../../contexts/AuthContext";
import {
  Friend,
  fetchFriendsbyUser,
  generateQuiz,
  QuizQuestion,
  QuizResponse,
} from "../../services/api";

// Font helper
const getFontFamily = (weight: string | number): string => {
  switch (String(weight)) {
    case '600':
      return 'Nunito-SemiBold';
    case '700':
    case 'bold':
      return 'Nunito-Bold';
    case '800':
    case '900':
      return 'Nunito-ExtraBold';
    default:
      return 'Nunito-Regular';
  }
};


export default function QuizScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showFriendDropdown, setShowFriendDropdown] = useState(false);
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load friends on mount
  useEffect(() => {
    if (user?.id) {
      loadFriends();
    }
  }, [user?.id]);

  const loadFriends = async () => {
    if (!user?.id) return;
    try {
      const data = await fetchFriendsbyUser(user.id);
      setFriends(data);
    } catch (error) {
      console.error("Error loading friends:", error);
    }
  };


  const startQuiz = async () => {
    if (!selectedFriend || !user?.id) {
      Alert.alert("Please select a friend first");
      return;
    }
    
    setIsLoading(true);
    try {
      const quizData = await generateQuiz(user.id, selectedFriend.id);
      
      if (!quizData.questions || quizData.questions.length === 0) {
        Alert.alert("No memories found", `You haven't captured enough memories with ${selectedFriend.friend_name} yet to generate a quiz.`);
        setIsLoading(false);
        return;
      }
      
      setQuestions(quizData.questions);
      setQuizStarted(true);
      setCurrentQuestionIndex(0);
      setScore(0);
      setSelectedAnswer(null);
      setShowResult(false);
    } catch (error: any) {
      console.error("Error starting quiz:", error);
      const errorMessage = error.message || "Failed to generate quiz";
      
      if (errorMessage.includes("No content found") || errorMessage.includes("No memories found")) {
        Alert.alert("No memories found", `You haven't captured any memories with ${selectedFriend.friend_name} yet.`);
      } else {
        Alert.alert("Error", "Failed to generate quiz. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    
    if (answerIndex === questions[currentQuestionIndex].correct_answer) {
      setScore(score + 1);
    }
    
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuestions([]);
  };

  if (!quizStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#4A4036" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Memory Quiz</Text>
          <View style={{ width: 48 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.setupCard}>
            <Text style={styles.setupTitle}>Test Your Memory!</Text>
            <Text style={styles.setupSubtitle}>
              Select a friend and we'll quiz you on your conversations
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>SELECT FRIEND</Text>
              <TouchableOpacity
                style={styles.selectorButton}
                onPress={() => setShowFriendDropdown(!showFriendDropdown)}
              >
                <Text style={styles.selectorText}>
                  {selectedFriend ? selectedFriend.friend_name : "Choose a friend"}
                </Text>
                <ChevronDown size={20} color="#D7CCC8" />
              </TouchableOpacity>

              {showFriendDropdown && (
                <View style={styles.dropdown}>
                  {friends.map((friend) => (
                    <TouchableOpacity
                      key={friend.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedFriend(friend);
                        setShowFriendDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownText}>{friend.friend_name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.startButton, !selectedFriend && styles.disabledButton]}
              onPress={startQuiz}
              disabled={!selectedFriend || isLoading}
            >
              <Text style={styles.startButtonText}>
                {isLoading ? "Loading..." : "Start Quiz"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#4A4036" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quiz Results</Text>
          <View style={{ width: 48 }} />
        </View>

        <View style={styles.resultContainer}>
          <Trophy size={80} color="#FFD700" />
          <Text style={styles.scoreText}>
            {score} / {questions.length}
          </Text>
          <Text style={styles.percentageText}>{percentage}%</Text>
          <Text style={styles.resultMessage}>
            {percentage >= 80 
              ? `Great memory with ${selectedFriend?.friend_name}!` 
              : percentage >= 60 
              ? `Good effort! Keep connecting with ${selectedFriend?.friend_name}` 
              : `Time to make more memories with ${selectedFriend?.friend_name}!`}
          </Text>

          <TouchableOpacity style={styles.retryButton} onPress={resetQuiz}>
            <RotateCcw size={20} color="#FFF" />
            <Text style={styles.retryButtonText}>Try Another Quiz</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={resetQuiz} style={styles.backButton}>
          <X size={24} color="#4A4036" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Question {currentQuestionIndex + 1} / {questions.length}
        </Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }
            ]} 
          />
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correct_answer;
              const showCorrect = selectedAnswer !== null && isCorrect;
              const showWrong = isSelected && !isCorrect;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    showCorrect && styles.correctOption,
                    showWrong && styles.wrongOption,
                  ]}
                  onPress={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                >
                  <Text style={[
                    styles.optionText,
                    (showCorrect || showWrong) && styles.selectedOptionText,
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          
          {selectedAnswer !== null && currentQuestion.explanation && (
            <View style={styles.explanationBox}>
              <Text style={styles.explanationLabel}>Explanation:</Text>
              <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
            </View>
          )}
        </View>

        <Text style={styles.scoreIndicator}>Score: {score}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFCF4",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#F0EAD6",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: getFontFamily(700),
    color: "#4A4036",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  setupCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginTop: 20,
    borderWidth: 2,
    borderColor: "#F5F1E0",
  },
  setupTitle: {
    fontSize: 28,
    fontFamily: getFontFamily(800),
    color: "#4A4036",
    marginBottom: 8,
    textAlign: "center",
  },
  setupSubtitle: {
    fontSize: 16,
    fontFamily: getFontFamily(400),
    color: "#9C9480",
    marginBottom: 32,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 24,
    position: "relative",
    zIndex: 10,
  },
  label: {
    fontSize: 12,
    fontFamily: getFontFamily(700),
    color: "#9C9480",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  selectorButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFDF5",
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#F0EAD6",
    paddingHorizontal: 16,
  },
  selectorText: {
    fontSize: 16,
    fontFamily: getFontFamily(600),
    color: "#4A4036",
  },
  dropdown: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#F0EAD6",
    maxHeight: 200,
    zIndex: 100,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F9F6EE",
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: getFontFamily(600),
    color: "#4A4036",
  },
  startButton: {
    backgroundColor: "#4A4036",
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  startButtonText: {
    color: "#FFF8E1",
    fontSize: 18,
    fontFamily: getFontFamily(700),
  },
  progressBar: {
    height: 8,
    backgroundColor: "#F0EAD6",
    borderRadius: 4,
    marginBottom: 24,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFD54F",
    borderRadius: 4,
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: "#F5F1E0",
  },
  questionText: {
    fontSize: 20,
    fontFamily: getFontFamily(700),
    color: "#4A4036",
    marginBottom: 24,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: "#FFFDF5",
    borderWidth: 2,
    borderColor: "#F0EAD6",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  correctOption: {
    backgroundColor: "#C8E6C9",
    borderColor: "#4CAF50",
  },
  wrongOption: {
    backgroundColor: "#FFCDD2",
    borderColor: "#F44336",
  },
  optionText: {
    fontSize: 16,
    fontFamily: getFontFamily(600),
    color: "#4A4036",
  },
  selectedOptionText: {
    color: "#2E2E2E",
  },
  scoreIndicator: {
    fontSize: 16,
    fontFamily: getFontFamily(600),
    color: "#9C9480",
    textAlign: "center",
    marginTop: 24,
  },
  resultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  scoreText: {
    fontSize: 48,
    fontFamily: getFontFamily(900),
    color: "#4A4036",
    marginTop: 24,
  },
  percentageText: {
    fontSize: 32,
    fontFamily: getFontFamily(700),
    color: "#FFD700",
    marginTop: 8,
  },
  resultMessage: {
    fontSize: 18,
    fontFamily: getFontFamily(600),
    color: "#9C9480",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  retryButton: {
    flexDirection: "row",
    backgroundColor: "#4A4036",
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    gap: 8,
  },
  retryButtonText: {
    color: "#FFF8E1",
    fontSize: 18,
    fontFamily: getFontFamily(700),
  },
  explanationBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#F0EAD6",
    borderRadius: 12,
  },
  explanationLabel: {
    fontSize: 14,
    fontFamily: getFontFamily(700),
    color: "#9C9480",
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    fontFamily: getFontFamily(400),
    color: "#4A4036",
    lineHeight: 20,
  },
});