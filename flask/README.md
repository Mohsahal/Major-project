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
