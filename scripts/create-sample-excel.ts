import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// Sample data for German vocabulary
const sampleWords = [
    {
        word: 'der Apfel',
        meaning: 'quả táo',
        genus: 'der',
        plural: 'die Äpfel',
        audioUrl: '',
    },
    {
        word: 'die Katze',
        meaning: 'con mèo',
        genus: 'die',
        plural: 'die Katzen',
        audioUrl: '',
    },
    {
        word: 'das Haus',
        meaning: 'ngôi nhà',
        genus: 'das',
        plural: 'die Häuser',
        audioUrl: '',
    },
    {
        word: 'lernen',
        meaning: 'học',
        genus: '',
        plural: '',
        audioUrl: '',
    },
    {
        word: 'schön',
        meaning: 'đẹp',
        genus: '',
        plural: '',
        audioUrl: '',
    },
    {
        word: 'der Tisch',
        meaning: 'cái bàn',
        genus: 'der',
        plural: 'die Tische',
        audioUrl: '',
    },
    {
        word: 'die Schule',
        meaning: 'trường học',
        genus: 'die',
        plural: 'die Schulen',
        audioUrl: '',
    },
    {
        word: 'das Buch',
        meaning: 'quyển sách',
        genus: 'das',
        plural: 'die Bücher',
        audioUrl: '',
    },
    {
        word: 'essen',
        meaning: 'ăn',
        genus: '',
        plural: '',
        audioUrl: '',
    },
    {
        word: 'groß',
        meaning: 'to, lớn',
        genus: '',
        plural: '',
        audioUrl: '',
    },
];

// Create a new workbook
const workbook = XLSX.utils.book_new();

// Convert data to worksheet
const worksheet = XLSX.utils.json_to_sheet(sampleWords);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Vocabulary');

// Create sample-data directory if it doesn't exist
const sampleDir = path.join(__dirname, '..', 'sample-data');
if (!fs.existsSync(sampleDir)) {
    fs.mkdirSync(sampleDir, { recursive: true });
}

// Write to file
const filePath = path.join(sampleDir, 'sample-words.xlsx');
XLSX.writeFile(workbook, filePath);

console.log(`Sample Excel file created at: ${filePath}`);
