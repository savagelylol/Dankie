import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function Trivia() {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [gameResult, setGameResult] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const { toast } = useToast();

  const { refetch: getQuestion, isFetching: loadingQuestion } = useQuery({
    queryKey: ["/api/games/trivia", currentQuestion?.questionId],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/games/trivia");
      return res.json();
    },
    enabled: false,
  });

  const answerMutation = useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: number; answer: number }) => {
      const res = await apiRequest("POST", "/api/games/trivia", { questionId, answer });
      return res.json();
    },
    onSuccess: (data) => {
      setGameResult(data);
      toast({
        title: data.win ? "Correct Answer! 🧠" : "Wrong Answer 😔",
        description: data.win ? `+${data.amount} coins, +${data.newXP - (data.newXP - 20)} XP!` : `The correct answer was: ${data.correctAnswer}`,
        variant: data.win ? "default" : "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Confetti effect for correct answers
      if (data.win) {
        createConfetti();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Game Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createConfetti = () => {
    for (let i = 0; i < 30; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.animationDelay = Math.random() * 3 + 's';
      confetti.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        confetti.remove();
      }, 3000);
    }
  };

  const startNewQuestion = async () => {
    setSelectedAnswer(null);
    setGameResult(null);
    const result = await getQuestion();
    if (result.data) {
      setCurrentQuestion(result.data);
    }
  };

  const handleAnswer = () => {
    if (selectedAnswer === null || !currentQuestion) {
      toast({
        title: "Select an Answer",
        description: "Please choose an option before submitting",
        variant: "destructive",
      });
      return;
    }

    answerMutation.mutate({
      questionId: currentQuestion.questionId,
      answer: selectedAnswer
    });
  };

  return (
    <div className="space-y-6">
      <Card className="glow-primary border-primary/20">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🧠</div>
          <CardTitle className="font-impact text-3xl text-primary">MEME TRIVIA</CardTitle>
          <CardDescription>Test your knowledge of memes and internet culture!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!currentQuestion && !gameResult ? (
            <div className="text-center space-y-4">
              <p className="text-lg text-muted-foreground">Ready to test your meme knowledge?</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-accent">💰 100</div>
                    <div className="text-sm text-muted-foreground">Coins per Correct Answer</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">⭐ 20</div>
                    <div className="text-sm text-muted-foreground">XP per Correct Answer</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-secondary">❓ 100+</div>
                    <div className="text-sm text-muted-foreground">Questions Available</div>
                  </CardContent>
                </Card>
              </div>
              <Button
                onClick={startNewQuestion}
                disabled={loadingQuestion}
                className="font-comic text-lg bg-primary hover:bg-primary/80 glow-primary"
                data-testid="button-start-trivia"
              >
                {loadingQuestion ? "Loading Question..." : "START QUIZ! 🚀"}
              </Button>
            </div>
          ) : currentQuestion && !gameResult ? (
            <div className="space-y-6">
              {/* Question */}
              <Card className="bg-muted p-6">
                <h3 className="text-xl font-bold text-center mb-4" data-testid="trivia-question">
                  {currentQuestion.question}
                </h3>
                
                {/* Answer Options */}
                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.options.map((option: string, index: number) => (
                    <Button
                      key={index}
                      variant={selectedAnswer === index ? "default" : "outline"}
                      onClick={() => setSelectedAnswer(index)}
                      className="p-4 h-auto text-left justify-start font-comic"
                      disabled={answerMutation.isPending}
                      data-testid={`button-answer-${index}`}
                    >
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {String.fromCharCode(65 + index)}
                        </Badge>
                        <span>{option}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={handleAnswer}
                  disabled={selectedAnswer === null || answerMutation.isPending}
                  className="font-comic text-lg bg-primary hover:bg-primary/80 glow-primary"
                  data-testid="button-submit-answer"
                >
                  {answerMutation.isPending ? "Submitting..." : "SUBMIT ANSWER! 📝"}
                </Button>
                <Button
                  onClick={startNewQuestion}
                  variant="outline"
                  disabled={loadingQuestion}
                  className="font-comic"
                  data-testid="button-skip-question"
                >
                  Skip Question
                </Button>
              </div>
            </div>
          ) : gameResult ? (
            <Card className={`${gameResult.win ? 'border-green-500 glow-accent' : 'border-destructive'}`}>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">
                  {gameResult.win ? "🎉" : "😔"}
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${gameResult.win ? 'text-green-500' : 'text-destructive'}`}>
                  {gameResult.win ? "CORRECT!" : "WRONG ANSWER!"}
                </h3>
                
                {!gameResult.win && (
                  <div className="mb-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Correct Answer:</p>
                    <p className="font-bold text-green-500">{gameResult.correctAnswer}</p>
                  </div>
                )}
                
                {gameResult.win && (
                  <div className="space-y-2 mb-4">
                    <p className="text-lg font-semibold text-green-500">
                      +{gameResult.amount} coins
                    </p>
                    <p className="text-lg font-semibold text-primary">
                      +20 XP
                    </p>
                  </div>
                )}
                
                <p className="text-muted-foreground mb-4">
                  New Balance: {gameResult.newBalance.toLocaleString()} coins
                </p>
                
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={startNewQuestion}
                    className="font-comic bg-primary hover:bg-primary/80"
                    disabled={loadingQuestion}
                    data-testid="button-next-question"
                  >
                    {loadingQuestion ? "Loading..." : "Next Question 🧠"}
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentQuestion(null);
                      setGameResult(null);
                      setSelectedAnswer(null);
                    }}
                    variant="outline"
                    className="font-comic"
                    data-testid="button-finish-trivia"
                  >
                    Finish Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Game Rules */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">How to Play</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Answer questions about memes and internet culture</p>
              <p>• Correct answers earn 100 coins and 20 XP</p>
              <p>• No penalty for wrong answers</p>
              <p>• Skip questions if you're unsure</p>
              <p>• Questions cover various difficulties</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
