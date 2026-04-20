# HireIQ 🚀 | AI-Powered Recruitment Pipeline

HireIQ is a full-stack SaaS application designed to automate the initial stages of technical recruitment. It bridges the gap between raw applications and human interviews by using **Google Gemini 1.5 Pro** to analyze resumes against job descriptions, providing data-driven match scores and technical gap analysis.

---

## 🌟 Key Features

- **AI Resume Scoring:** Automated parsing and ranking of candidates based on technical merit.
- **Recruiter Dashboard:** Real-time analytics on hiring pipelines and candidate quality.
- **Job Management:** Create and track job postings with specific technical requirements.
- **Smart Auth Flow:** Secure recruiter authentication with fully functional password recovery (Supabase Auth).
- **Public Portal:** Dedicated application links for candidates to submit resumes directly into the pipeline.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), Tailwind CSS, Lucide Icons |
| **Backend** | Supabase (Auth, Database, Edge Functions) |
| **AI Engine** | Google Gemini 1.5 API & Python Logic |
| **Database** | PostgreSQL (via Supabase) |

---

## 📂 Project Structure

```text
hire-iq/
├── ai-service/         # Python logic for Gemini scoring
├── src/
│   ├── app/            # Next.js App Router (Dashboard, Jobs, Auth)
│   ├── components/     # Reusable UI components (Sidebar, ResumeUpload)
│   └── lib/            # Supabase client & server configurations
└── public/             # Static assets
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- Supabase Account & Google AI API Key

### Installation

**1. Clone the repository:**

```bash
git clone https://github.com/adityamawa/hireiq.git
cd hireiq
```

**2. Frontend Setup:**

```bash
npm install
cp .env.example .env.local
# Fill in your Supabase & Gemini keys in .env.local
npm run dev
```

**3. AI Service Setup:**

```bash
cd ai-service
pip install -r requirements.txt
python main.py
```

---

## 🗺 Roadmap

- [x] Core AI Scoring Engine
- [x] Recruiter Authentication & Password Reset
- [x] Job Posting Functionality
- [ ] AI-Generated Interview Question Scripts (Customized per candidate)
- [ ] Automated Email Notifications (Interviews/Rejections)
- [ ] Kanban Board view for Candidate Pipeline Management

---

## 👤 Author

Developed with 💻 by **Aditya Mawa**

- GitHub: [@adityamawa](https://github.com/adityamawa)
- LinkedIn: [Aditya Mawa](https://linkedin.com/in/adityamawa)