import { useState } from "react";
import mammoth from "mammoth";
import { toast } from "react-toastify";

interface Question {
  text: string;
  type: "text" | "multiple-choice" | "true-false";
  options?: string[];
  correctAnswer: string;
  marks?: number;
}

interface QuestionUploadProps {
  onQuestionsExtracted: (questions: Question[]) => void;
}

const QuestionUpload: React.FC<QuestionUploadProps> = ({ onQuestionsExtracted }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      toast.error("Please upload a .docx file");
      return;
    }

    setUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;

      // Parse the text to extract questions
      const questions = parseQuestionsFromText(text);
      
      if (questions.length === 0) {
        toast.warning("No questions found in the document. Please check the format.");
        return;
      }

      onQuestionsExtracted(questions);
      toast.success(`Successfully extracted ${questions.length} question(s)!`);
      
      // Clear the input
      event.target.value = '';
    } catch (error) {
      console.error("Error parsing document:", error);
      toast.error("Failed to parse document. Please check the format.");
    } finally {
      setUploading(false);
    }
  };

  const parseQuestionsFromText = (text: string): Question[] => {
    const questions: Question[] = [];
    
    // Split by question numbers (1., 2., 3., etc.)
    const questionBlocks = text.split(/\n\s*\d+\.\s+/).filter(block => block.trim());
    
    for (const block of questionBlocks) {
      const lines = block.split('\n').map(line => line.trim()).filter(line => line);
      
      if (lines.length === 0) continue;
      
      const questionText = lines[0];
      let type: "text" | "multiple-choice" | "true-false" = "text";
      let options: string[] = [];
      let correctAnswer = "";
      let marks = 1;
      
      // Check for question type indicators
      if (block.toLowerCase().includes('true') && block.toLowerCase().includes('false')) {
        type = "true-false";
        // Look for answer indicator
        const answerMatch = block.match(/answer:\s*(true|false)/i);
        if (answerMatch) {
          correctAnswer = answerMatch[1].charAt(0).toUpperCase() + answerMatch[1].slice(1).toLowerCase();
        }
      } else if (block.match(/[a-d]\)|[a-d]\./i)) {
        // Multiple choice detected
        type = "multiple-choice";
        const optionMatches = block.match(/[a-d][\)\.]\s*([^\n]+)/gi);
        if (optionMatches) {
          options = optionMatches.map(opt => opt.replace(/^[a-d][\)\.]\s*/i, '').trim());
        }
        // Look for answer indicator
        const answerMatch = block.match(/answer:\s*([a-d])/i);
        if (answerMatch && options.length > 0) {
          const answerIndex = answerMatch[1].toLowerCase().charCodeAt(0) - 97;
          if (answerIndex >= 0 && answerIndex < options.length) {
            correctAnswer = options[answerIndex];
          }
        }
      } else {
        // Text question
        const answerMatch = block.match(/answer:\s*(.+?)(?:\n|$)/i);
        if (answerMatch) {
          correctAnswer = answerMatch[1].trim();
        }
      }
      
      // Look for marks
      const marksMatch = block.match(/marks?:\s*(\d+)/i);
      if (marksMatch) {
        marks = parseInt(marksMatch[1]);
      }
      
      questions.push({
        text: questionText,
        type,
        options: type === "multiple-choice" ? options : type === "true-false" ? ["True", "False"] : undefined,
        correctAnswer,
        marks,
      });
    }
    
    return questions;
  };

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h3 className="font-semibold text-blue-900 mb-3">📄 Upload Questions from Word Document</h3>
      
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select .docx file
        </label>
        <input
          type="file"
          accept=".docx"
          onChange={handleFileUpload}
          disabled={uploading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-600 file:text-white
            hover:file:bg-blue-700
            disabled:opacity-50"
        />
      </div>

      <div className="text-xs text-gray-600 space-y-1">
        <p className="font-semibold">Document Format:</p>
        <p>1. Question text</p>
        <p>   a) Option 1</p>
        <p>   b) Option 2</p>
        <p>   Answer: a</p>
        <p>   Marks: 2</p>
        <p className="mt-2">2. True/False question?</p>
        <p>   Answer: True</p>
        <p>   Marks: 1</p>
        <p className="mt-2">3. Text question?</p>
        <p>   Answer: Your answer here</p>
        <p>   Marks: 3</p>
      </div>

      {uploading && (
        <div className="mt-3 text-center text-blue-600">
          <p>Processing document...</p>
        </div>
      )}
    </div>
  );
};

export default QuestionUpload;
