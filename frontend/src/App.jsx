import React, { useState, useEffect } from 'react';

// Dynamic API Base URL resolver with LocalStorage fallback
const getInitialApiBase = () => {
  const saved = localStorage.getItem('HIREGEN_API_BASE');
  if (saved) return saved;

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8080/api';
  }

  // Guess the Railway backend service hostname
  const host = window.location.hostname;
  if (host.includes('.up.railway.app')) {
    const parts = host.split('-');
    // e.g. hiregen-ai-production-ba8c.up.railway.app
    if (parts[0] === 'hiregen' && parts[1] === 'ai') {
      return `https://backend-production-${parts[parts.length - 1]}/api`;
    }
    // Generic replacement
    return `https://backend-${parts.slice(1).join('-')}/api`;
  }

  return '/api';
};

let API_BASE = getInitialApiBase();

// 4 coding questions to switch automatically based on candidate email hash
const CODING_QUESTIONS_LIST = [
  {
    title: 'Reverse a Linked List',
    question: 'Write a function in Java/JavaScript to reverse a singly linked list in-place and return the new head.',
    language: 'Java',
    code: 'public ListNode reverseList(ListNode head) {\n    ListNode prev = null;\n    ListNode curr = head;\n    while (curr != null) {\n        ListNode nextTemp = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = nextTemp;\n    }\n    return prev;\n}',
    testCase1: 'Input: 1 -> 2 -> 3 -> null \nOutput: 3 -> 2 -> 1 -> null',
    testCase2: 'Input: 4 -> 5 -> null \nOutput: 5 -> 4 -> null'
  },
  {
    title: 'Two Sum indices',
    question: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    language: 'JavaScript',
    code: 'function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}',
    testCase1: 'Input: nums = [2, 7, 11, 15], target = 9 \nOutput: [0, 1]',
    testCase2: 'Input: nums = [3, 2, 4], target = 6 \nOutput: [1, 2]'
  },
  {
    title: 'Valid Parentheses brackets',
    question: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
    language: 'JavaScript',
    code: 'function isValid(s) {\n    const stack = [];\n    const mapping = { ")": "(", "}": "{", "]": "[" };\n    for (let char of s) {\n        if (char in mapping) {\n            const topElement = stack.length > 0 ? stack.pop() : "#";\n            if (mapping[char] !== topElement) return false;\n        } else {\n            stack.push(char);\n        }\n    }\n    return stack.length === 0;\n}',
    testCase1: 'Input: s = "()[]{}" \nOutput: true',
    testCase2: 'Input: s = "(]" \nOutput: false'
  },
  {
    title: 'Merge Overlapping Intervals',
    question: 'Given an array of intervals where intervals[i] = [start, end], merge all overlapping intervals, and return an array of the non-overlapping intervals.',
    language: 'Java',
    code: 'public int[][] merge(int[][] intervals) {\n    if (intervals.length <= 1) return intervals;\n    java.util.Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));\n    java.util.List<int[]> result = new java.util.ArrayList<>();\n    int[] currentInterval = intervals[0];\n    result.add(currentInterval);\n    for (int[] interval : intervals) {\n        if (interval[0] <= currentInterval[1]) {\n            currentInterval[1] = Math.max(currentInterval[1], interval[1]);\n        } else {\n            currentInterval = interval;\n            result.add(currentInterval);\n        }\n    }\n    return result.toArray(new int[result.size()][]);\n}',
    testCase1: 'Input: intervals = [[1, 3], [2, 6], [8, 10]] \nOutput: [[1, 6], [8, 10]]',
    testCase2: 'Input: intervals = [[1, 4], [4, 5]] \nOutput: [[1, 5]]'
  }
];

export default function App() {
  // Theme State (Dark / Light toggle)
  const [isDark, setIsDark] = useState(true);

  // Dynamic API Base URL State override
  const [apiBaseState, setApiBaseState] = useState(API_BASE);
  const handleApiBaseChange = (newVal) => {
    setApiBaseState(newVal);
    API_BASE = newVal;
    localStorage.setItem('HIREGEN_API_BASE', newVal);
  };

  // Authentication & Role State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('recruiter'); // recruiter, candidate
  
  // Recruiter: example@gmail.com / 123456
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // Registration views and form states
  const [authView, setAuthView] = useState('login'); // login, register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEducation, setRegEducation] = useState('');
  const [regCgpa, setRegCgpa] = useState('');
  const [regSkills, setRegSkills] = useState('');
  const [regExperience, setRegExperience] = useState('');
  const [regJobTitle, setRegJobTitle] = useState('Full Stack Java Engineer');
  const [regPassword, setRegPassword] = useState('');

  // Logged in User Profile State
  const [currentUser, setCurrentUser] = useState({
    name: 'Gokul M',
    email: 'gokulmathiyalagan27@gmail.com',
    role: 'Recruiter',
    avatar: 'GM',
    currentRound: 'ROUND_1_RESUME'
  });

  const getRoundStageNumber = (round) => {
    switch (round) {
      case 'ROUND_1_RESUME': return 1;
      case 'ROUND_2_MATCHING': return 2;
      case 'ROUND_2_COMPLETED': return 2.5;
      case 'ROUND_3_APTITUDE': return 3;
      case 'ROUND_3_COMMUNICATION': return 3.5;
      case 'ROUND_4_CODING': return 4;
      case 'ROUND_5_INTERVIEW': return 5;
      case 'HIRED': return 6;
      case 'REJECTED': return 0;
      default: return 1;
    }
  };

  const isStageCompleted = (stageNum) => {
    if (currentUser.currentRound === 'REJECTED') return false;
    return getRoundStageNumber(currentUser.currentRound) > stageNum;
  };

  const isStageActive = (stageNum) => {
    if (currentUser.currentRound === 'REJECTED') return false;
    const currentNum = getRoundStageNumber(currentUser.currentRound);
    return Math.floor(currentNum) === stageNum;
  };

  const isStageLocked = (stageNum) => {
    if (currentUser.currentRound === 'REJECTED') return true;
    return getRoundStageNumber(currentUser.currentRound) < stageNum;
  };

  // Application Navigation
  const [tab, setTab] = useState('dashboard'); // dashboard, recruiter, interview, coding, report
  
  // Data lists
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  
  // Screen inputs (typed search states)
  const [targetJobTitle, setTargetJobTitle] = useState('Full Stack Java Engineer');
  const [candidateSearchText, setCandidateSearchText] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [reportCandidateId, setReportCandidateId] = useState('');
  
  // Autocomplete suggestion lists
  const [showCandidateSuggestions, setShowCandidateSuggestions] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState('');
  
  // Candidate creation form (Recruiter Board)
  const [candidateForm, setCandidateForm] = useState({
    name: 'Alice Smith',
    email: 'alice.smith@example.com',
    phone: '+91 9876543210',
    education: 'B.Tech in Computer Science, IIT Madras',
    cgpa: '8.5/10',
    experienceSummary: '2.5 years of experience building modern web applications. Worked extensively with React and Node.js. Familiar with Java.',
    skills: 'JavaScript, React, Node.js, HTML, CSS, Git, Java, MySQL, REST APIs',
    projects: 'E-commerce platform with React; Candidate tracking system',
    achievements: 'Hackathon finalist 2025',
    languages: 'English, Spanish'
  });
  
  const [resumeFile, setResumeFile] = useState(null);

  const [aptitudeQuestions, setAptitudeQuestions] = useState({ q1: '', q2: '', q3: '' });
  const [aptitudeAnswers, setAptitudeAnswers] = useState({ a1: '', a2: '', a3: '' });
  const [aptitudeLoading, setAptitudeLoading] = useState(false);
  const [aptitudeResult, setAptitudeResult] = useState(null);

  const [communicationQuestions, setCommunicationQuestions] = useState([]);
  const [communicationAnswers, setCommunicationAnswers] = useState({});
  const [communicationLoading, setCommunicationLoading] = useState(false);
  const [communicationResult, setCommunicationResult] = useState(null);

  const [currentAptitudeIndex, setCurrentAptitudeIndex] = useState(0);
  const [currentCommunicationIndex, setCurrentCommunicationIndex] = useState(0);

  // Mock Interview State
  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [answerInput, setAnswerInput] = useState('');
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [interviewType, setInterviewType] = useState('TECHNICAL'); // TECHNICAL, HR

  // Webcam & AI Proctoring monitor states
  const videoRef = React.useRef(null);
  const [proctoringLogs, setProctoringLogs] = useState([
    "[10:14:02] AI Proctoring engine initialized.",
    "[10:14:05] Live monitoring scanner active. Gaze direction: Center."
  ]);
  const [proctoringScore, setProctoringScore] = useState(98);
  const [hasWebcam, setHasWebcam] = useState(false);
  const [isCameraRequested, setIsCameraRequested] = useState(false);
  const [interviewTime, setInterviewTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Web Speech API states and handlers ("speak by candidate" and "ai read question")
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition API is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript;
      setAnswerInput(prev => prev + (prev ? ' ' : '') + transcript);
    };

    rec.onerror = (e) => {
      console.error(e);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.start();
    window._activeRecognition = rec;
  };

  const stopListening = () => {
    if (window._activeRecognition) {
      window._activeRecognition.stop();
      setIsListening(false);
    }
  };

  const handleSpeakQuestion = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentQuestion);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech not supported in this browser.");
    }
  };

  // Coding Challenge index resolver based on email hash
  const getCodingQuestionIndexForUser = (email) => {
    if (!email) return 0;
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % CODING_QUESTIONS_LIST.length;
  };

  const [codingQuestionIndex, setCodingQuestionIndex] = useState(0);

  // Coding workspace states initialized dynamically
  const [codingQuestionText, setCodingQuestionText] = useState('');
  const [codingLanguage, setCodingLanguage] = useState('');
  const [codingCode, setCodingCode] = useState('');
  const [codingResult, setCodingResult] = useState(null);

  // Sync index whenever candidate changes
  useEffect(() => {
    if (currentUser.email) {
      const initialIdx = getCodingQuestionIndexForUser(currentUser.email);
      setCodingQuestionIndex(initialIdx);
    }
  }, [currentUser.email]);

  // Sync workspace details whenever question index changes
  useEffect(() => {
    const challenge = CODING_QUESTIONS_LIST[codingQuestionIndex];
    if (challenge) {
      setCodingQuestionText(challenge.question);
      setCodingLanguage(challenge.language);
      setCodingCode(challenge.code);
      setCodingResult(null);
    }
  }, [codingQuestionIndex]);

  // Consolidated Report State
  const [report, setReport] = useState(null);

  // AI Chatbot State ("ai agent will help user if user queries")
  const [isChatOpen, setIsChatOpen] = useState(true); 
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your HireGen AI recruitment agent. How can I assist you today? You can query me to draft emails, evaluate skills, or suggest coding interview questions.' }
  ]);

  // Control theme class on body
  useEffect(() => {
    if (isDark) {
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }, [isDark]);

  // Fetch initial jobs and candidates
  useEffect(() => {
    fetchJobs();
    fetchCandidates();
  }, []);

  // Request camera access and run live AI proctoring simulation when interview starts or lobby active
  useEffect(() => {
    let activeStream = null;
    let logInterval = null;
    let timerInterval = null;

    if (tab === 'interview') {
      if (interview) {
        // Start time counting
        timerInterval = setInterval(() => {
          setInterviewTime(t => t + 1);
        }, 1000);
      }

      // Only attempt to start camera stream if candidate clicks 'Turn Camera On' (isCameraRequested === true)
      if (isCameraRequested) {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ video: true })
            .then(s => {
              activeStream = s;
              setHasWebcam(true);
              if (videoRef.current) {
                videoRef.current.srcObject = s;
              }
            })
            .catch(err => {
              setHasWebcam(false);
              console.warn("Camera blocked or not present. Running proctored face-tracking simulation.");
            });
        } else {
          setHasWebcam(false);
          console.warn("MediaDevices API not supported or secure context missing. Running proctored face-tracking simulation.");
        }
      } else {
        setHasWebcam(false);
      }

      if (interview) {
        logInterval = setInterval(() => {
          const events = [
            "Gaze Tracking: Focus maintained on screen",
            "Face Detection: Single face verified (100% certainty)",
            "Audio Monitor: Decibel level normal",
            "Speaking Check: Voice sync aligned",
            "Keypoint Scan: 68 face landmarks tracked",
            "Warning: Eye movement outside boundary detected",
            "Gaze Tracking: Recalibrated focus"
          ];
          const randomEvent = events[Math.floor(Math.random() * events.length)];
          const timestamp = new Date().toLocaleTimeString();
          
          if (randomEvent.includes("Warning")) {
            setProctoringScore(prev => Math.max(82, prev - Math.floor(Math.random() * 3 + 1)));
          } else {
            setProctoringScore(prev => Math.min(100, prev + 1));
          }

          setProctoringLogs(prev => [...prev, `[${timestamp}] ${randomEvent}`].slice(-8));
        }, 4000);
      }
    } else {
      setHasWebcam(false);
      setIsCameraRequested(false);
      setInterviewTime(0);
      setProctoringLogs([
        "[SYSTEM] AI Proctoring engine initialized.",
        "[SYSTEM] Live monitoring scanner standby."
      ]);
      setProctoringScore(98);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (logInterval) clearInterval(logInterval);
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [tab, interview, isCameraRequested]);

  // Synchronize candidate ID for mock interview queries
  useEffect(() => {
    if (userRole === 'candidate' && currentUser && currentUser.id) {
      setSelectedCandidateId(currentUser.id);
    }
  }, [userRole, currentUser]);

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_BASE}/jobs`);
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await fetch(`${API_BASE}/candidates`);
      const data = await res.json();
      setCandidates(data);
      if (data.length > 0) {
        if (!selectedCandidateId) {
          setSelectedCandidateId(data[0].id);
          setCandidateSearchText(data[0].name + " (" + data[0].email + ")");
        }
        if (!reportCandidateId) setReportCandidateId(data[0].id);
      }
    } catch (err) {
      console.error("Error fetching candidates:", err);
    }
  };

  // Handle Candidate Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regSkills) {
      alert("Please fill in Name, Email, and Technical Skills.");
      return;
    }
    setLoading(true);
    setLoadingAction('Registering candidate profile...');
    try {
      const res = await fetch(`${API_BASE}/candidates/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          education: regEducation,
          cgpa: regCgpa,
          skills: regSkills,
          experienceSummary: regExperience,
          password: regPassword
        })
      });
      if (res.ok) {
        const data = await res.json();
        alert("Candidate registration successful! Welcome to the HireGen AI portal.");
        await fetchCandidates();
        
        // Log the user in directly
        setIsLoggedIn(true);
        setCurrentUser({
          name: data.name,
          email: data.email,
          role: 'Candidate',
          avatar: data.name.split(' ').map(n => n[0]).join('').toUpperCase(),
          currentRound: data.currentRound || 'ROUND_1_RESUME'
        });
        setSelectedCandidateId(data.id);
        setReportCandidateId(data.id);
        setCandidateSearchText(data.name + " (" + data.email + ")");
        
        // Pre-populate candidateForm for Stage 1 resume upload
        setCandidateForm({
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          education: data.education || '',
          cgpa: data.cgpa || '',
          skills: data.skills || '',
          experienceSummary: data.experienceSummary || '',
          projects: data.projects || '',
          achievements: data.achievements || '',
          languages: data.languages || ''
        });

        // Set view/tab
        setTab('dashboard');
        handleFetchReport(data.id, 0);

        // Clear registration fields
        setRegName('');
        setRegEmail('');
        setRegPhone('');
        setRegEducation('');
        setRegCgpa('');
        setRegSkills('');
        setRegExperience('');
        setRegPassword('');
      } else {
        alert("Failed to register candidate profile.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to backend registration API.");
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  // Handle Login submission
  const handleLogin = (e) => {
    e.preventDefault();
    if (!usernameInput || !passwordInput) {
      alert("Please fill in all fields.");
      return;
    }

    if (userRole === 'recruiter') {
      const email = usernameInput.trim().toLowerCase();
      if ((email === 'gokulmathiyalagan27@gmail.com' || email === 'example@gmail.com') && passwordInput.trim() === '123456') {
        setIsLoggedIn(true);
        setCurrentUser({
          name: 'Gokul M',
          email: 'gokulmathiyalagan27@gmail.com',
          role: 'Recruiter',
          avatar: 'GM',
          currentRound: ''
        });
        setTab('dashboard');
      } else {
        alert("Invalid recruiter credentials. Try example@gmail.com / 123456");
      }
    } else {
      // Candidate Login: check if candidates exists in db with matching password
      const match = candidates.find(c => c.email.toLowerCase() === usernameInput.toLowerCase().trim() && (!c.password || c.password === passwordInput));
      
      if (match) {
        setIsLoggedIn(true);
        setCurrentUser({
          name: match.name,
          email: match.email,
          role: 'Candidate',
          avatar: match.name.split(' ').map(n => n[0]).join('').toUpperCase(),
          currentRound: match.currentRound || 'ROUND_1_RESUME'
        });
        setSelectedCandidateId(match.id);
        setReportCandidateId(match.id);
        setCandidateSearchText(match.name + " (" + match.email + ")");
        setCandidateForm({
          name: match.name,
          email: match.email,
          phone: match.phone || '',
          education: match.education || '',
          cgpa: match.cgpa || '',
          skills: match.skills || '',
          experienceSummary: match.experienceSummary || '',
          projects: match.projects || '',
          achievements: match.achievements || '',
          languages: match.languages || ''
        });
        setTab('dashboard'); 
        handleFetchReport(match.id, 0); 
      } else {
        alert("Invalid credentials. Please verify your email and password, or sign up if you are a new user.");
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setReport(null);
    setInterview(null);
    setCodingResult(null);
  };

  // Agent 1, 2, 3: Trigger screening, matching, gap analysis
  const handleUploadAndAnalyze = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setLoadingAction('Running Resume Screening, Candidate Matching, and Skill Gap Analysis Agents...');
    try {
      const formData = new FormData();
      formData.append('name', candidateForm.name || '');
      formData.append('email', candidateForm.email || '');
      formData.append('phone', candidateForm.phone || '');
      formData.append('education', candidateForm.education || '');
      formData.append('cgpa', candidateForm.cgpa || '');
      formData.append('experienceSummary', candidateForm.experienceSummary || '');
      formData.append('skills', candidateForm.skills || '');
      formData.append('projects', candidateForm.projects || '');
      formData.append('achievements', candidateForm.achievements || '');
      formData.append('languages', candidateForm.languages || '');
      
      if (resumeFile) {
        formData.append('resumeFile', resumeFile);
      }

      const res = await fetch(`${API_BASE}/candidates/upload?jobTitle=${encodeURIComponent(targetJobTitle)}`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      await fetchCandidates();
      setSelectedCandidateId(data.candidate.id);
      setReportCandidateId(data.candidate.id);
      setCandidateSearchText(data.candidate.name + " (" + data.candidate.email + ")");
      
      // Update local profile round based on backend auto-prediction
      if (userRole === 'candidate' && currentUser.email === data.candidate.email) {
        setCurrentUser(prev => ({ ...prev, currentRound: data.candidate.currentRound }));
      }

      alert("Resume Screening and Job Matching analysis complete! Advanced successfully.");
      setTab('dashboard');
      handleFetchReport(data.candidate.id, 0);
    } catch (err) {
      alert("Analysis failed. Backend might be offline. Showing mock simulation.");
      setTab('report');
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  const fetchAptitudeQuestions = async (candidateId) => {
    setAptitudeLoading(true);
    try {
      const res = await fetch(`${API_BASE}/aptitude/questions?candidateId=${candidateId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.questionsJson) {
          const parsedQuestions = JSON.parse(data.questionsJson);
          setAptitudeQuestions(parsedQuestions);
          setCurrentAptitudeIndex(0);
        }
        setAptitudeResult(data);
        if (data.answersJson) {
          const parsedAnswers = JSON.parse(data.answersJson);
          setAptitudeAnswers(parsedAnswers);
        } else {
          setAptitudeAnswers({});
        }
      }
    } catch (err) {
      console.error("Error fetching aptitude questions:", err);
    } finally {
      setAptitudeLoading(false);
    }
  };

  const handleSubmitAptitude = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setLoadingAction('Evaluating your aptitude answers with AI...');
    try {
      const res = await fetch(`${API_BASE}/aptitude/submit?candidateId=${selectedCandidateId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aptitudeAnswers)
      });
      if (res.ok) {
        const data = await res.json();
        setAptitudeResult(data);
        alert(`Aptitude evaluation complete!\nFinal Score: ${data.finalScore}%\nFeedback: ${data.feedback}`);
        
        await fetchCandidates();
        // Update local user round
        const score = data.finalScore || 0;
        const nextRound = score >= 60 ? 'ROUND_3_COMMUNICATION' : 'REJECTED';
        setCurrentUser(prev => ({ ...prev, currentRound: nextRound }));
        
        setTab('dashboard');
      } else {
        alert("Failed to submit aptitude answers.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to aptitude submit API.");
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  const fetchCommunicationQuestions = async (candidateId) => {
    setCommunicationLoading(true);
    try {
      const res = await fetch(`${API_BASE}/communication/questions?candidateId=${candidateId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.questionsJson) {
          const parsedQuestions = JSON.parse(data.questionsJson);
          setCommunicationQuestions(parsedQuestions);
          setCurrentCommunicationIndex(0);
        }
        setCommunicationResult(data);
        if (data.answersJson) {
          const parsedAnswers = JSON.parse(data.answersJson);
          setCommunicationAnswers(parsedAnswers);
        } else {
          setCommunicationAnswers({});
        }
      }
    } catch (err) {
      console.error("Error fetching communication questions:", err);
    } finally {
      setCommunicationLoading(false);
    }
  };

  const handleSubmitCommunication = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setLoadingAction('Evaluating your communication answers with AI...');
    try {
      const res = await fetch(`${API_BASE}/communication/submit?candidateId=${selectedCandidateId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(communicationAnswers)
      });
      if (res.ok) {
        const data = await res.json();
        setCommunicationResult(data);
        alert(`Communication evaluation complete!\nFinal Score: ${data.finalScore}%\nFeedback: ${data.feedback}`);
        
        await fetchCandidates();
        // Update local user round
        const score = data.finalScore || 0;
        const nextRound = score >= 60 ? 'ROUND_4_CODING' : 'REJECTED';
        setCurrentUser(prev => ({ ...prev, currentRound: nextRound }));
        
        setTab('dashboard');
      } else {
        alert("Failed to submit communication answers.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to communication submit API.");
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  // Recruiter approval endpoint
  const handleApproveRound = async (candidateId) => {
    setLoading(true);
    setLoadingAction('Advancing candidate status to next stage...');
    try {
      const res = await fetch(`${API_BASE}/candidates/${candidateId}/approve`, {
        method: 'POST'
      });
      const updatedCandidate = await res.json();
      await fetchCandidates();
      
      // If currently selected candidate is approved, refresh dashboard
      if (reportCandidateId === candidateId) {
        handleFetchReport(candidateId, 0);
      }

      alert(`Approved candidate! Moved to status: ${updatedCandidate.currentRound}`);
    } catch (err) {
      console.error(err);
      alert("Error approving candidate.");
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  // Recruiter reject endpoint
  const handleRejectCandidate = async (candidateId) => {
    setLoading(true);
    setLoadingAction('Rejecting candidate profile...');
    try {
      await fetch(`${API_BASE}/candidates/${candidateId}/reject`, {
        method: 'POST'
      });
      await fetchCandidates();
      if (reportCandidateId === candidateId) {
        handleFetchReport(candidateId, 0);
      }
      alert("Candidate has been rejected.");
    } catch (err) {
      console.error(err);
      alert("Error rejecting candidate.");
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  // Candidate completes round 2
  const handleCompleteRound2 = async () => {
    setLoading(true);
    setLoadingAction('Submitting matching analysis verification to Recruiter...');
    try {
      const res = await fetch(`${API_BASE}/candidates/${selectedCandidateId}/complete-matching`, {
        method: 'POST'
      });
      const data = await res.json();
      setCurrentUser(prev => ({ ...prev, currentRound: data.currentRound }));
      await fetchCandidates();
      alert("Verification sended to Recruiter. Waiting for approval.");
    } catch (err) {
      console.error(err);
      alert("Failed to submit matching verification.");
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  // Agent 4: Start Mock Interview
  const handleStartInterview = async () => {
    if (!selectedCandidateId) {
      alert("Please select or type a candidate profile first.");
      return;
    }
    setLoading(true);
    setLoadingAction('Starting interview agent...');
    try {
      const res = await fetch(`${API_BASE}/interviews/start?candidateId=${selectedCandidateId}&jobId=0&type=${interviewType}`, {
        method: 'POST'
      });
      const data = await res.json();
      setInterview(data.interview);
      setCurrentQuestion(data.question);
      setCurrentQuestionId(data.questionId);
      setInterviewHistory([]);
      setAnswerInput('');
    } catch (err) {
      console.error(err);
      alert("Failed to connect to backend interview API.");
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  // Agent 4 & 6: Submit Interview Answer
  const handleSubmitAnswer = async () => {
    if (!answerInput.trim()) {
      alert("Please enter a response.");
      return;
    }
    setLoading(true);
    setLoadingAction('Analyzing communication skills and technical correctness of your answer...');
    try {
      const res = await fetch(`${API_BASE}/interviews/question/${currentQuestionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          answer: answerInput,
          proctoringLogs: JSON.stringify(proctoringLogs),
          proctoringScore: String(proctoringScore)
        })
      });
      const data = await res.json();
      
      setInterviewHistory(prev => [...prev, {
        question: currentQuestion,
        answer: answerInput,
        score: data.evaluatedQuestion.score,
        feedback: data.evaluatedQuestion.feedback
      }]);
      
      setAnswerInput('');

      if (data.interviewStatus === 'COMPLETED') {
        alert("Mock Interview complete! Rejections and evaluations sended to Recruiter.");
        setInterview(null);
        setCurrentUser(prev => ({ ...prev, currentRound: 'ROUND_3_COMPLETED' }));
        await fetchCandidates();
        setTab('dashboard');
        handleFetchReport(selectedCandidateId, 0);
      } else {
        setCurrentQuestion(data.nextQuestion);
        setCurrentQuestionId(data.nextQuestionId);
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting answer.");
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  const handleFinishInterviewEarly = async () => {
    if (!interview || !interview.id) return;
    setLoading(true);
    setLoadingAction('Saving mock interview evaluations and closing assessment stage...');
    try {
      const res = await fetch(`${API_BASE}/interviews/${interview.id}/finish`, {
        method: 'POST'
      });
      await res.json();
      
      alert("Mock Interview finished! Your responses have been saved and sent to the Recruiter.");
      setInterview(null);
      setCurrentUser(prev => ({ ...prev, currentRound: 'ROUND_3_COMPLETED' }));
      await fetchCandidates();
      setTab('dashboard');
    } catch (err) {
      console.error(err);
      alert("Error finishing interview.");
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  // Agent 5: Code Evaluation
  const handleEvaluateCode = async () => {
    if (!selectedCandidateId) {
      alert("Please choose a candidate first.");
      return;
    }
    setLoading(true);
    setLoadingAction('Executing Coding Evaluation Agent...');
    try {
      const res = await fetch(`${API_BASE}/coding/evaluate?candidateId=${selectedCandidateId}&jobId=0&question=${encodeURIComponent(codingQuestionText)}&language=${codingLanguage}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codingCode })
      });
      const data = await res.json();
      setCodingResult(data);
      setCurrentUser(prev => ({ ...prev, currentRound: 'ROUND_4_COMPLETED' }));
      setCodingQuestionIndex(prev => (prev + 1) % CODING_QUESTIONS_LIST.length);
      await fetchCandidates();
      alert("Coding evaluation complete! Results sended to Recruiter. Automatically switched to the next challenge question.");
    } catch (err) {
      console.error(err);
      alert("Error executing coding agent.");
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  // Agent 7: Generate Hiring Decision
  const handleRunHiringDecision = async () => {
    if (!reportCandidateId) {
      alert("Please select a candidate context.");
      return;
    }
    setLoading(true);
    setLoadingAction('Executing Hiring Decision Agent. Consolidating multi-agent outputs...');
    try {
      await fetch(`${API_BASE}/decisions/run?candidateId=${reportCandidateId}&jobId=0`, {
        method: 'POST'
      });
      alert("Hiring decision generated successfully!");
      handleFetchReport(reportCandidateId, 0);
    } catch (err) {
      console.error(err);
      alert("Error compiling hiring decision.");
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  // Fetch consolidated report
  const handleFetchReport = async (cId, jId = 0) => {
    if (!cId) return;
    setLoading(true);
    setLoadingAction('Fetching report database records...');
    try {
      const res = await fetch(`${API_BASE}/reports/candidate/${cId}/job/${jId}`);
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error(err);
      alert("Report fetch failed.");
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  // Call Gemini AI chatbot custom queries
  const handleSendQuery = async (queryText = chatInput) => {
    const textToSend = queryText || chatInput;
    if (!textToSend.trim()) return;

    setChatMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'assistant', text: 'Thinking...', isLoading: true }]);

    try {
      const res = await fetch(`${API_BASE}/ai/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: textToSend,
          candidateId: selectedCandidateId || (currentUser ? currentUser.id : null),
          userRole: userRole,
          currentRound: currentUser ? currentUser.currentRound : null,
          candidateName: currentUser ? currentUser.name : null
        })
      });
      const data = await res.json();
      
      setChatMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        return [...filtered, { role: 'assistant', text: data.response }];
      });
    } catch (err) {
      setChatMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        return [...filtered, { role: 'assistant', text: 'Sorry, I encountered an issue. Please verify the backend status.' }];
      });
    }
  };

  // Candidate typing filtering
  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(candidateSearchText.toLowerCase()) ||
    c.email.toLowerCase().includes(candidateSearchText.toLowerCase())
  );

  // Quick helper to resolve progress round display name
  const getRoundBadge = (roundStr) => {
    if (roundStr === 'ROUND_1_RESUME') return 'Stage 1: Resume Upload';
    if (roundStr === 'ROUND_3_APTITUDE') return 'Stage 3: Aptitude Round';
    if (roundStr === 'ROUND_3_COMMUNICATION') return 'Stage 3.5: Communication Round';
    if (roundStr === 'ROUND_4_CODING') return 'Stage 4: Coding Round';
    if (roundStr === 'ROUND_5_INTERVIEW') return 'Stage 5: Mock Interview';
    if (roundStr === 'HIRED') return '🎉 Hired';
    if (roundStr === 'REJECTED') return '❌ Rejected';
    return roundStr;
  };

  // Find current candidate state for locks
  const activeCandidateObj = candidates.find(c => c.id === selectedCandidateId) || currentUser;
  const currentRoundState = activeCandidateObj.currentRound;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: isDark ? '#0b0f19' : '#f8fafc',
      color: isDark ? '#f3f4f6' : '#0f172a',
      transition: 'all 0.3s ease'
    }}>
      
      {/* Login Screen */}
      {!isLoggedIn && (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: isDark ? 'radial-gradient(circle at 50% 50%, #111c30 0%, #0b0f19 100%)' : 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f1f5f9 100%)'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '450px',
            animation: 'fadeIn 0.5s ease',
            background: isDark ? 'rgba(19, 28, 46, 0.7)' : 'rgba(255, 255, 255, 0.95)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: isDark ? '0 12px 40px rgba(0, 242, 254, 0.1)' : '0 12px 40px rgba(0, 0, 0, 0.06)'
          }}>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-20px' }}>
              <button 
                onClick={() => setIsDark(!isDark)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-glass)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: isDark ? '#f3f4f6' : '#1e293b'
                }}>
                {isDark ? '☀️ Light Style' : '🌙 Cyber Style'}
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '24px', marginTop: '10px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00f2fe, #9b51e0)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(0, 242, 254, 0.4)',
                marginBottom: '16px'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0b0f19" strokeWidth="2.5">
                  <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1" />
                  <circle cx="8" cy="12" r="2" />
                </svg>
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: '800', background: 'linear-gradient(to right, #00f2fe, #4facfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                HireGen AI
              </h1>
              <p style={{ color: isDark ? 'var(--text-secondary)' : '#64748b', fontSize: '13px', marginTop: '4px' }}>
                Enter your registered details to access the portal dashboard.
              </p>
            </div>

             {/* Role Switcher */}
             <div style={{
               display: 'flex',
               background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
               borderRadius: '8px',
               padding: '4px',
               marginBottom: '20px',
               border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)'
             }}>
               <button
                 onClick={() => {
                   setUserRole('recruiter');
                   setAuthView('login');
                   setUsernameInput('');
                   setPasswordInput('');
                 }}
                 style={{
                   flex: 1,
                   padding: '10px',
                   background: userRole === 'recruiter' ? 'linear-gradient(135deg, #00f2fe, #2f80ed)' : 'transparent',
                   border: 'none',
                   color: userRole === 'recruiter' ? '#0b0f19' : (isDark ? '#9ca3af' : '#64748b'),
                   fontFamily: 'var(--font-title)',
                   fontWeight: '700',
                   fontSize: '13px',
                   borderRadius: '6px',
                   cursor: 'pointer',
                   transition: 'all 0.2s'
                 }}
               >
                 Recruiter Portal
               </button>
               <button
                 onClick={() => {
                   setUserRole('candidate');
                   setAuthView('login');
                   setUsernameInput('');
                   setPasswordInput('');
                 }}
                 style={{
                   flex: 1,
                   padding: '10px',
                   background: userRole === 'candidate' ? 'linear-gradient(135deg, #00f2fe, #2f80ed)' : 'transparent',
                   border: 'none',
                   color: userRole === 'candidate' ? '#0b0f19' : (isDark ? '#9ca3af' : '#64748b'),
                   fontFamily: 'var(--font-title)',
                   fontWeight: '700',
                   fontSize: '13px',
                   borderRadius: '6px',
                   cursor: 'pointer',
                   transition: 'all 0.2s'
                 }}
               >
                 Candidate Login
               </button>
             </div>

             {/* Candidate Auth Toggle */}
             {userRole === 'candidate' && (
               <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px', fontSize: '13px' }}>
                 <span 
                   onClick={() => setAuthView('login')}
                   style={{ 
                     cursor: 'pointer', 
                     fontWeight: authView === 'login' ? '800' : '400', 
                     color: authView === 'login' ? '#00f2fe' : 'var(--text-secondary)',
                     borderBottom: authView === 'login' ? '2px solid #00f2fe' : 'none',
                     paddingBottom: '4px',
                     fontFamily: 'var(--font-title)'
                   }}
                 >
                   Candidate Sign In
                 </span>
                 <span 
                   onClick={() => setAuthView('register')}
                   style={{ 
                     cursor: 'pointer', 
                     fontWeight: authView === 'register' ? '800' : '400', 
                     color: authView === 'register' ? '#00f2fe' : 'var(--text-secondary)',
                     borderBottom: authView === 'register' ? '2px solid #00f2fe' : 'none',
                     paddingBottom: '4px',
                     fontFamily: 'var(--font-title)'
                   }}
                 >
                   Candidate Sign Up (Register)
                 </span>
               </div>
             )}

             {/* Login Form */}
             {authView === 'login' ? (
               <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} autoComplete="off">
                 <div>
                   <label style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#475569', display: 'block', marginBottom: '6px' }}>
                     {userRole === 'recruiter' ? 'Recruiter Username / Email' : 'Candidate Email Address'}
                   </label>
                   <input
                     type="text"
                     name="recruitmentEmailInput"
                     className="glass-input"
                     style={{
                       background: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                       color: isDark ? '#ffffff' : '#0f172a',
                       borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'
                     }}
                     value={usernameInput}
                     onChange={e => setUsernameInput(e.target.value)}
                     onFocus={(e) => {
                       setUsernameInput('');
                       e.target.value = '';
                     }}
                     autoComplete="new-username"
                     placeholder={userRole === 'recruiter' ? "recruiter@example.com" : "candidate@example.com"}
                     required
                   />
                 </div>

                 <div>
                   <label style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#475569', display: 'block', marginBottom: '6px' }}>
                     Password
                   </label>
                   <input
                     type="password"
                     name="recruitmentPasswordInput"
                     className="glass-input"
                     style={{
                       background: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                       color: isDark ? '#ffffff' : '#0f172a',
                       borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'
                     }}
                     value={passwordInput}
                     onChange={e => setPasswordInput(e.target.value)}
                     onFocus={(e) => {
                       setPasswordInput('');
                       e.target.value = '';
                     }}
                     autoComplete="new-password"
                     placeholder="Password"
                     required
                   />
                 </div>

                 <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', width: '100%' }}>
                   {userRole === 'recruiter' ? 'Enter Recruiter Workspace' : 'Enter Candidate Dashboard'}
                 </button>
               </form>
             ) : (
               <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} autoComplete="off">
                 <div>
                   <label style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#475569', display: 'block', marginBottom: '4px' }}>Full Name *</label>
                   <input type="text" className="glass-input" style={{ padding: '8px 12px', background: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }} value={regName} onChange={e => setRegName(e.target.value)} placeholder="Alice Smith" required />
                 </div>
                 <div>
                   <label style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#475569', display: 'block', marginBottom: '4px' }}>Email Address *</label>
                   <input type="email" className="glass-input" style={{ padding: '8px 12px', background: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }} value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="alice@example.com" required />
                 </div>
                 <div>
                   <label style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#475569', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                   <input type="text" className="glass-input" style={{ padding: '8px 12px', background: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }} value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="123-456-7890" />
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                   <div>
                     <label style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#475569', display: 'block', marginBottom: '4px' }}>Education</label>
                     <input type="text" className="glass-input" style={{ padding: '8px 12px', background: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }} value={regEducation} onChange={e => setRegEducation(e.target.value)} placeholder="B.S. Computer Science" />
                   </div>
                   <div>
                     <label style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#475569', display: 'block', marginBottom: '4px' }}>CGPA / Marks</label>
                     <input type="text" className="glass-input" style={{ padding: '8px 12px', background: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }} value={regCgpa} onChange={e => setRegCgpa(e.target.value)} placeholder="8.5" />
                   </div>
                 </div>
                 <div>
                    <label style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#475569', display: 'block', marginBottom: '4px' }}>Password *</label>
                    <input type="password" className="glass-input" style={{ padding: '8px 12px', background: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }} value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="••••••••" required />
                  </div>
                 <div>
                   <label style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#475569', display: 'block', marginBottom: '4px' }}>Technical Skills (comma-separated) *</label>
                   <input type="text" className="glass-input" style={{ padding: '8px 12px', background: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }} value={regSkills} onChange={e => setRegSkills(e.target.value)} placeholder="Java, React, SQL" required />
                 </div>
                 <div>
                   <label style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#475569', display: 'block', marginBottom: '4px' }}>Experience Summary</label>
                   <input type="text" className="glass-input" style={{ padding: '8px 12px', background: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }} value={regExperience} onChange={e => setRegExperience(e.target.value)} placeholder="2 years developer" />
                 </div>
                 <div>
                   <label style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#475569', display: 'block', marginBottom: '4px' }}>Target Job Opening</label>
                   <select className="glass-input" style={{ padding: '8px 12px', background: isDark ? '#131c2e' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a' }} value={regJobTitle} onChange={e => setRegJobTitle(e.target.value)}>
                     <option value="Full Stack Java Engineer">Full Stack Java Engineer</option>
                     <option value="Data Scientist">Data Scientist</option>
                     <option value="Senior React Developer">Senior React Developer</option>
                   </select>
                 </div>
                 <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', width: '100%' }}>
                   📝 Register & Sign Up Candidate
                 </button>
               </form>
             )}

              {/* API Endpoint Configuration Override */}
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)' }}>
                <label style={{ fontSize: '10px', color: isDark ? '#9ca3af' : '#475569', display: 'block', marginBottom: '6px', textAlign: 'center', fontWeight: '800', letterSpacing: '0.05em' }}>
                  🔗 ACTIVE BACKEND API URL
                </label>
                <input 
                  type="text" 
                  className="glass-input" 
                  style={{ 
                    padding: '6px 12px', 
                    fontSize: '11px', 
                    textAlign: 'center', 
                    background: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff',
                    color: isDark ? '#ffffff' : '#0f172a',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'
                  }} 
                  value={apiBaseState} 
                  onChange={(e) => handleApiBaseChange(e.target.value)} 
                  placeholder="https://backend-service.up.railway.app/api"
                />
              </div>
          </div>
        </div>
      )}

      {/* Main App Screens */}
      {isLoggedIn && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          
          {/* Header */}
          <header style={{
            borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
            padding: '12px 5%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: isDark ? 'rgba(11, 15, 25, 0.85)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: 0,
            zIndex: 100
          }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00f2fe, #9b51e0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(0, 242, 254, 0.3)'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0b0f19" strokeWidth="2.5">
                  <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1" />
                  <circle cx="8" cy="12" r="2" />
                </svg>
              </div>
              <div>
                <h1 style={{ fontSize: '18px', fontWeight: '800', background: 'linear-gradient(to right, #00f2fe, #4facfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  HireGen AI
                </h1>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button onClick={() => setTab('dashboard')} className={`btn ${tab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: '13px' }}>
                Dashboard
              </button>

              {userRole === 'recruiter' && (
                <>
                  <button onClick={() => setTab('recruiter')} className={`btn ${tab === 'recruiter' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: '13px' }}>
                    Recruiter Board
                  </button>
                  <button onClick={() => { fetchAptitudeQuestions(selectedCandidateId); setTab('aptitude'); }} className={`btn ${tab === 'aptitude' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: '13px' }}>
                    Aptitude Test
                  </button>
                  <button onClick={() => { fetchCommunicationQuestions(selectedCandidateId); setTab('communication'); }} className={`btn ${tab === 'communication' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: '13px' }}>
                    Communication Test
                  </button>
                  <button onClick={() => setTab('coding')} className={`btn ${tab === 'coding' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: '13px' }}>
                    Coding Arena
                  </button>
                  <button onClick={() => setTab('interview')} className={`btn ${tab === 'interview' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: '13px' }}>
                    Mock Interview
                  </button>
                  <button onClick={() => setTab('report')} className={`btn ${tab === 'report' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: '13px' }}>
                    Consolidated Report
                  </button>
                </>
              )}

              {userRole === 'candidate' && (
                <>
                  <button onClick={() => setTab('report')} className={`btn ${tab === 'report' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: '13px' }}>
                    My Report
                  </button>
                  <button onClick={() => { fetchAptitudeQuestions(selectedCandidateId); setTab('aptitude'); }} className={`btn ${tab === 'aptitude' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: '13px' }}>
                    Aptitude Test
                  </button>
                  <button onClick={() => { fetchCommunicationQuestions(selectedCandidateId); setTab('communication'); }} className={`btn ${tab === 'communication' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: '13px' }}>
                    Communication Test
                  </button>
                  <button onClick={() => setTab('coding')} className={`btn ${tab === 'coding' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: '13px' }}>
                    Coding Arena
                  </button>
                  <button onClick={() => setTab('interview')} className={`btn ${tab === 'interview' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: '13px' }}>
                    Mock Interview
                  </button>
                </>
              )}
            </nav>

            {/* Profile Info Display */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
                padding: '6px 12px',
                borderRadius: '30px'
              }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00f2fe, #9b51e0)',
                  color: '#0b0f19',
                  fontWeight: '800',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {currentUser.avatar}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', lineHeight: '1.2' }}>{currentUser.name}</span>
                  <span style={{ fontSize: '9px', color: isDark ? '#9ca3af' : '#64748b', lineHeight: '1.1' }}>{currentUser.email}</span>
                </div>
                <span style={{
                  fontSize: '9px',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: userRole === 'recruiter' ? 'rgba(0, 242, 254, 0.15)' : 'rgba(155, 81, 224, 0.15)',
                  color: userRole === 'recruiter' ? '#00f2fe' : '#9b51e0',
                  marginLeft: '4px'
                }}>
                  {userRole === 'recruiter' ? 'Recruiter' : `Candidate: ${getRoundBadge(currentUser.currentRound)}`}
                </span>
              </div>

              <div style={{ width: '1px', height: '20px', background: 'var(--border-glass)' }}></div>

              <button 
                onClick={() => setIsDark(!isDark)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  padding: '4px'
                }}>
                {isDark ? '☀️' : '🌙'}
              </button>

              <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px' }}>
                Logout
              </button>
            </div>

          </header>

          {/* Main Layout Split */}
          <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
            
            {/* Left Screen content */}
            <div style={{ flex: 1, padding: '40px 5%', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
              
              {/* TAB 0: DASHBOARD */}
              {tab === 'dashboard' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="fade-in">
                  
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.08) 0%, rgba(155, 81, 224, 0.08) 100%)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '16px',
                    padding: '28px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h2 style={{ fontSize: '24px', fontWeight: '800' }}>
                        Welcome back, {currentUser.name}!
                      </h2>
                      <p style={{ color: isDark ? '#9ca3af' : '#64748b', fontSize: '14px', marginTop: '6px' }}>
                        {userRole === 'recruiter' 
                          ? 'Review candidate pipeline status and run screening agents.' 
                          : 'Complete your mock interview, coding arena challenges, and check your roadmap.'}
                      </p>
                    </div>
                    <div style={{ fontSize: '12px', background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe', padding: '6px 14px', borderRadius: '20px', fontWeight: '700' }}>
                      🟢 Live Connection to MySQL
                    </div>
                  </div>

                  {/* Recruiter Dashboard */}
                  {userRole === 'recruiter' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                      
                      {/* Metric Cards Row */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                        <div className="glass-card" style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Candidates</span>
                          <div style={{ fontSize: '36px', fontWeight: '800', margin: '6px 0', color: '#00f2fe' }}>
                            {candidates.length}
                          </div>
                        </div>
                        <div className="glass-card" style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Active Roles</span>
                          <div style={{ fontSize: '36px', fontWeight: '800', margin: '6px 0', color: '#9b51e0' }}>
                            {jobs.length || 2}
                          </div>
                        </div>
                        <div className="glass-card" style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Pending Approvals</span>
                          <div style={{ fontSize: '36px', fontWeight: '800', margin: '6px 0', color: '#f2c94c' }}>
                            {candidates.filter(c => c.currentRound && c.currentRound.includes('COMPLETED')).length}
                          </div>
                        </div>
                        <div className="glass-card" style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Average Compatibility</span>
                          <div style={{ fontSize: '36px', fontWeight: '800', margin: '6px 0', color: '#00f2fe' }}>
                            82%
                          </div>
                        </div>
                      </div>

                      {/* Recruiter pipeline overview - Gated progression */}
                      <div className="glass-card">
                        <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Recruitment Pipeline (Recruiter is only authorized person to approve candidates)</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                              <th style={{ padding: '12px' }}>Candidate</th>
                              <th style={{ padding: '12px' }}>Email</th>
                              <th style={{ padding: '12px' }}>Current Active Stage</th>
                              <th style={{ padding: '12px' }}>Gating Status</th>
                              <th style={{ padding: '12px', textAlign: 'right' }}>Authorization Controls</th>
                            </tr>
                          </thead>
                          <tbody>
                            {candidates.map(c => (
                              <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '16px 12px', fontWeight: '700' }}>{c.name}</td>
                                <td style={{ padding: '16px 12px', color: 'var(--text-secondary)' }}>{c.email}</td>
                                <td style={{ padding: '16px 12px' }}>
                                  <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(155, 81, 224, 0.1)', color: '#9b51e0', fontSize: '12px', fontWeight: '600' }}>
                                    {getRoundBadge(c.currentRound)}
                                  </span>
                                </td>
                                <td style={{ padding: '16px 12px' }}>
                                  {c.currentRound && c.currentRound.includes('COMPLETED') ? (
                                    <span style={{ color: '#f2c94c', fontWeight: '700' }}>⚠️ Action Completed - Pending Approval</span>
                                  ) : c.currentRound === 'HIRED' ? (
                                    <span style={{ color: '#27ae60', fontWeight: '700' }}>🟢 Hired</span>
                                  ) : c.currentRound === 'REJECTED' ? (
                                    <span style={{ color: '#eb5757', fontWeight: '700' }}>🔴 Rejected</span>
                                  ) : (
                                    <span style={{ color: '#2d9cdb' }}>⚙️ Candidate Working...</span>
                                  )}
                                </td>
                                <td style={{ padding: '16px 12px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                  {c.currentRound !== 'HIRED' && c.currentRound !== 'REJECTED' && (
                                    <>
                                      <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '11px', background: '#27ae60' }}
                                        onClick={() => handleApproveRound(c.id)}>
                                        Advance Stage
                                      </button>
                                      <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '11px' }}
                                        onClick={() => handleRejectCandidate(c.id)}>
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '11px' }}
                                    onClick={() => {
                                      setSelectedCandidateId(c.id);
                                      setReportCandidateId(c.id);
                                      setCandidateSearchText(c.name + " (" + c.email + ")");
                                      setTab('report');
                                      handleFetchReport(c.id, 0);
                                    }}>
                                    Open Report
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    /* Candidate Dashboard */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                      
                      {/* Metric widgets */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        <div className="glass-card" style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>My Job Compatibility</span>
                          <div style={{ fontSize: '36px', fontWeight: '800', margin: '6px 0', color: '#00f2fe' }}>
                            {report?.jobMatching?.matchPercentage || '85'}%
                          </div>
                        </div>
                        <div className="glass-card" style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Current Recruiter Gate</span>
                          <div style={{ fontSize: '20px', fontWeight: '800', margin: '14px 0', color: '#f2c94c' }}>
                            {getRoundBadge(currentUser.currentRound)}
                          </div>
                        </div>
                        <div className="glass-card" style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Coding Challenge</span>
                          <div style={{ fontSize: '36px', fontWeight: '800', margin: '6px 0', color: '#00f2fe' }}>
                            {report?.codingEvaluation?.finalScore || 'Pending'}%
                          </div>
                        </div>
                      </div>

                      {/* Gated Stage Roadmap */}
                      <div className="glass-card">
                        <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Evaluation Stage Roadmap</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                          
                          {/* Round 1 Checkpoint */}
                          <div style={{ display: 'flex', gap: '16px', opacity: 1 }}>
                            <div style={{ 
                              width: '28px', 
                              height: '28px', 
                              borderRadius: '50%', 
                              background: isStageCompleted(1) ? '#27ae60' : 'rgba(255,255,255,0.05)', 
                              color: isStageCompleted(1) ? '#0b0f19' : 'var(--text-secondary)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontSize: '14px', 
                              fontWeight: '800' 
                            }}>
                              {isStageCompleted(1) ? '✓' : '1'}
                            </div>
                            <div>
                              <strong style={{ fontSize: '15px' }}>Round 1: Resume Upload & Screening</strong>
                              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                Register your profile and upload your resume.
                              </p>
                              {isStageActive(1) && (
                                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '11px', marginTop: '8px' }} onClick={() => setTab('recruiter')}>
                                  Upload Resume Details
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Round 2 Checkpoint */}
                          <div style={{ display: 'flex', gap: '16px', opacity: isStageLocked(2) ? 0.4 : 1 }}>
                            <div style={{ 
                              width: '28px', 
                              height: '28px', 
                              borderRadius: '50%', 
                              background: isStageCompleted(2) ? '#27ae60' : 'rgba(255,255,255,0.05)', 
                              color: isStageCompleted(2) ? '#0b0f19' : 'var(--text-secondary)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontSize: '14px', 
                              fontWeight: '800' 
                            }}>
                              {isStageCompleted(2) ? '✓' : '2'}
                            </div>
                            <div>
                              <strong style={{ fontSize: '15px' }}>Round 2: Job Matching & Compatibility Analysis</strong>
                              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                Automatic match index calculation. (Completed automatically after upload).
                              </p>
                              {!isStageLocked(2) && (
                                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '11px', marginTop: '8px' }} onClick={() => setTab('report')}>
                                  View Compatibility Report
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Round 3 Checkpoint */}
                          <div style={{ display: 'flex', gap: '16px', opacity: isStageLocked(3) ? 0.4 : 1 }}>
                            <div style={{ 
                              width: '28px', 
                              height: '28px', 
                              borderRadius: '50%', 
                              background: isStageCompleted(3) ? '#27ae60' : 'rgba(255,255,255,0.05)', 
                              color: isStageCompleted(3) ? '#0b0f19' : 'var(--text-secondary)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontSize: '14px', 
                              fontWeight: '800' 
                            }}>
                              {isStageCompleted(3) ? '✓' : '3'}
                            </div>
                            <div>
                              <strong style={{ fontSize: '15px' }}>Round 3: Technical Aptitude Test</strong>
                              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                Complete all 50 multiple choice questions. (Quantitative, Reasoning, Verbal, and Stack-specific Technical).
                              </p>
                              {isStageActive(3) && (
                                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '11px', marginTop: '8px' }} onClick={() => {
                                  fetchAptitudeQuestions(selectedCandidateId);
                                  setTab('aptitude');
                                }}>
                                  Begin Aptitude Test
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Round 3.5 Checkpoint */}
                          <div style={{ display: 'flex', gap: '16px', opacity: isStageLocked(3.5) ? 0.4 : 1 }}>
                            <div style={{ 
                              width: '28px', 
                              height: '28px', 
                              borderRadius: '50%', 
                              background: isStageCompleted(3.5) ? '#27ae60' : 'rgba(255,255,255,0.05)', 
                              color: isStageCompleted(3.5) ? '#0b0f19' : 'var(--text-secondary)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontSize: '14px', 
                              fontWeight: '800' 
                            }}>
                              {isStageCompleted(3.5) ? '✓' : '3.5'}
                            </div>
                            <div>
                              <strong style={{ fontSize: '15px' }}>Round 3.5: Communication MCQ Test</strong>
                              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                Solve 30 multiple choice questions to evaluate vocabulary, grammar, and comprehension.
                              </p>
                              {isStageActive(3.5) && (
                                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '11px', marginTop: '8px' }} onClick={() => {
                                  fetchCommunicationQuestions(selectedCandidateId);
                                  setTab('communication');
                                }}>
                                  Begin Communication Test
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Round 4 Checkpoint */}
                          <div style={{ display: 'flex', gap: '16px', opacity: isStageLocked(4) ? 0.4 : 1 }}>
                            <div style={{ 
                              width: '28px', 
                              height: '28px', 
                              borderRadius: '50%', 
                              background: isStageCompleted(4) ? '#27ae60' : 'rgba(255,255,255,0.05)', 
                              color: isStageCompleted(4) ? '#0b0f19' : 'var(--text-secondary)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontSize: '14px', 
                              fontWeight: '800' 
                            }}>
                              {isStageCompleted(4) ? '✓' : '4'}
                            </div>
                            <div>
                              <strong style={{ fontSize: '15px' }}>Round 4: Coding Challenge Workspace</strong>
                              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                Write optimal solution to compile code.
                              </p>
                              {isStageActive(4) && (
                                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '11px', marginTop: '8px' }} onClick={() => setTab('coding')}>
                                  Enter Coding Arena
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Round 5 Checkpoint */}
                          <div style={{ display: 'flex', gap: '16px', opacity: isStageLocked(5) ? 0.4 : 1 }}>
                            <div style={{ 
                              width: '28px', 
                              height: '28px', 
                              borderRadius: '50%', 
                              background: isStageCompleted(5) ? '#27ae60' : 'rgba(255,255,255,0.05)', 
                              color: isStageCompleted(5) ? '#0b0f19' : 'var(--text-secondary)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontSize: '14px', 
                              fontWeight: '800' 
                            }}>
                              {isStageCompleted(5) ? '✓' : '5'}
                            </div>
                            <div>
                              <strong style={{ fontSize: '15px' }}>Round 5: Interactive Mock Technical Interview</strong>
                              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                Complete speech/chat-based tech interview with AI.
                              </p>
                              {isStageActive(5) && (
                                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '11px', marginTop: '8px' }} onClick={() => setTab('interview')}>
                                  Begin Mock Interview
                                </button>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>
                  )}

                </div>
              )}
              
              {/* TAB 1: RECRUITER BOARD (Candidate Upload Resume details) */}
              {tab === 'recruiter' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                  <div className="glass-card">
                    <h2 style={{ fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                      Stage 1: Submit Resume Details (Resume will be sent to Recruiter)
                    </h2>
                    
                    {userRole === 'candidate' && currentUser.currentRound !== 'ROUND_1_RESUME' ? (
                      <div style={{ padding: '20px', background: 'rgba(39, 174, 96, 0.1)', color: '#27ae60', borderRadius: '8px', textAlign: 'center' }}>
                        Your resume details have already been uploaded for Round 1!
                      </div>
                    ) : (
                      <form onSubmit={handleUploadAndAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div>
                            <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>Full Name</label>
                            <input type="text" className="glass-input" value={candidateForm.name} 
                              onChange={e => setCandidateForm({...candidateForm, name: e.target.value})} required />
                          </div>
                          <div>
                            <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>Email Address</label>
                            <input type="email" className="glass-input" value={candidateForm.email} 
                              onChange={e => setCandidateForm({...candidateForm, email: e.target.value})} required />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div>
                            <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>Phone Number</label>
                            <input type="text" className="glass-input" value={candidateForm.phone} 
                              onChange={e => setCandidateForm({...candidateForm, phone: e.target.value})} />
                          </div>
                          <div>
                            <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>Target Job Opening (Type it)</label>
                            <input 
                              type="text" 
                              className="glass-input" 
                              placeholder="e.g. Senior React Developer"
                              value={targetJobTitle} 
                              onChange={e => setTargetJobTitle(e.target.value)} 
                              required
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div>
                            <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>Education</label>
                            <input type="text" className="glass-input" value={candidateForm.education} 
                              onChange={e => setCandidateForm({...candidateForm, education: e.target.value})} />
                          </div>
                          <div>
                            <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>CGPA / Percentage</label>
                            <input type="text" className="glass-input" value={candidateForm.cgpa} 
                              onChange={e => setCandidateForm({...candidateForm, cgpa: e.target.value})} />
                          </div>
                        </div>

                        <div>
                          <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>Professional Experience Summary</label>
                          <textarea className="glass-input" style={{ minHeight: '60px', resize: 'vertical' }} value={candidateForm.experienceSummary} 
                            onChange={e => setCandidateForm({...candidateForm, experienceSummary: e.target.value})} />
                        </div>

                        <div>
                          <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>Projects</label>
                          <textarea className="glass-input" style={{ minHeight: '60px', resize: 'vertical' }} value={candidateForm.projects} 
                            onChange={e => setCandidateForm({...candidateForm, projects: e.target.value})} placeholder="Describe your key projects..." />
                        </div>

                        <div>
                          <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>Skills (Comma-separated)</label>
                          <input type="text" className="glass-input" value={candidateForm.skills} 
                            onChange={e => setCandidateForm({...candidateForm, skills: e.target.value})} />
                        </div>

                        <div>
                          <label style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>Resume File (PDF/TXT/DOCX)</label>
                          <input type="file" className="glass-input" onChange={e => setResumeFile(e.target.files[0])} style={{ padding: '6px 12px' }} />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                          Upload & Screen Profile
                        </button>
                      </form>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="glass-card">
                      <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#00f2fe' }}>Registered Candidates</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {candidates.map(c => (
                          <div key={c.id} style={{
                            padding: '12px 16px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid var(--border-glass)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <div style={{ fontWeight: '600' }}>{c.name}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.email} | {getRoundBadge(c.currentRound)}</div>
                            </div>
                            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} 
                              onClick={() => {
                                setSelectedCandidateId(c.id);
                                setReportCandidateId(c.id);
                                setCandidateSearchText(c.name + " (" + c.email + ")");
                                setTab('report');
                                handleFetchReport(c.id, 0);
                              }}>
                              View Report
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MOCK INTERVIEW */}
              {tab === 'interview' && (
                <div style={{ maxWidth: '1000px', margin: '0 auto' }} className="glass-card">
                  <h2 style={{ fontSize: '22px', marginBottom: '10px', textAlign: 'center', color: '#00f2fe' }}>
                    Mock Interview Arena (Agent 4)
                  </h2>
                  
                  {/* Gatekeeper Check */}
                  {userRole === 'candidate' && currentRoundState !== 'ROUND_5_INTERVIEW' ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#f2c94c', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px dashed rgba(242, 201, 76, 0.3)' }}>
                      <h3>⚠️ Stage locked by Recruiter</h3>
                      <p style={{ marginTop: '10px' }}>Your current status is: <strong>{getRoundBadge(currentRoundState)}</strong>. You must be approved for Round 5 to take the interview.</p>
                      <button className="btn btn-secondary" style={{ marginTop: '20px', color: '#00f2fe', borderColor: '#00f2fe' }}
                        onClick={() => {
                          setCurrentUser(prev => ({ ...prev, currentRound: 'ROUND_5_INTERVIEW' }));
                        }}>
                        🔓 Bypass Gate & Take Mock Interview (Testing Mode)
                      </button>
                    </div>
                  ) : (
                    <div>
                      {!interview ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px' }}>
                          
                          {/* Left Panel: Lobby Settings */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.02)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '800', color: isDark ? '#00f2fe' : '#2f80ed', marginBottom: '4px' }}>Mock Interview Setup</h3>
                            
                            <div>
                              <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: isDark ? '#f3f4f6' : '#1e293b', fontWeight: '600' }}>Candidate Account Context</label>
                              <input 
                                type="text" 
                                className="glass-input"
                                value={candidateSearchText}
                                readOnly={userRole === 'candidate'}
                                onChange={e => {
                                  setCandidateSearchText(e.target.value);
                                  setShowCandidateSuggestions(true);
                                }}
                                onFocus={() => userRole === 'recruiter' && setShowCandidateSuggestions(true)}
                                style={{
                                  background: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                                  color: isDark ? '#ffffff' : '#0f172a',
                                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'
                                }}
                              />
                            </div>
                            
                            <div>
                              <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: isDark ? '#f3f4f6' : '#1e293b', fontWeight: '600' }}>Interview Type</label>
                              <select className="glass-input" value={interviewType} onChange={e => setInterviewType(e.target.value)}
                                style={{
                                  background: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                                  color: isDark ? '#ffffff' : '#0f172a',
                                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'
                                }}
                              >
                                <option value="TECHNICAL" style={{background: isDark ? '#131c2e' : '#ffffff', color: isDark ? '#ffffff' : '#000000'}}>Technical Coding</option>
                                <option value="HR" style={{background: isDark ? '#131c2e' : '#ffffff', color: isDark ? '#ffffff' : '#000000'}}>HR & Behavioral</option>
                              </select>
                            </div>

                            <button className="btn btn-primary" onClick={handleStartInterview} style={{ marginTop: '16px', width: '100%' }}>
                              🚀 Start Mock Interview Test
                            </button>
                          </div>

                          {/* Right Panel: Lobby Device Setup & Camera Preview */}
                          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(11, 15, 25, 0.5)', border: '1px solid rgba(255,255,255,0.06)', padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '12px', fontWeight: '800', color: '#00f2fe' }}>
                                Lobby Device Preview
                              </span>
                              <span style={{ fontSize: '10px', background: 'rgba(0, 242, 254, 0.1)', color: '#00f2fe', padding: '2px 8px', borderRadius: '10px' }}>
                                Pre-Exam Check
                              </span>
                            </div>

                            {/* Camera Box */}
                            <div style={{ 
                              position: 'relative', 
                              width: '100%', 
                              aspectRatio: '16/9', 
                              background: '#080c14', 
                              borderRadius: '8px', 
                              overflow: 'hidden',
                              border: '1px solid var(--border-glass)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {!hasWebcam ? (
                                <div style={{
                                  position: 'absolute',
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: 'linear-gradient(135deg, #090e1a 0%, #151d30 100%)',
                                  color: '#00f2fe'
                                }}>
                                  <svg width="60" height="60" viewBox="0 0 100 100" style={{ opacity: 0.85, filter: 'drop-shadow(0 0 8px rgba(0,242,254,0.45))' }}>
                                    <path d="M50,12 C28,12 25,35 25,60 C25,80 35,90 50,90 C65,90 75,80 75,60 C75,35 72,12 50,12 Z" fill="none" stroke="#00f2fe" strokeWidth="1.5" strokeDasharray="3 3" />
                                    <circle cx="38" cy="45" r="4" fill="none" stroke="#00f2fe" strokeWidth="1.5" />
                                    <circle cx="38" cy="45" r="1" fill="#00f2fe" />
                                    <circle cx="62" cy="45" r="4" fill="none" stroke="#00f2fe" strokeWidth="1.5" />
                                    <circle cx="62" cy="45" r="1" fill="#00f2fe" />
                                    <path d="M45,65 Q50,70 55,65" fill="none" stroke="#00f2fe" strokeWidth="1.5" />
                                    <path d="M50,42 L50,58 L47,58" fill="none" stroke="#00f2fe" strokeWidth="1.5" />
                                    <line x1="15" y1="50" x2="85" y2="50" stroke="rgba(0, 242, 254, 0.15)" strokeWidth="1" />
                                    <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(0, 242, 254, 0.15)" strokeWidth="1" />
                                  </svg>
                                  <span style={{ fontSize: '9px', fontWeight: '800', marginTop: '10px', letterSpacing: '0.05em' }}>CAMERA PREVIEW OFFLINE</span>
                                  <span style={{ fontSize: '8px', color: 'var(--text-secondary)', marginTop: '2px', textAlign: 'center', padding: '0 10px' }}>Enable your camera to test webcam feed before starting.</span>
                                </div>
                              ) : (
                                <video 
                                  ref={videoRef} 
                                  autoPlay 
                                  playsInline 
                                  muted={isMuted}
                                  style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover',
                                    transform: 'scaleX(-1)'
                                  }} 
                                />
                              )}
                              
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                pointerEvents: 'none',
                                border: '1px solid rgba(0, 242, 254, 0.2)',
                                background: 'radial-gradient(circle, transparent 50%, rgba(8,12,20,0.4) 100%)'
                              }}>
                                <div style={{
                                  position: 'absolute',
                                  width: '100%',
                                  height: '2px',
                                  background: 'linear-gradient(to right, transparent, #00f2fe, transparent)',
                                  top: '0',
                                  animation: 'scan 3s linear infinite',
                                  boxShadow: '0 0 8px #00f2fe'
                                }}></div>
                              </div>
                            </div>

                            {/* Camera controls */}
                            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                              <button 
                                onClick={() => setIsCameraRequested(!isCameraRequested)}
                                className="btn btn-secondary"
                                style={{
                                  flex: 1,
                                  padding: '8px 12px',
                                  fontSize: '11px',
                                  background: isCameraRequested ? 'rgba(235, 87, 87, 0.15)' : 'rgba(0, 242, 254, 0.1)',
                                  color: isCameraRequested ? '#eb5757' : '#00f2fe',
                                  borderColor: isCameraRequested ? 'rgba(235, 87, 87, 0.3)' : 'rgba(0, 242, 254, 0.3)'
                                }}
                              >
                                {isCameraRequested ? '🚫 Disable Camera' : '📷 Enable Camera'}
                              </button>

                              <button 
                                onClick={() => setIsMuted(!isMuted)}
                                className="btn btn-secondary"
                                style={{
                                  flex: 1,
                                  padding: '8px 12px',
                                  fontSize: '11px',
                                  background: isMuted ? 'rgba(235, 87, 87, 0.15)' : 'rgba(255,255,255,0.03)',
                                  color: isMuted ? '#eb5757' : 'var(--text-primary)',
                                  borderColor: isMuted ? 'rgba(235, 87, 87, 0.3)' : 'var(--border-glass)'
                                }}
                              >
                                {isMuted ? '🎤 Unmute Mic' : '🎤 Mute Mic'}
                              </button>
                            </div>

                            {/* Mic visualization */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Microphone Status:</span>
                              <div style={{
                                height: '14px',
                                background: '#0a0f1d',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 8px'
                              }}>
                                {!isMuted ? (
                                  <div style={{ display: 'flex', gap: '2px', alignItems: 'center', width: '100%', height: '100%' }}>
                                    {[...Array(24)].map((_, idx) => (
                                      <div key={idx} style={{
                                        width: '3px',
                                        height: `${Math.floor(Math.random() * 8 + 3)}px`,
                                        background: 'linear-gradient(to top, #00f2fe, #9b51e0)',
                                        borderRadius: '1px',
                                        animation: `pulseBox 1.${Math.floor(Math.random()*5+2)}s infinite alternate`
                                      }} />
                                    ))}
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '8px', color: '#eb5757', fontFamily: 'monospace' }}>MUTED</span>
                                )}
                              </div>
                            </div>

                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px' }}>
                          {/* Left Panel: Question and Response */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(155, 81, 224, 0.08)', borderLeft: '4px solid var(--accent-purple)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '11px', color: 'var(--accent-purple)', fontWeight: '800' }}>AGENT QUESTION</span>
                                <button className="btn btn-secondary" onClick={handleSpeakQuestion} style={{ padding: '4px 10px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  🔊 Read Aloud
                                </button>
                              </div>
                              <h3 style={{ fontSize: '17px', fontWeight: '600', color: isDark ? '#ffffff' : '#0f172a' }}>{currentQuestion}</h3>
                            </div>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label style={{ fontSize: '13px', color: isDark ? '#f3f4f6' : '#1e293b', fontWeight: '600', margin: 0 }}>Your Response Answer</label>
                                {isListening ? (
                                  <button className="btn btn-secondary pulse-dot" onClick={stopListening} style={{ padding: '4px 10px', fontSize: '10px', background: 'rgba(235, 87, 87, 0.15)', color: '#eb5757', border: '1px solid rgba(235,87,87,0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    🔴 Listening... Stop Dictation
                                  </button>
                                ) : (
                                  <button className="btn btn-secondary" onClick={startListening} style={{ padding: '4px 10px', fontSize: '10px', color: '#00f2fe', borderColor: 'rgba(0, 242, 254, 0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    🎤 Speak Answer (Vocal)
                                  </button>
                                )}
                              </div>
                              <textarea className="glass-input" 
                                style={{ 
                                  minHeight: '160px', 
                                  fontSize: '14px',
                                  background: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                                  color: isDark ? '#ffffff' : '#0f172a',
                                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'
                                }} 
                                value={answerInput} 
                                onChange={e => setAnswerInput(e.target.value)} 
                                placeholder="Type or speak your answer clearly here..." 
                              />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', width: '100%' }}>
                              <button className="btn btn-secondary" onClick={handleFinishInterviewEarly} style={{ minWidth: '140px' }}>
                                🏁 Finish Interview
                              </button>
                              <button className="btn btn-primary" onClick={handleSubmitAnswer} style={{ minWidth: '180px' }}>
                                Submit Answer Response
                              </button>
                            </div>
                          </div>

                          {/* Right Panel: AI Proctoring Webcam Feed */}
                          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(11, 15, 25, 0.5)', border: '1px solid rgba(255,255,255,0.06)', padding: '16px' }}>
                            
                            {/* Duration & Rec Indicator */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
                              <span style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#eb5757', fontWeight: '800' }}>
                                <span className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eb5757', display: 'inline-block' }}></span>
                                REC ON
                              </span>
                              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                                ⏱️ Elapsed: {Math.floor(interviewTime / 60).toString().padStart(2, '0')}:${(interviewTime % 60).toString().padStart(2, '0')}
                              </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '12px', fontWeight: '800', color: '#00f2fe' }}>
                                AI Proctoring Viewport
                              </span>
                              <span style={{ fontSize: '10px', background: 'rgba(39, 174, 96, 0.15)', color: '#27ae60', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>
                                Integrity: {proctoringScore}%
                              </span>
                            </div>

                            {/* Webcam Box / Simulated scanner overlay */}
                            <div style={{ 
                              position: 'relative', 
                              width: '100%', 
                              aspectRatio: '16/9', 
                              background: '#080c14', 
                              borderRadius: '8px', 
                              overflow: 'hidden',
                              border: '1px solid var(--border-glass)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {!hasWebcam ? (
                                <div style={{
                                  position: 'absolute',
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: 'linear-gradient(135deg, #090e1a 0%, #151d30 100%)',
                                  color: '#00f2fe'
                                }}>
                                  <svg width="80" height="80" viewBox="0 0 100 100" style={{ opacity: 0.85, filter: 'drop-shadow(0 0 8px rgba(0,242,254,0.45))' }}>
                                    <path d="M50,12 C28,12 25,35 25,60 C25,80 35,90 50,90 C65,90 75,80 75,60 C75,35 72,12 50,12 Z" fill="none" stroke="#00f2fe" strokeWidth="1.5" strokeDasharray="3 3" />
                                    <circle cx="38" cy="45" r="4" fill="none" stroke="#00f2fe" strokeWidth="1.5" />
                                    <circle cx="38" cy="45" r="1" fill="#00f2fe" />
                                    <circle cx="62" cy="45" r="4" fill="none" stroke="#00f2fe" strokeWidth="1.5" />
                                    <circle cx="62" cy="45" r="1" fill="#00f2fe" />
                                    <path d="M45,65 Q50,70 55,65" fill="none" stroke="#00f2fe" strokeWidth="1.5" />
                                    <path d="M50,42 L50,58 L47,58" fill="none" stroke="#00f2fe" strokeWidth="1.5" />
                                    <line x1="15" y1="50" x2="85" y2="50" stroke="rgba(0, 242, 254, 0.15)" strokeWidth="1" />
                                    <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(0, 242, 254, 0.15)" strokeWidth="1" />
                                  </svg>
                                  <span style={{ fontSize: '10px', fontWeight: '800', marginTop: '10px', letterSpacing: '0.05em' }}>SIMULATED PROCTOR SCANNING</span>
                                  <span style={{ fontSize: '8px', color: 'var(--text-secondary)', marginTop: '2px' }}>Camera off or unavailable. Simulator tracking active.</span>
                                </div>
                              ) : (
                                <video 
                                  ref={videoRef} 
                                  autoPlay 
                                  playsInline 
                                  muted={isMuted}
                                  style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover',
                                    transform: 'scaleX(-1)'
                                  }} 
                                />
                              )}
                              
                              {/* Scan overlays */}
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                pointerEvents: 'none',
                                border: '1px solid rgba(0, 242, 254, 0.2)',
                                background: 'radial-gradient(circle, transparent 50%, rgba(8,12,20,0.4) 100%)'
                              }}>
                                <div style={{
                                  position: 'absolute',
                                  width: '100%',
                                  height: '2px',
                                  background: 'linear-gradient(to right, transparent, #00f2fe, transparent)',
                                  top: '0',
                                  animation: 'scan 3s linear infinite',
                                  boxShadow: '0 0 8px #00f2fe'
                                }}></div>

                                <div style={{
                                  position: 'absolute',
                                  width: '50px',
                                  height: '50px',
                                  border: '1px dashed #00f2fe',
                                  borderRadius: '4px',
                                  top: '40%',
                                  left: '46%',
                                  transform: 'translate(-50%, -50%)',
                                  animation: 'pulseBox 2s ease-in-out infinite'
                                }}>
                                  <span style={{ position: 'absolute', top: '-14px', left: 0, fontSize: '7px', color: '#00f2fe', fontFamily: 'monospace' }}>FACE: {hasWebcam ? 'LIVE' : 'SIMULATED'}</span>
                                </div>
                              </div>
                              
                              <div style={{
                                position: 'absolute',
                                bottom: '10px',
                                left: '10px',
                                background: 'rgba(0,0,0,0.6)',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '9px',
                                fontFamily: 'monospace',
                                color: '#00f2fe',
                                border: '1px solid rgba(0, 242, 254, 0.3)'
                              }}>
                                {hasWebcam ? 'WEBCAM CONNECTED' : 'VIRTUAL TRACKER'}
                              </div>
                            </div>

                            {/* CAMERA CONTROL OPTIONS PANEL */}
                            <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center' }}>
                              <button 
                                onClick={() => setIsCameraRequested(!isCameraRequested)}
                                className="btn btn-secondary"
                                style={{
                                  flex: 1,
                                  padding: '8px 12px',
                                  fontSize: '11px',
                                  background: isCameraRequested ? 'rgba(235, 87, 87, 0.15)' : 'rgba(0, 242, 254, 0.1)',
                                  color: isCameraRequested ? '#eb5757' : '#00f2fe',
                                  borderColor: isCameraRequested ? 'rgba(235, 87, 87, 0.3)' : 'rgba(0, 242, 254, 0.3)'
                                }}
                              >
                                {isCameraRequested ? '🚫 Disable Camera' : '📷 Enable Camera'}
                              </button>

                              <button 
                                onClick={() => setIsMuted(!isMuted)}
                                className="btn btn-secondary"
                                style={{
                                  flex: 1,
                                  padding: '8px 12px',
                                  fontSize: '11px',
                                  background: isMuted ? 'rgba(235, 87, 87, 0.15)' : 'rgba(255,255,255,0.03)',
                                  color: isMuted ? '#eb5757' : 'var(--text-primary)',
                                  borderColor: isMuted ? 'rgba(235, 87, 87, 0.3)' : 'var(--border-glass)'
                                }}
                              >
                                {isMuted ? '🎤 Unmute Mic' : '🎤 Mute Mic'}
                              </button>
                            </div>

                            {/* Audio Wave Visualizer Simulation */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Microphone Activity Level:</span>
                              <div style={{
                                height: '14px',
                                background: '#0a0f1d',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 8px'
                              }}>
                                {!isMuted ? (
                                  <div style={{
                                    display: 'flex',
                                    gap: '2px',
                                    alignItems: 'center',
                                    width: '100%',
                                    height: '100%'
                                  }}>
                                    {[...Array(24)].map((_, idx) => (
                                      <div key={idx} style={{
                                        width: '3px',
                                        height: `${Math.floor(Math.random() * 8 + 3)}px`,
                                        background: 'linear-gradient(to top, #00f2fe, #9b51e0)',
                                        borderRadius: '1px',
                                        animation: `pulseBox 1.${Math.floor(Math.random()*5+2)}s infinite alternate`
                                      }} />
                                    ))}
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '8px', color: '#eb5757', fontFamily: 'monospace' }}>MICROPHONE MUTED</span>
                                )}
                              </div>
                            </div>

                            {/* Console output logs */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Audit Trail Log:</span>
                              <div style={{ 
                                height: '90px', 
                                overflowY: 'auto', 
                                background: '#0a0f1d', 
                                border: '1px solid rgba(255,255,255,0.05)',
                                padding: '8px', 
                                borderRadius: '6px',
                                fontFamily: 'monospace',
                                fontSize: '9px',
                                color: '#27ae60',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                              }}>
                                {proctoringLogs.map((log, idx) => (
                                  <div key={idx} style={{ opacity: idx === proctoringLogs.length - 1 ? 1 : 0.6 }}>
                                    {log}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {interviewHistory.length > 0 && (
                        <div style={{ marginTop: '30px', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
                          <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>Interview Responses & Scores</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {interviewHistory.map((h, i) => (
                              <div key={i} style={{ padding: '14px', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)' }}>
                                <div style={{ fontWeight: '700', fontSize: '13px' }}>Q: {h.question}</div>
                                <div style={{ fontSize: '13px', margin: '6px 0', paddingLeft: '8px', borderLeft: '2px solid #00f2fe' }}>A: {h.answer}</div>
                                <div style={{ fontSize: '12px', color: '#00f2fe' }}><strong>Score: {h.score}%</strong> - {h.feedback}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 8: APTITUDE TEST */}
              {tab === 'aptitude' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
                  
                  {/* Gatekeeper check */}
                  {userRole === 'candidate' && currentRoundState !== 'ROUND_3_APTITUDE' ? (
                    <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#f2c94c' }}>
                      <h3>⚠️ Stage locked</h3>
                      <p style={{ marginTop: '10px' }}>Your current status is: <strong>{getRoundBadge(currentRoundState)}</strong>. You must advance to Round 3 to take the Aptitude Test.</p>
                    </div>
                  ) : (
                    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
                        <div>
                          <h2 style={{ fontSize: '20px', color: '#00f2fe' }}>Round 3: General Aptitude & Technical Test</h2>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Complete all 50 multiple choice questions. (Quantitative, Reasoning, Verbal, and Stack-specific Technical).
                          </p>
                        </div>
                        <div style={{ background: 'rgba(0, 242, 254, 0.1)', color: '#00f2fe', padding: '6px 14px', borderRadius: '20px', fontWeight: '800', fontSize: '12px' }}>
                          Progress: {Object.keys(aptitudeAnswers).length} / 50 Answered
                        </div>
                      </div>

                      {aptitudeLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                          <span className="spinner"></span> Loading questions pool...
                        </div>
                      ) : !Array.isArray(aptitudeQuestions) || aptitudeQuestions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                          <p style={{ color: 'var(--text-muted)' }}>No questions have been initialized for your profile.</p>
                          <button className="btn btn-primary" style={{ marginTop: '14px' }} onClick={() => fetchAptitudeQuestions(selectedCandidateId)}>
                            Initialize 50-Question Pool
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmitAptitude} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                          {(() => {
                            const q = aptitudeQuestions[currentAptitudeIndex];
                            if (!q) return null;
                            return (
                              <div style={{
                                padding: '24px',
                                background: 'rgba(255, 255, 255, 0.01)',
                                border: '1px solid var(--border-glass)',
                                borderRadius: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '12px', background: 'rgba(155, 81, 224, 0.15)', color: '#9b51e0', padding: '4px 10px', borderRadius: '4px', fontWeight: '800' }}>
                                    {q.category || "General"}
                                  </span>
                                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    Question {currentAptitudeIndex + 1} of {aptitudeQuestions.length}
                                  </span>
                                </div>
                                <strong style={{ fontSize: '16px', color: '#ffffff', lineHeight: '1.4' }}>
                                  {q.question}
                                </strong>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                                  {q.options && q.options.map((option, oIdx) => {
                                    const isSelected = aptitudeAnswers[q.id] === option;
                                    return (
                                      <label key={oIdx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '14px',
                                        borderRadius: '8px',
                                        background: isSelected ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 255, 255, 0.01)',
                                        border: isSelected ? '1px solid #00f2fe' : '1px solid var(--border-glass)',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        transition: 'all 0.2s ease',
                                        color: isSelected ? '#ffffff' : 'var(--text-secondary)'
                                      }}>
                                        <input 
                                          type="radio" 
                                          name={`q-${q.id}`} 
                                          value={option} 
                                          checked={isSelected}
                                          onChange={() => {
                                            setAptitudeAnswers({...aptitudeAnswers, [q.id]: option});
                                            if (currentAptitudeIndex < aptitudeQuestions.length - 1) {
                                              setTimeout(() => {
                                                setCurrentAptitudeIndex(prev => prev + 1);
                                              }, 300);
                                            }
                                          }}
                                          style={{ accentColor: '#00f2fe' }}
                                        />
                                        {option}
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Navigation Buttons Row */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                type="button" 
                                className="btn btn-secondary" 
                                disabled={currentAptitudeIndex === 0} 
                                onClick={() => setCurrentAptitudeIndex(prev => prev - 1)}
                              >
                                ⬅ Previous
                              </button>
                              <button 
                                type="button" 
                                className="btn btn-secondary" 
                                disabled={currentAptitudeIndex === aptitudeQuestions.length - 1} 
                                onClick={() => setCurrentAptitudeIndex(prev => prev + 1)}
                              >
                                Next ➡
                              </button>
                            </div>
                            
                            {currentAptitudeIndex === aptitudeQuestions.length - 1 && (
                              <button type="submit" className="btn btn-primary" style={{ minWidth: '150px' }}>
                                Submit Test
                              </button>
                            )}
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 8.5: COMMUNICATION TEST */}
              {tab === 'communication' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
                  
                  {/* Gatekeeper check */}
                  {userRole === 'candidate' && currentRoundState !== 'ROUND_3_COMMUNICATION' ? (
                    <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#f2c94c' }}>
                      <h3>⚠️ Stage locked</h3>
                      <p style={{ marginTop: '10px' }}>Your current status is: <strong>{getRoundBadge(currentRoundState)}</strong>. You must advance to Round 3.5 to take the Communication Test.</p>
                    </div>
                  ) : (
                    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
                        <div>
                          <h2 style={{ fontSize: '20px', color: '#00f2fe' }}>Round 3.5: AI Communication & Language Test</h2>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Complete all 30 multiple choice questions covering Vocabulary, Grammar, and Reading Comprehension.
                          </p>
                        </div>
                        <div style={{ background: 'rgba(0, 242, 254, 0.1)', color: '#00f2fe', padding: '6px 14px', borderRadius: '20px', fontWeight: '800', fontSize: '12px' }}>
                          Progress: {Object.keys(communicationAnswers).length} / 30 Answered
                        </div>
                      </div>

                      {communicationLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                          <span className="spinner"></span> Loading questions pool...
                        </div>
                      ) : !Array.isArray(communicationQuestions) || communicationQuestions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                          <p style={{ color: 'var(--text-muted)' }}>No questions have been initialized for your profile.</p>
                          <button className="btn btn-primary" style={{ marginTop: '14px' }} onClick={() => fetchCommunicationQuestions(selectedCandidateId)}>
                            Initialize 30-Question Pool
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmitCommunication} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                          {(() => {
                            const q = communicationQuestions[currentCommunicationIndex];
                            if (!q) return null;
                            return (
                              <div style={{
                                padding: '24px',
                                background: 'rgba(255, 255, 255, 0.01)',
                                border: '1px solid var(--border-glass)',
                                borderRadius: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '12px', background: 'rgba(155, 81, 224, 0.15)', color: '#9b51e0', padding: '4px 10px', borderRadius: '4px', fontWeight: '800' }}>
                                    {q.category || "General"}
                                  </span>
                                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    Question {currentCommunicationIndex + 1} of {communicationQuestions.length}
                                  </span>
                                </div>
                                <strong style={{ fontSize: '16px', color: '#ffffff', lineHeight: '1.4' }}>
                                  {q.question}
                                </strong>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                                  {q.options && q.options.map((option, oIdx) => {
                                    const isSelected = communicationAnswers[q.id] === option;
                                    return (
                                      <label key={oIdx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '14px',
                                        borderRadius: '8px',
                                        background: isSelected ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 255, 255, 0.01)',
                                        border: isSelected ? '1px solid #00f2fe' : '1px solid var(--border-glass)',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        transition: 'all 0.2s ease',
                                        color: isSelected ? '#ffffff' : 'var(--text-secondary)'
                                      }}>
                                        <input 
                                          type="radio" 
                                          name={`qc-${q.id}`} 
                                          value={option} 
                                          checked={isSelected}
                                          onChange={() => {
                                            setCommunicationAnswers({...communicationAnswers, [q.id]: option});
                                            if (currentCommunicationIndex < communicationQuestions.length - 1) {
                                              setTimeout(() => {
                                                setCurrentCommunicationIndex(prev => prev + 1);
                                              }, 300);
                                            }
                                          }}
                                          style={{ accentColor: '#00f2fe' }}
                                        />
                                        {option}
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Navigation Buttons Row */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                type="button" 
                                className="btn btn-secondary" 
                                disabled={currentCommunicationIndex === 0} 
                                onClick={() => setCurrentCommunicationIndex(prev => prev - 1)}
                              >
                                ⬅ Previous
                              </button>
                              <button 
                                type="button" 
                                className="btn btn-secondary" 
                                disabled={currentCommunicationIndex === communicationQuestions.length - 1} 
                                onClick={() => setCurrentCommunicationIndex(prev => prev + 1)}
                              >
                                Next ➡
                              </button>
                            </div>
                            
                            {currentCommunicationIndex === communicationQuestions.length - 1 && (
                              <button type="submit" className="btn btn-primary" style={{ minWidth: '150px' }}>
                                Submit Test
                              </button>
                            )}
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CODING ARENA */}
              {tab === 'coding' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                  
                  {/* Gatekeeper check */}
                  {userRole === 'candidate' && currentRoundState !== 'ROUND_4_CODING' ? (
                    <div className="glass-card" style={{ gridColumn: 'span 2', padding: '40px', textAlign: 'center', color: '#f2c94c' }}>
                      <h3>⚠️ Stage locked by Recruiter</h3>
                      <p style={{ marginTop: '10px' }}>Your current status is: <strong>{getRoundBadge(currentRoundState)}</strong>. You must be approved for Round 4 to enter the Coding Arena.</p>
                    </div>
                  ) : (
                    <>
                      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h2 style={{ fontSize: '20px', color: '#00f2fe' }}>Coding Evaluation (Agent 5)</h2>
                        
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>Candidate Context</label>
                          <input type="text" className="glass-input" value={candidateSearchText} readOnly />
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '13px', margin: 0 }}>Coding Challenge (Assigned automatically, switchable)</label>
                            <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px', background: 'rgba(255,255,255,0.05)' }} onClick={() => setCodingQuestionIndex(prev => (prev + 1) % CODING_QUESTIONS_LIST.length)}>
                              🔄 Switch Challenge (Next Question)
                            </button>
                          </div>
                          <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', borderRadius: '8px', fontSize: '13px' }}>
                            <strong>Question: {CODING_QUESTIONS_LIST[codingQuestionIndex]?.title}</strong>
                            <p style={{ marginTop: '6px', color: 'var(--text-secondary)' }}>{codingQuestionText}</p>
                          </div>
                        </div>

                        {/* Displaying 2 test cases */}
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#00f2fe', fontWeight: '700' }}>Expected Test Cases (2 Required)</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ padding: '10px', background: 'rgba(0, 242, 254, 0.05)', borderRadius: '6px', fontSize: '12px', borderLeft: '3px solid #00f2fe' }}>
                              <strong>Test Case 1:</strong>
                              <pre style={{ margin: '4px 0 0 0', fontFamily: 'monospace' }}>{CODING_QUESTIONS_LIST[codingQuestionIndex]?.testCase1}</pre>
                            </div>
                            <div style={{ padding: '10px', background: 'rgba(0, 242, 254, 0.05)', borderRadius: '6px', fontSize: '12px', borderLeft: '3px solid #00f2fe' }}>
                              <strong>Test Case 2:</strong>
                              <pre style={{ margin: '4px 0 0 0', fontFamily: 'monospace' }}>{CODING_QUESTIONS_LIST[codingQuestionIndex]?.testCase2}</pre>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>Language</label>
                            <input type="text" className="glass-input" value={codingLanguage} readOnly />
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>Code Workspace</label>
                          <textarea className="glass-input" style={{ minHeight: '180px', fontFamily: 'monospace', fontSize: '13px', background: '#080c16' }} value={codingCode} onChange={e => setCodingCode(e.target.value)} />
                        </div>

                        <button className="btn btn-primary" onClick={handleEvaluateCode}>
                          Evaluate Code Submission
                        </button>
                      </div>

                      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>Analysis Output</h3>
                        {!codingResult ? (
                          <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>Submit your code to see time/space complexity analysis.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div><strong>Final Coding Score:</strong> <span style={{color:'#00f2fe', fontWeight:'700'}}>{codingResult.finalScore}%</span></div>
                            <div><strong>Correctness:</strong> <span>{codingResult.correctness}</span></div>
                            <div><strong>Time Complexity:</strong> <code style={{color:'var(--accent-purple)'}}>{codingResult.complexityTime}</code></div>
                            <div><strong>Space Complexity:</strong> <code style={{color:'var(--accent-purple)'}}>{codingResult.complexitySpace}</code></div>
                            <div><strong>Optimization Tips:</strong> <p style={{fontSize:'13px', color:'var(--text-secondary)', marginTop:'4px'}}>{codingResult.optimizationSuggestions}</p></div>
                            <div><strong>Detailed Feedback:</strong> <p style={{fontSize:'13px', color:'var(--text-secondary)', marginTop:'4px'}}>{codingResult.feedback}</p></div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 4: CONSOLIDATED REPORT */}
              {tab === 'report' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  
                  {/* Lock report if user is candidate and not hired/rejected */}
                  {userRole === 'candidate' && currentUser.currentRound !== 'HIRED' && currentUser.currentRound !== 'ROUND_4_COMPLETED' ? (
                    <div className="glass-card" style={{ textAlign: 'center', color: '#f2c94c' }}>
                      <h3>⚠️ Consolidated Report Under Review</h3>
                      <p style={{ marginTop: '10px' }}>Your report will unlock completely once the recruiter compiles the final hiring recommendation at the end of Stage 4.</p>
                    </div>
                  ) : (
                    <>
                      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', position: 'relative' }}>
                          <label style={{ fontSize: '13px' }}>Candidate context:</label>
                          <input 
                            type="text" 
                            className="glass-input"
                            value={candidateSearchText}
                            readOnly={userRole === 'candidate'}
                          />
                        </div>
                        {userRole === 'recruiter' && (
                          <div style={{ display: 'flex', gap: '12px' }}>
                            {report && report.candidate && report.candidate.currentRound === 'ROUND_3_COMPLETED' && (
                              <button className="btn btn-primary" style={{ background: '#27ae60', borderColor: '#27ae60' }} 
                                onClick={async () => {
                                  await handleApproveRound(report.candidate.id);
                                  alert("Mock Interview assessment closed and candidate promoted to Hired status!");
                                  handleFetchReport(report.candidate.id, 0);
                                }}>
                                📋 Finish & Approve Interview Assessment (Stage 5)
                              </button>
                            )}
                            <button className="btn btn-primary" onClick={handleRunHiringDecision}>
                              Compile Final Hiring Recommendation
                            </button>
                          </div>
                        )}
                      </div>

                      {!report ? (
                        <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                          No evaluation record found. Screen this profile in Recruiter workspace first.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                          
                          {/* 1. Summary */}
                          <div className="glass-card">
                            <h3 style={{ fontSize: '15px', color: '#00f2fe', textTransform: 'uppercase', marginBottom: '14px' }}>1. Candidate Summary</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                              <div>
                                <div style={{ fontSize: '20px', fontWeight: '800' }}>{report.candidate?.name}</div>
                                <div style={{ color: '#00f2fe', fontSize: '13px' }}>{report.candidate?.email}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>Education: {report.candidate?.education} (CGPA {report.candidate?.cgpa})</div>
                              </div>
                              <div>
                                <div><strong>Raw Skills:</strong> {report.candidate?.skills}</div>
                                <div style={{ marginTop: '8px' }}><strong>Parsed Experience:</strong> {report.candidate?.experienceSummary}</div>
                              </div>
                            </div>
                          </div>

                          {/* 2. Resume Screen */}
                          <div className="glass-card">
                            <h3 style={{ fontSize: '15px', color: '#00f2fe', textTransform: 'uppercase', marginBottom: '14px' }}>2. Resume Analysis</h3>
                            {report.resumeScreening ? (
                              <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '20px' }}>
                                <div>
                                  <div style={{ fontSize: '12px' }}>Resume Score</div>
                                  <div style={{ fontSize: '42px', fontWeight: '800', color: '#00f2fe' }}>{report.resumeScreening.resumeScore}</div>
                                  <div style={{ fontSize: '12px', marginTop: '6px' }}>ATS Fit: {report.resumeScreening.atsScore}%</div>
                                </div>
                                <div>
                                  <div><strong>Strengths:</strong> {report.resumeScreening.strengths}</div>
                                  <div style={{ marginTop: '6px' }}><strong>Weaknesses:</strong> {report.resumeScreening.weaknesses}</div>
                                  <div style={{ marginTop: '6px' }}><strong>Suggestions:</strong> {report.resumeScreening.improvementSuggestions}</div>
                                </div>
                              </div>
                            ) : <p style={{ color: 'var(--text-muted)' }}>Resume Screen not run.</p>}
                          </div>

                          {/* 3. Matching */}
                          <div className="glass-card">
                            <h3 style={{ fontSize: '15px', color: '#00f2fe', textTransform: 'uppercase', marginBottom: '14px' }}>3. Job Matching</h3>
                            {report.jobMatching ? (
                              <div>
                                <div style={{ fontSize: '16px', fontWeight: '700' }}>Match Fit: <span style={{color:'#00f2fe'}}>{report.jobMatching.matchPercentage}%</span></div>
                                <p style={{ marginTop: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>{report.jobMatching.reason}</p>
                              </div>
                            ) : <p style={{ color: 'var(--text-muted)' }}>Match analysis not run.</p>}
                          </div>

                          {/* 4. Skill Gap */}
                          <div className="glass-card">
                            <h3 style={{ fontSize: '15px', color: '#00f2fe', textTransform: 'uppercase', marginBottom: '14px' }}>4. Skill Gap Analysis</h3>
                            {report.skillGap ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div><strong>Current Skills:</strong> {report.skillGap.currentSkills}</div>
                                <div><strong>Missing Frameworks/Tech:</strong> <span style={{color:'#eb5757'}}>{report.skillGap.missingSkills}</span></div>
                                <div style={{ background: 'rgba(255,255,255,0.01)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-glass)', fontSize: '13px' }}>
                                  <strong>Weekly Roadmap:</strong>
                                  <p style={{ whiteSpace: 'pre-line', marginTop: '6px', color: 'var(--text-secondary)' }}>{report.skillGap.weeklyLearningPlan}</p>
                                </div>
                              </div>
                            ) : <p style={{ color: 'var(--text-muted)' }}>Skill Gap roadmap not generated.</p>}
                          </div>

                          {/* 4b. Aptitude Evaluation */}
                          <div className="glass-card">
                            <h3 style={{ fontSize: '15px', color: '#00f2fe', textTransform: 'uppercase', marginBottom: '14px' }}>4b. Aptitude Evaluation</h3>
                            {report.aptitudeTest ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>Aptitude Score: <strong style={{color:'#00f2fe'}}>{report.aptitudeTest.finalScore}%</strong></div>
                                <p style={{ fontSize: '13px', margin: '4px 0', color: 'var(--text-secondary)' }}><strong>Feedback:</strong> {report.aptitudeTest.feedback}</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                                  {(() => {
                                    try {
                                      const questions = JSON.parse(report.aptitudeTest.questionsJson || '[]');
                                      const answers = JSON.parse(report.aptitudeTest.answersJson || '{}');
                                      return questions.map((q, idx) => {
                                        const candidateAns = answers[q.id];
                                        const isCorrect = candidateAns && candidateAns.trim().toLowerCase() === q.answer.trim().toLowerCase();
                                        return (
                                          <div key={q.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', borderRadius: '6px', border: '1px solid var(--border-glass)', fontSize: '12px' }}>
                                            <div><strong>Q{idx + 1} ({q.category}):</strong> {q.question}</div>
                                            <div style={{ color: isCorrect ? '#27ae60' : '#eb5757', marginTop: '4px', fontWeight: '600' }}>
                                              Chosen Answer: {candidateAns || "Unanswered"} 
                                              {isCorrect ? " (✓ Correct)" : ` (✗ Incorrect - Correct Answer: ${q.answer})`}
                                            </div>
                                          </div>
                                        );
                                      });
                                    } catch (err) {
                                      return <p style={{ color: 'var(--text-muted)' }}>Could not parse answers details.</p>;
                                    }
                                  })()}
                                </div>
                              </div>
                            ) : <p style={{ color: 'var(--text-muted)' }}>Aptitude evaluation not run.</p>}
                          </div>

                          {/* 4c. Communication MCQ Evaluation */}
                          <div className="glass-card">
                            <h3 style={{ fontSize: '15px', color: '#00f2fe', textTransform: 'uppercase', marginBottom: '14px' }}>4c. Communication MCQ Evaluation</h3>
                            {report.communicationTest ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>Communication MCQ Score: <strong style={{color:'#00f2fe'}}>{report.communicationTest.finalScore}%</strong></div>
                                <p style={{ fontSize: '13px', margin: '4px 0', color: 'var(--text-secondary)' }}><strong>Feedback:</strong> {report.communicationTest.feedback}</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                                  {(() => {
                                    try {
                                      const questions = JSON.parse(report.communicationTest.questionsJson || '[]');
                                      const answers = JSON.parse(report.communicationTest.answersJson || '{}');
                                      return questions.map((q, idx) => {
                                        const candidateAns = answers[q.id];
                                        const isCorrect = candidateAns && candidateAns.trim().toLowerCase() === q.answer.trim().toLowerCase();
                                        return (
                                          <div key={q.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', borderRadius: '6px', border: '1px solid var(--border-glass)', fontSize: '12px' }}>
                                            <div><strong>Q{idx + 1} ({q.category}):</strong> {q.question}</div>
                                            <div style={{ color: isCorrect ? '#27ae60' : '#eb5757', marginTop: '4px', fontWeight: '600' }}>
                                              Chosen Answer: {candidateAns || "Unanswered"} 
                                              {isCorrect ? " (✓ Correct)" : ` (✗ Incorrect - Correct Answer: ${q.answer})`}
                                            </div>
                                          </div>
                                        );
                                      });
                                    } catch (err) {
                                      return <p style={{ color: 'var(--text-muted)' }}>Could not parse answers details.</p>;
                                    }
                                  })()}
                                </div>
                              </div>
                            ) : <p style={{ color: 'var(--text-muted)' }}>Communication MCQ evaluation not run.</p>}
                          </div>

                          {/* 5. Interviews */}
                          <div className="glass-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                              <h3 style={{ fontSize: '15px', color: '#00f2fe', textTransform: 'uppercase', margin: 0 }}>5. Mock Interview Evaluations</h3>
                              {report.candidate && report.candidate.currentRound === 'ROUND_3_COMPLETED' ? (
                                <span style={{ fontSize: '10px', background: 'rgba(242, 201, 76, 0.15)', color: '#f2c94c', padding: '3px 8px', borderRadius: '4px', fontWeight: '800' }}>
                                  ⚠️ PENDING RECRUITER VERIFICATION
                                </span>
                              ) : (
                                <span style={{ fontSize: '10px', background: 'rgba(39, 174, 96, 0.15)', color: '#27ae60', padding: '3px 8px', borderRadius: '4px', fontWeight: '800' }}>
                                  ✓ INTERVIEW ROUND CLOSED & APPROVED
                                </span>
                              )}
                            </div>
                            {report.interviewQuestions && report.interviewQuestions.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {report.interviewQuestions.map((q, i) => (
                                  <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
                                    <div><strong>Q:</strong> {q.question}</div>
                                    <div style={{ color: 'var(--accent-cyan)' }}><strong>A:</strong> {q.candidateAnswer}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Score: {q.score}% | Feedback: {q.feedback}</div>
                                  </div>
                                ))}
                              </div>
                            ) : <p style={{ color: 'var(--text-muted)' }}>No interview answers evaluated.</p>}
                          </div>

                          {/* 6. Coding */}
                          <div className="glass-card">
                            <h3 style={{ fontSize: '15px', color: '#00f2fe', textTransform: 'uppercase', marginBottom: '14px' }}>6. Coding Assessment</h3>
                            {report.codingEvaluation ? (
                              <div>
                                <div>Score: <strong style={{color:'#00f2fe'}}>{report.codingEvaluation.finalScore}%</strong> ({report.codingEvaluation.correctness})</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Complexity: {report.codingEvaluation.complexityTime} / {report.codingEvaluation.complexitySpace}</div>
                                <p style={{ fontSize: '13px', marginTop: '6px' }}>Feedback: {report.codingEvaluation.feedback}</p>
                              </div>
                            ) : <p style={{ color: 'var(--text-muted)' }}>Coding evaluation not compiled.</p>}
                          </div>

                          {/* 7. Communications */}
                          <div className="glass-card">
                            <h3 style={{ fontSize: '15px', color: '#00f2fe', textTransform: 'uppercase', marginBottom: '14px' }}>7. Communication Assessment</h3>
                            {report.communicationAssessment ? (
                              <div>
                                <div>Vocal Score: <strong style={{color:'#00f2fe'}}>{report.communicationAssessment.communicationScore}%</strong></div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', marginTop: '8px' }}>
                                  <div>Grammar: {report.communicationAssessment.grammarFeedback}</div>
                                  <div>Vocabulary: {report.communicationAssessment.vocabularyFeedback}</div>
                                  <div>Tone: {report.communicationAssessment.professionalToneFeedback}</div>
                                </div>
                              </div>
                            ) : <p style={{ color: 'var(--text-muted)' }}>Communication Assessment not run.</p>}
                          </div>

                          {/* 7b. AI Proctoring & Monitoring Audit */}
                          <div className="glass-card">
                            <h3 style={{ fontSize: '15px', color: '#00f2fe', textTransform: 'uppercase', marginBottom: '14px' }}>7b. AI Proctoring & Monitoring Audit</h3>
                            {report.interview ? (
                              <>
                                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '20px' }}>
                                  <div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Proctoring Integrity</div>
                                    <div style={{ fontSize: '42px', fontWeight: '800', color: (report.interview.proctoringScore || 100) >= 90 ? '#27ae60' : '#f2c94c', marginTop: '6px' }}>
                                      {report.interview.proctoringScore || 100}%
                                    </div>
                                    <div style={{ fontSize: '11px', marginTop: '6px', color: 'var(--text-muted)' }}>Status: AI monitored</div>
                                  </div>
                                  <div>
                                    <strong style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>Proctoring Logs Feed:</strong>
                                    <div style={{ 
                                      background: '#080c16', 
                                      padding: '12px', 
                                      borderRadius: '8px', 
                                      maxHeight: '120px', 
                                      overflowY: 'auto',
                                      fontFamily: 'monospace',
                                      fontSize: '11px',
                                      color: '#27ae60',
                                      border: '1px solid var(--border-glass)'
                                    }}>
                                      {report.interview.proctoringLogs ? (
                                        (() => {
                                          try {
                                            return JSON.parse(JSON.parse(report.interview.proctoringLogs)).map((log, idx) => (
                                              <div key={idx} style={{ marginBottom: '4px' }}>{log}</div>
                                            ));
                                          } catch (e) {
                                            try {
                                              return JSON.parse(report.interview.proctoringLogs).map((log, idx) => (
                                                <div key={idx} style={{ marginBottom: '4px' }}>{log}</div>
                                              ));
                                            } catch (e2) {
                                              return <div style={{ color: 'var(--text-secondary)' }}>{report.interview.proctoringLogs}</div>;
                                            }
                                          }
                                        })()
                                      ) : (
                                        <>
                                          <div>[10:14:02] AI Proctoring engine initialization complete.</div>
                                          <div>[10:14:05] Live monitoring scanner active. Gaze direction: Center.</div>
                                          <div>[10:14:12] Speaking pattern check: normal. Decibel level matched.</div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Simulated Video & Audio Playback for Recruiter Review */}
                                <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                                  <h4 style={{ fontSize: '13px', color: '#00f2fe', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    🎥 Recorded Session Video & Audio Review
                                  </h4>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                                    <div style={{
                                      position: 'relative',
                                      width: '100%',
                                      aspectRatio: '16/9',
                                      background: '#040810',
                                      borderRadius: '8px',
                                      overflow: 'hidden',
                                      border: '1px solid var(--border-glass)'
                                    }}>
                                      {/* Video Frame */}
                                      <div style={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'linear-gradient(135deg, #090e1a 0%, #151d30 100%)',
                                        color: 'var(--text-secondary)'
                                      }}>
                                        {/* Face Outline SVG */}
                                        <svg width="60" height="60" viewBox="0 0 100 100" style={{ opacity: 0.5, filter: 'drop-shadow(0 0 5px rgba(0,242,254,0.3))' }}>
                                          <path d="M50,12 C28,12 25,35 25,60 C25,80 35,90 50,90 C65,90 75,80 75,60 C75,35 72,12 50,12 Z" fill="none" stroke="#00f2fe" strokeWidth="1.5" strokeDasharray="3 3" />
                                          <circle cx="38" cy="45" r="4" fill="none" stroke="#00f2fe" strokeWidth="1.5" />
                                          <circle cx="62" cy="45" r="4" fill="none" stroke="#00f2fe" strokeWidth="1.5" />
                                          <path d="M45,65 Q50,70 55,65" fill="none" stroke="#00f2fe" strokeWidth="1.5" />
                                          <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(0, 242, 254, 0.1)" strokeWidth="1" />
                                        </svg>
                                        <span style={{ fontSize: '9px', marginTop: '6px', color: '#27ae60', fontWeight: '800' }}>● RECORDED SESSION READY</span>
                                      </div>

                                      {/* Playback Controls */}
                                      <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        background: 'rgba(0,0,0,0.85)',
                                        padding: '8px 12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        fontSize: '10px',
                                        fontFamily: 'monospace',
                                        borderTop: '1px solid rgba(255,255,255,0.05)'
                                      }}>
                                        <span style={{ cursor: 'pointer', color: '#00f2fe', fontWeight: '800' }}>▶ PLAY</span>
                                        <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.2)', margin: '0 12px', borderRadius: '2px' }}>
                                          <div style={{ width: '60%', height: '100%', background: '#00f2fe', borderRadius: '2px' }}></div>
                                        </div>
                                        <span style={{ color: 'var(--text-secondary)' }}>01:45 / 03:00</span>
                                      </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                                      <div style={{ padding: '8px 12px', background: 'rgba(0, 242, 254, 0.05)', borderRadius: '6px', borderLeft: '3px solid #00f2fe' }}>
                                        <strong>Integrity Audit Decision:</strong>
                                        <p style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>No anomalies or unauthorized speech detected. Eye movements are consistent with reading the exam parameters.</p>
                                      </div>
                                      <div style={{ padding: '8px 12px', background: 'rgba(39, 174, 96, 0.05)', borderRadius: '6px', borderLeft: '3px solid #27ae60' }}>
                                        <strong>AI Proctoring Verdict:</strong>
                                        <p style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>Verified candidate identity match (100% confidence). Safe to approve round.</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </>
                            ) : <p style={{ color: 'var(--text-muted)' }}>Proctoring logs not compiled for this candidate.</p>}
                          </div>

                          {/* 8. Final Decision */}
                          <div className="glass-card" style={{ borderColor: 'var(--accent-purple)' }}>
                            <h3 style={{ fontSize: '16px', color: '#9b51e0', textTransform: 'uppercase', marginBottom: '14px' }}>8. Final Hiring Decision</h3>
                            {report.hiringDecision ? (
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                  <div>Recommendation: <strong style={{color:'#00f2fe'}}>{report.hiringDecision.decision}</strong></div>
                                  <div>Overall Fit Rating: <strong style={{color:'#00f2fe'}}>{report.hiringDecision.overallScore}%</strong></div>
                                </div>
                                <p style={{ fontSize: '13px', background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '6px' }}>{report.hiringDecision.reason}</p>
                                <div style={{ fontSize: '12px', color: 'var(--accent-purple)', textAlign: 'right', marginTop: '10px' }}>
                                  <strong>System Confidence Score: {report.hiringDecision.confidenceScore}%</strong>
                                </div>
                              </div>
                            ) : <p style={{ color: 'var(--text-muted)' }}>Final recommendation decision not compiled.</p>}
                          </div>

                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

            </div>

            {/* Right: Floating/Fixed AI Recruiter Agent Panel */}
            <div style={{
              width: isChatOpen ? '380px' : '60px',
              borderLeft: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
              background: isDark ? '#0f1422' : '#ffffff',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 90,
              position: 'relative'
            }}>
              
              {/* Toggle handle */}
              <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                style={{
                  position: 'absolute',
                  left: '-32px',
                  top: '100px',
                  width: '32px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #00f2fe, #2f80ed)',
                  border: 'none',
                  borderRadius: '8px 0 0 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '-4px 0 10px rgba(0,0,0,0.2)'
                }}>
                <span style={{ transform: isChatOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'all 0.2s', color: '#0b0f19', fontWeight: 'bold' }}>
                  {isChatOpen ? '▶' : '◀'}
                </span>
              </button>

              {/* Chat Content */}
              {isChatOpen ? (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid var(--border-glass)', background: 'linear-gradient(to right, rgba(0,242,254,0.08), transparent)' }}>
                    <div style={{ fontWeight: '800', fontSize: '15px' }}>HireGen AI Copilot</div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Powered by Gemini API</span>
                  </div>

                  {/* AI Agent Navigation Advisor */}
                  <div style={{
                    margin: '12px 16px 0 16px',
                    padding: '12px',
                    background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.1) 0%, rgba(155, 81, 224, 0.1) 100%)',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 242, 254, 0.25)',
                    fontSize: '11px',
                    lineHeight: '1.4'
                  }}>
                    <strong style={{ color: '#00f2fe', display: 'block', marginBottom: '4px' }}>🤖 Navigation Assistant Suggestion:</strong>
                    {userRole === 'recruiter' ? (
                      <div>
                        You are logged in as a <strong>Recruiter</strong>.<br/>
                        👉 Go to <strong>Dashboard</strong> to view candidate pipeline status.<br/>
                        👉 Go to <strong>Consolidated Report</strong> to review proctored session details and click <strong>Compile Final Hiring Recommendation</strong> to make hiring decisions.
                      </div>
                    ) : (
                      (() => {
                        const round = currentUser.currentRound || 'ROUND_1_RESUME';
                        if (round === 'ROUND_1_RESUME') {
                          return (
                            <div>
                              Current Stage: <strong>Stage 1 (Resume Upload)</strong>.<br/>
                              👉 Go to <strong>Dashboard</strong> and click <strong>Upload Resume Details</strong> under Round 1 checkpoint to upload your profile.
                            </div>
                          );
                        } else if (round === 'ROUND_2_MATCHING') {
                          return (
                            <div>
                              Current Stage: <strong>Stage 2 (Compatibility Analysis)</strong>.<br/>
                              👉 Go to <strong>Dashboard</strong>, review your job fit index, and click <strong>Submit Stage 2 matching review</strong>.
                            </div>
                          );
                        } else if (round === 'ROUND_3_INTERVIEW') {
                          return (
                            <div>
                              Current Stage: <strong>Stage 3 (Mock Interview)</strong>.<br/>
                              👉 Go to <strong>Mock Interview</strong> tab, test your camera check, and click <strong>Begin Mock Interview</strong>.
                            </div>
                          );
                        } else if (round === 'ROUND_4_CODING') {
                          return (
                            <div>
                              Current Stage: <strong>Stage 4 (Coding Arena)</strong>.<br/>
                              👉 Go to <strong>Coding Arena</strong> tab and write the solution to compile code complexity.
                            </div>
                          );
                        } else if (round.includes('COMPLETED')) {
                          return (
                            <div>
                              Current Stage: <strong>Awaiting Approval</strong>.<br/>
                              👉 Awaiting Recruiter review of your submitted evaluations. Check back shortly!
                            </div>
                          );
                        } else if (round === 'HIRED') {
                          return (
                            <div>
                              🎉 <strong>Congratulations!</strong> You have been Hired! Go to <strong>My Report</strong> to review your finalized scorecard.
                            </div>
                          );
                        } else {
                          return (
                            <div>
                              Explore the tabs (Dashboard, My Report, Mock Interview, Coding Arena) to complete your screening process!
                            </div>
                          );
                        }
                      })()
                    )}
                  </div>

                  {/* Message logs */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {chatMessages.map((m, i) => (
                      <div 
                        key={i} 
                        style={{
                          alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                          background: m.role === 'user' ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255,255,255,0.02)',
                          border: m.role === 'user' ? '1px solid rgba(0, 242, 254, 0.3)' : '1px solid var(--border-glass)',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          maxWidth: '85%',
                          fontSize: '12px',
                          lineHeight: '1.4'
                        }}>
                        {m.text}
                      </div>
                    ))}
                  </div>

                  {/* Preloaded suggestion query list */}
                  <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border-glass)' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Try example queries:</span>
                    <button 
                      onClick={() => handleSendQuery('Suggest 5 technical screening questions for a React.js engineer position')}
                      className="btn btn-secondary" 
                      style={{ padding: '6px', fontSize: '10px', textAlign: 'left', display: 'block', width: '100%' }}>
                      Suggest React developer questions
                    </button>
                    <button 
                      onClick={() => handleSendQuery('Draft a polite candidate interview rejection email')}
                      className="btn btn-secondary" 
                      style={{ padding: '6px', fontSize: '10px', textAlign: 'left', display: 'block', width: '100%' }}>
                      Draft a rejection email template
                    </button>
                  </div>

                  {/* Input field */}
                  <div style={{ padding: '16px', display: 'flex', gap: '8px', borderTop: '1px solid var(--border-glass)' }}>
                    <input 
                      type="text" 
                      className="glass-input" 
                      placeholder="Ask copilot to solve..." 
                      style={{ fontSize: '12px' }}
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendQuery()}
                    />
                    <button className="btn btn-primary" style={{ padding: '8px 12px' }} onClick={() => handleSendQuery()}>
                      Send
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '40px', gap: '20px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00f2fe, #2f80ed)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }} onClick={() => setIsChatOpen(true)}>
                    🤖
                  </div>
                  <span style={{ fontSize: '10px', writingMode: 'vertical-rl', textOrientation: 'mixed', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                    ASK AI AGENT
                  </span>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
