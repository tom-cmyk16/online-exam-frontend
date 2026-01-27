import { useState } from "react";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
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

    const fileName = file.name.toLowerCase();
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
    const isWord = fileName.endsWith('.docx');

    if (!isExcel && !isWord) {
      toast.error("Please upload a .docx, .xlsx, or .xls file");
      return;
    }

    setUploading(true);
    try {
      let questions: Question[] = [];

      if (isExcel) {
        questions = await parseExcelFile(file);
      } else if (isWord) {
        questions = await parseWordFile(file);
      }
      
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

  const parseWordFile = async (file: File): Promise<Question[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;
    return parseQuestionsFromText(text);
  };

  const parseExcelFile = async (file: File): Promise<Question[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error("No sheets found in Excel file");
    }
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error("Worksheet not found");
    }
    const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const questions: Question[] = [];

    // Skip header row (index 0)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0 || !row[0]) continue;

      const questionText = String(row[0] || "").trim();
      if (!questionText) continue;

      const typeStr = String(row[1] || "text").toLowerCase().trim();
      let type: "text" | "multiple-choice" | "true-false" = "text";
      
      if (typeStr.includes("multiple") || typeStr.includes("choice") || typeStr === "mcq") {
        type = "multiple-choice";
      } else if (typeStr.includes("true") || typeStr.includes("false") || typeStr === "tf") {
        type = "true-false";
      }

      let options: string[] | undefined;
      let correctAnswer = String(row[2] || "").trim();

      if (type === "multiple-choice") {
        // Options in columns 3, 4, 5, 6 (indices 2, 3, 4, 5)
        options = [
          String(row[2] || "").trim(),
          String(row[3] || "").trim(),
          String(row[4] || "").trim(),
          String(row[5] || "").trim(),
        ].filter(opt => opt);
        
        // Correct answer in column 7 (index 6)
        correctAnswer = String(row[6] || "").trim();
      } else if (type === "true-false") {
        options = ["True", "False"];
        // Correct answer in column 3 (index 2)
        correctAnswer = String(row[2] || "").trim();
      }

      const marksIndex = type === "multiple-choice" ? 7 : 3;
      const marks = parseInt(String(row[marksIndex] || "1")) || 1;

      questions.push({
        text: questionText,
        type,
        options,
        correctAnswer,
        marks,
      });
    }

    return questions;
  };

  const parseQuestionsFromText = (text: string): Question[] => {
    const questions: Question[] = [];
    
    // Split by question numbers (1., 2., 3., etc.)
    const questionBlocks = text.split(/\n\s*\d+\.\s+/).filter(block => block.trim());
    
    for (const block of questionBlocks) {
      const lines = block.split('\n').map(line => line.trim()).filter(line => line);
      
      if (lines.length === 0) continue;
      
      const questionText = lines[0] || "";
      if (!questionText) continue;
      
      let type: "text" | "multiple-choice" | "true-false" = "text";
      let options: string[] = [];
      let correctAnswer = "";
      let marks = 1;
      
      // Check for question type indicators
      if (block.toLowerCase().includes('true') && block.toLowerCase().includes('false')) {
        type = "true-false";
        // Look for answer indicator
        const answerMatch = block.match(/answer:\s*(true|false)/i);
        if (answerMatch && answerMatch[1]) {
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
        if (answerMatch && answerMatch[1] && options.length > 0) {
          const answerIndex = answerMatch[1].toLowerCase().charCodeAt(0) - 97;
          if (answerIndex >= 0 && answerIndex < options.length) {
            correctAnswer = options[answerIndex] || "";
          }
        }
      } else {
        // Text question
        const answerMatch = block.match(/answer:\s*(.+?)(?:\n|$)/i);
        if (answerMatch && answerMatch[1]) {
          correctAnswer = answerMatch[1].trim();
        }
      }
      
      // Look for marks
      const marksMatch = block.match(/marks?:\s*(\d+)/i);
      if (marksMatch && marksMatch[1]) {
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
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-blue-900">📄 Upload Questions from Excel or Word</h3>
        <a
          href="/question-template.csv"
          download="question-template.csv"
          className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
        >
          ⬇️ Download Template
        </a>
      </div>
      
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select file (.xlsx, .xls, or .docx)
        </label>
        <input
          type="file"
          accept=".xlsx,.xls,.docx"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
        {/* Excel Format */}
        <div className="bg-white p-3 rounded border">
          <p className="font-semibold text-green-700 mb-2">📊 Excel Format (.xlsx/.xls)</p>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-1">Question</th>
                <th className="border p-1">Type</th>
                <th className="border p-1">Option A</th>
                <th className="border p-1">Option B</th>
                <th className="border p-1">Option C</th>
                <th className="border p-1">Option D</th>
                <th className="border p-1">Answer</th>
                <th className="border p-1">Marks</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-1">What is 2+2?</td>
                <td className="border p-1">MCQ</td>
                <td className="border p-1">3</td>
                <td className="border p-1">4</td>
                <td className="border p-1">5</td>
                <td className="border p-1">6</td>
                <td className="border p-1">4</td>
                <td className="border p-1">2</td>
              </tr>
              <tr>
                <td className="border p-1">Is sky blue?</td>
                <td className="border p-1">TF</td>
                <td className="border p-1">True</td>
                <td className="border p-1" colSpan={4}></td>
                <td className="border p-1">1</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2 text-xs">
            <strong>Types:</strong> MCQ (multiple-choice), TF (true-false), Text
          </p>
        </div>

        {/* Word Format */}
        <div className="bg-white p-3 rounded border">
          <p className="font-semibold text-blue-700 mb-2">📝 Word Format (.docx)</p>
          <div className="space-y-1">
            <p>1. Question text</p>
            <p className="ml-3">a) Option 1</p>
            <p className="ml-3">b) Option 2</p>
            <p className="ml-3">Answer: a</p>
            <p className="ml-3">Marks: 2</p>
            <p className="mt-2">2. True/False question?</p>
            <p className="ml-3">Answer: True</p>
            <p className="ml-3">Marks: 1</p>
            <p className="mt-2">3. Text question?</p>
            <p className="ml-3">Answer: Your answer</p>
            <p className="ml-3">Marks: 3</p>
          </div>
        </div>
      </div>

      {uploading && (
        <div className="mt-3 text-center text-blue-600 font-semibold">
          <p>⏳ Processing document...</p>
        </div>
      )}
    </div>
  );
};

export default QuestionUpload;
