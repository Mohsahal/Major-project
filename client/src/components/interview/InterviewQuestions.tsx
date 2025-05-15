
import { useState } from 'react';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

const InterviewQuestions = () => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');

  const addQuestion = () => {
    if (currentQuestion.trim() !== '') {
      setQuestions([...questions, currentQuestion]);
      setCurrentQuestion('');
    }
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <CardDescription className="mb-4">Add your own custom questions to be asked during the interview</CardDescription>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="custom-question">Add Custom Question</Label>
              <div className="flex space-x-2">
                <Textarea
                  id="custom-question"
                  placeholder="Type your interview question here..."
                  className="flex-1"
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={addQuestion} 
                  disabled={currentQuestion.trim() === ''}
                  className="mt-2"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Question
                </Button>
              </div>
            </div>
          </div>
          
          {questions.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Custom Questions ({questions.length})</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {questions.map((question, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
                    <div className="flex-1">
                      <p className="text-sm">{question}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeQuestion(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 h-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <h3 className="font-medium">Import Questions</h3>
            <div className="space-y-3">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="questions-file">Upload from file</Label>
                <Input 
                  id="questions-file" 
                  type="file" 
                  accept=".txt,.csv"
                />
                <p className="text-xs text-gray-500">
                  Upload a .txt or .csv file with one question per line
                </p>
              </div>
            </div>
          </div>
          
          {questions.length > 0 && (
            <div className="pt-2">
              <Button 
                variant="outline" 
                className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={() => setQuestions([])}
              >
                Clear All Questions
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewQuestions;
