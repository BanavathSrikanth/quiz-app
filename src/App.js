import { useState, useEffect } from "react";
import { fetchQuizData } from "./api";
import Confetti from "react-confetti";
import "./App.css";
import { CSSTransition } from "react-transition-group";
import clickSound from "./assets/sounds/click.wav";
import successSound from "./assets/sounds/goodresult.mp3";
import failSound from "./assets/sounds/failure.mp3";

function App() {
  const [quizData, setQuizData] = useState(null); // State to hold fetched quiz data
  const [shuffledQuestions, setShuffledQuestions] = useState([]); // State to hold shuffled questions
  const [selectedAnswers, setSelectedAnswers] = useState({}); // State to track selected answers
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Index of the current question
  const [score, setScore] = useState(0); // Current score
  const [quizSubmitted, setQuizSubmitted] = useState(false); // Whether the quiz has been submitted
  const [timeLeft, setTimeLeft] = useState(30); // Time left for the current question
  const [quizProgress, setQuizProgress] = useState(0); // Quiz progress (percentage)
  const [quizStarted, setQuizStarted] = useState(false); // Whether the quiz has started
  const [showAnswers, setShowAnswers] = useState(false); // Whether to show correct answers after quiz submission

  // Fetch quiz data from the API when the component mounts
  useEffect(() => {
    async function getData() {
      const data = await fetchQuizData(); // Fetch quiz data from the API
      setQuizData(data); // Store quiz data in state
      setShuffledQuestions(shuffleArray([...data.questions])); // Shuffle questions to randomize the order
    }
    getData(); // Call the function to fetch data
  }, []);

  // Play success or failure sound after quiz submission
  useEffect(() => {
    if (quizSubmitted) {
      if (score > shuffledQuestions.length / 2) {
        new Audio(successSound).play(); // Play success sound
      } else {
        new Audio(failSound).play(); // Play failure sound
      }
    }
  }, [score, quizSubmitted]); // Run this effect when score or quizSubmitted state changes

  // Timer countdown: Decreases the time left each second and automatically moves to the next question when time is up
  useEffect(() => {
    if (timeLeft > 0 && !quizSubmitted && quizStarted) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1); // Decrease time by 1 each second
      }, 1000);
      return () => clearInterval(timer); // Cleanup the timer when the component unmounts or timeLeft changes
    } else if (timeLeft === 0) {
      handleNextQuestion(); // Move to the next question when time is up
    }
  }, [timeLeft, quizSubmitted, quizStarted]); // Depend on timeLeft, quizSubmitted, and quizStarted

  // Update quiz progress bar
  useEffect(() => {
    if (shuffledQuestions.length > 0) {
      const progress =
        ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100; // Calculate progress as a percentage
      setQuizProgress(progress); // Set the progress value
    }
  }, [currentQuestionIndex, shuffledQuestions.length]); // Run this effect whenever the current question or shuffledQuestions change

  // Shuffle an array using the Fisher-Yates algorithm
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Pick a random index
      [array[i], array[j]] = [array[j], array[i]]; // Swap the elements
    }
    return array; // Return the shuffled array
  };

  // Start the quiz
  const handleStartQuiz = () => {
    setQuizStarted(true); // Set quizStarted to true to begin the quiz
  };

  // Handle answer selection for a question
  const handleAnswerSelection = (questionIndex, optionIndex) => {
    new Audio(clickSound).play(); // Play the click sound

    setSelectedAnswers({ ...selectedAnswers, [questionIndex]: optionIndex }); // Store the selected answer in state
  };

  // Move to the next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1); // Increment the current question index
      setTimeLeft(30); // Reset time left for the next question
    }
  };

  // Calculate the final score based on the selected answers
  const calculateScore = () => {
    let calculatedScore = 0; // Initialize score
    shuffledQuestions.forEach((question, index) => {
      if (selectedAnswers[index] !== undefined) {
        const selectedOption = question.options[selectedAnswers[index]];
        if (selectedOption.is_correct) {
          calculatedScore += 1; // Increment score if the selected option is correct
        }
      }
    });
    setScore(calculatedScore); // Update the score state
  };

  // Submit the quiz and calculate the score
  const handleSubmitQuiz = () => {
    calculateScore(); // Calculate the score before submitting
    setQuizSubmitted(true); // Mark the quiz as submitted
  };

  // Restart the quiz
  const handleRestartQuiz = () => {
    setSelectedAnswers({}); // Reset selected answers
    setCurrentQuestionIndex(0); // Reset question index
    setScore(0); // Reset score
    setQuizSubmitted(false); // Mark the quiz as not submitted
    setTimeLeft(30); // Reset the timer
    setQuizStarted(false); // Reset quiz started state
    setShowAnswers(false); // Reset the show answers state
    setShuffledQuestions(shuffleArray([...quizData.questions])); // Re-shuffle the questions
  };

  // Show correct answers after quiz submission
  const handleCheckAnswers = () => {
    setShowAnswers(true); // Set showAnswers to true to display the correct answers
  };

  // If quizData is not available yet, show a loading message
  if (!quizData) {
    return <div>Loading...</div>;
  }

  // If quiz has not started, show the start screen
  if (!quizStarted) {
    return (
      <div className="start-screen">
        <h1>Welcome to the Quiz!</h1>
        <p>Test your knowledge and challenge yourself.</p>
        <button className="start-button" onClick={handleStartQuiz}>
          Start Quiz
        </button>
      </div>
    );
  }

  const question = shuffledQuestions[currentQuestionIndex]; // Get the current question

  return (
    <div className="quiz-container">
      <h1>{quizData.title}</h1>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress" style={{ width: `${quizProgress}%` }}></div>
      </div>

      {!quizSubmitted && <div className="timer">Time Left: {timeLeft}s</div>}

      {!quizSubmitted ? (
        <div className="question-box">
          <h3>
            Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
          </h3>
          <h4>{question.description}</h4>

          {/* Animated question options */}
          <CSSTransition
            in={true}
            timeout={500}
            classNames="fade"
            key={currentQuestionIndex}
          >
            <ul>
              {question.options.map((option, i) => (
                <li key={i}>
                  <button
                    onClick={() =>
                      handleAnswerSelection(currentQuestionIndex, i)
                    }
                    className={
                      selectedAnswers[currentQuestionIndex] === i
                        ? "selected"
                        : ""
                    }
                  >
                    {option.description}
                  </button>
                </li>
              ))}
            </ul>
          </CSSTransition>

          {/* Button to move to the next question or submit the quiz */}
          {currentQuestionIndex < shuffledQuestions.length - 1 ? (
            <button onClick={handleNextQuestion} className="next-button">
              Next Question
            </button>
          ) : (
            <button onClick={handleSubmitQuiz} className="submit-button">
              Submit Quiz
            </button>
          )}
        </div>
      ) : (
        <div>
          {/* Confetti effect on quiz submission */}
          <Confetti width={window.innerWidth} height={window.innerHeight} />

          {/* Display quiz result */}
          <h3>Quiz Finished!</h3>
          {quizSubmitted && (
            <div className="result-section">
              {score === shuffledQuestions.length
                ? "🎉 Excellent!"
                : score > shuffledQuestions.length / 2
                ? "😊 Good Job!"
                : "😞 Better luck next time!"}
              <p>Your Score:</p>
              <h2>
                {score}/{shuffledQuestions.length}
              </h2>
            </div>
          )}

          {/* Buttons for checking answers or restarting the quiz */}
          <div className="button-group">
            <button
              onClick={handleCheckAnswers}
              className="check-answers-button"
            >
              Check Answers
            </button>
            <button onClick={handleRestartQuiz} className="restart-button">
              Restart Quiz
            </button>
          </div>
        </div>
      )}

      {/* Display correct answers if showAnswers is true */}
      {showAnswers && (
        <div className="summary">
          <h4>Question Summary:</h4>
          {shuffledQuestions.map((question, index) => (
            <div key={index} className="question-summary">
              <p>
                <strong>Question:</strong> {question.description}
              </p>
              <p>
                <strong>Your Answer:</strong>{" "}
                {question.options[selectedAnswers[index]]?.description ||
                  "Not answered"}
                {question.options[selectedAnswers[index]]?.is_correct ? (
                  <span style={{ color: "green" }}> (Correct)</span>
                ) : (
                  <span style={{ color: "red" }}> (Incorrect)</span>
                )}
              </p>
              <p>
                <strong>Correct Answer:</strong>{" "}
                {
                  question.options.find((option) => option.is_correct)
                    ?.description
                }
              </p>
              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
