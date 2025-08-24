# �� AI Job Recommender

A modern web application that analyzes your resume and provides personalized job recommendations using AI-powered skill matching and SerpApi Google Jobs integration.

## ✨ Features

- **📄 Resume Upload**: Support for PDF, DOCX, and TXT files
- **🔍 AI-Powered Analysis**: Advanced resume parsing and skill detection
- **🎯 Smart Job Matching**: Domain-aware job recommendations with similarity scoring
- **🌍 Location-Based Search**: Customizable job location preferences
- **📊 Detailed Results**: Comprehensive resume analysis and job insights
- **💾 CSV Export**: Download job recommendations for offline review
- **🎨 Modern UI**: Beautiful, responsive web interface

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file with:
```
FLASK_PORT=5001
ALLOW_ALL_ORIGINS=false
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8081,http://localhost:8080
SERPAPI_API_KEY=your_api_key_here
DEFAULT_LOCATION=Bangalore
DEFAULT_TOP_RESULTS=10
DEFAULT_MODEL=all-MiniLM-L6-v2
SECRET_KEY=change-me
```

### 3. Run the Application

```bash
python app.py
```

### 4. Open Your Browser

Navigate to `http://localhost:5000` and start using the application!

## 📱 How to Use

1. **Upload Resume**: Drag & drop or click to upload your resume (PDF, DOCX, or TXT)
2. **Set Location**: Enter your preferred job location (e.g., "Bangalore", "New York")
3. **Analyze**: Click "Analyze Resume & Find Jobs" to start the AI analysis
4. **View Results**: See your resume analysis and job recommendations
5. **Apply**: Click "Apply Now" to go directly to job applications
6. **Download**: Get a CSV file with all recommendations for offline review

## 🎯 AI Analysis Features

The system automatically detects:

- **Primary Domain**: Your main skill area (JavaScript, Python, Java, etc.)
- **Subdomain**: Specific specialization (Frontend, Backend, Full Stack, etc.)
- **Skill Scores**: Confidence levels for different skill areas
- **Technology Matches**: Frameworks, tools, and databases you know

## 🏢 Job Matching Algorithm

1. **Resume Analysis**: AI extracts skills, experience, and domain focus
2. **Smart Query Generation**: Creates optimized job search queries
3. **Job Fetching**: Retrieves relevant jobs from Google Jobs via SerpApi
4. **Similarity Ranking**: Uses sentence transformers for semantic matching
5. **Domain Boosting**: Applies domain-specific scoring for better matches

## 🛠️ Technical Details

- **Backend**: Flask web framework
- **AI Models**: Sentence Transformers for semantic similarity
- **Job Data**: SerpApi Google Jobs integration
- **File Processing**: PyPDF2, docx2txt for resume parsing
- **Frontend**: Modern HTML5, CSS3, and JavaScript

## 🔑 API Configuration

The application requires a SerpApi API key for job fetching. The free tier includes:
- 100 searches per month
- Google Jobs data
- Real-time job listings

## 📁 Project Structure

```
job-recommendation-/
├── app.py                 # Main Flask application
├── job_recommender.py     # Core AI and job matching logic
├── config.py             # Configuration and API keys
├── templates/
│   └── index.html        # Web interface
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## 🚨 Troubleshooting

### Common Issues

1. **API Key Error**: Make sure your SerpApi API key is correctly configured
2. **File Upload Error**: Ensure your resume file is under 16MB and in supported format
3. **No Jobs Found**: Try changing the location or check if your API key has remaining credits
4. **Import Errors**: Install all dependencies with `pip install -r requirements.txt`

### File Size Limits

- Maximum resume file size: 16MB
- Supported formats: PDF, DOCX, TXT
- Ensure files contain readable text (not scanned images)

## 🔒 Privacy & Security

- Resume files are processed temporarily and deleted after analysis
- No personal data is stored permanently
- All processing happens locally on your machine
- API calls are made securely to SerpApi

## 📄 License

This project is open source and available under the MIT License.

---

**Happy job hunting! 🎯✨**





# skill gap analysis



---
title: Skill-Gap-Analyzer
emoji: ⚡
colorFrom: green
colorTo: gray
sdk: streamlit
sdk_version: 1.38.0
app_file: app.py
pinned: false
---

# Resume-JD Analyzer
Project Overview

This project is a Retrieval Augmented Generation (RAG) based system designed to analyze resumes against job descriptions... (Rest of your content)


## Key Features

- Skill Comparison: Compares resume skills against job description requirements.
- Missing Skill Identification: Accurately pinpoints technical skills and tools that are absent from the resume.
- Resource Recommendations: Offers relevant YouTube tutorials and online courses to assist users in acquiring missing skills.

## **How AI-Powered Skill Gap Analyzer Works**

#### 1. Upload Resume and Job Description:
- The user uploads a PDF resume and enters the job description in the text area provided.
#### 2. Preprocess Resume (if upload successful):
- The resume text is extracted using the "PyPDFLoader".
-	The extracted text is split into smaller chunks using a "CharacterTextSplitter" for better processing.
#### 3. Generate Embeddings (if processing successful):
- A "GoogleGenerativeAIEmbeddings" model converts the extracted resume text chunks into numerical representations (embeddings) and stored in a FAISS vector store. 
#### 4. Define Prompt Template:
- The Prompt Template is created. 
#### 5. Generate Missing Skills Response 
-The prompt template is filled with the user-provided job description and the preprocessed resume text.
A RetrievalQA chain is used: 
-	The retriever searches the vector store (created in step 3) for relevant information based on the job description.
-	The LLM (ChatGoogleGenerativeAI) processes the retrieved resume information (embeddings) and job description to identify missing skills.
#### 6. Display Results:
-	The raw LLM response is displayed, providing skills gap analysis.
#### 7. Suggest YouTube Tutorials (for missing skills):
-	A function get_youtube_videos fetches relevant YouTube tutorials for each missing skill using the YouTube API.




