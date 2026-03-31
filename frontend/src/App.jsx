import { useState, useRef, useEffect } from 'react';
import { Shield, MessageCircle, Clock, AlertTriangle, Search, Menu, X, Globe, ArrowLeft, CheckCircle2 } from 'lucide-react';

const mockComplaints = {
  "FIR-2026-DEL-001": {
    status: "In Progress",
    statusColor: "text-amber-600",
    statusBg: "bg-amber-100",
    title: "Stolen Two-Wheeler (Hero Splendor) - Vasant Kunj",
    filedAt: "Mar 20, 2026, 10:30 AM",
    officer: "Inspector Anil Kumar, Vasant Kunj North PS",
    updates: [
       { id: 1, date: "Mar 25, 2026", text: "CCTV footage obtained from outer intersection and suspects identified. Search operations directed." },
       { id: 2, date: "Mar 21, 2026", text: "FIR officially registered. Investigation formally assigned to investigating officer." },
    ]
  },
  "FIR-2026-MUM-002": {
    status: "Neglected",
    statusColor: "text-red-600",
    statusBg: "bg-red-100",
    title: "Mobile Phone Snatching - Bandra Kurla Complex",
    filedAt: "Feb 13, 2026, 06:15 PM",
    officer: "Sub-Inspector Ramesh Patil, BKC PS",
    updates: [
       { id: 1, date: "Feb 13, 2026", text: "FIR registered. Basic details recorded. Complainant asked to provide IMEI number." }
    ]
  }
};

const translations = {
  en: {
    title: "CaseTrace",
    heroHeading: "Track Your Police Complaint Status",
    heroSubheading: "Enter your Complaint ID (FIR Number) to get real-time updates on your case. Try: FIR-2026-DEL-001",
    placeholder: "e.g., FIR-2026-DEL-001",
    searchBtn: "Track Status",
    featuresTitle: "Our Services",
    feature1: "AI Case Follow-up Assistant",
    feature1Desc: "Chat with our intelligent assistant to understand your rights and next steps.",
    feature2: "Case Timeline",
    feature2Desc: "View a transparent timeline of actions taken by the police department.",
    feature3: "Escalation Alerts",
    feature3Desc: "Automatic alerts to higher authorities if your case is delayed.",
    footerText: "© 2026 CaseTrace Civic-Tech Initiative. All rights reserved.",
    backBtn: "Back to Search",
    caseTitle: "Complaint Details",
    caseStatus: "Current Status",
    filedOn: "Filed On",
    assignedTo: "Assigned To",
    timelineTitle: "Recent Case Updates",
    notFound: "No case found with that ID. Please check the ID and try again.",
    trySample: "Try our sample IDs:",
    downloadFIR: "Download FIR Summary",
    escalateBtn: "Escalate Now",
    noUpdateAlert: "⚠️ No update in 45 days. You may escalate to SP level.",
    timelineTab: "Case Timeline",
    chatTab: "AI Follow-up Assistant",
    chatHeader: "CaseTrace AI Consultant",
    chatStatus: "Available - Ask anything about your case protocols",
    chatInputPlaceholder: "e.g., How long will the investigation take?",
    chatSend: "Send",
    typingMsg: "AI is thinking..."
  },
  hi: {
    title: "CaseTrace",
    heroHeading: "अपनी पुलिस शिकायत की स्थिति ट्रैक करें",
    heroSubheading: "वास्तविक समय के अपडेट प्राप्त करने के लिए अपनी शिकायत आईडी (FIR नंबर) दर्ज करें। कोशिश करें: FIR-2026-DEL-001",
    placeholder: "जैसे: FIR-2026-DEL-001",
    searchBtn: "स्थिति ट्रैक करें",
    featuresTitle: "हमारी सेवाएँ",
    feature1: "एआई मामला फॉलो-अप सहायक",
    feature1Desc: "अपने अधिकारों और अगले कदमों को समझने के लिए हमारे बुद्धिमान सहायक से चैट करें।",
    feature2: "मामला समय-सीमा",
    feature2Desc: "पुलिस विभाग द्वारा की गई कार्रवाइयों की पारदर्शी समय-सीमा देखें।",
    feature3: "वृद्धि अलर्ट",
    feature3Desc: "यदि आपके मामले में देरी होती है तो उच्च अधिकारियों को स्वचालित अलर्ट।",
    footerText: "© 2026 CaseTrace सिविक-टेक पहल। सर्वाधिकार सुरक्षित।",
    backBtn: "खोज पर वापस जाएं",
    caseTitle: "शिकायत विवरण",
    caseStatus: "वर्तमान स्थिति",
    filedOn: "दर्ज की गई",
    assignedTo: "सौंपा गया",
    timelineTitle: "हालिया केस अपडेट",
    notFound: "उस आईडी वाला कोई मामला नहीं मिला। कृपया आईडी जांचें और पुनः प्रयास करें।",
    trySample: "हमारी नमूना आईडी आज़माएं:",
    downloadFIR: "FIR सारांश डाउनलोड करें",
    escalateBtn: "अभी एस्केलेट करें",
    noUpdateAlert: "⚠️ 45 दिनों में कोई अपडेट नहीं। आप एसपी स्तर तक एस्केलेट कर सकते हैं।",
    timelineTab: "मामला समय-सीमा",
    chatTab: "एआई फॉलो-अप सहायक",
    chatHeader: "CaseTrace एआई सलाहकार",
    chatStatus: "उपलब्ध - अपने मामले के प्रोटोकॉल के बारे में कुछ भी पूछें",
    chatInputPlaceholder: "जैसे, जांच में कितना समय लगेगा?",
    chatSend: "भेजें",
    typingMsg: "एआई सोच रहा है..."
  }
};

function App() {
  const [lang, setLang] = useState('en');
  const [complaintId, setComplaintId] = useState('FIR-2026-DEL-001');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCase, setActiveCase] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Chat & Tab States
  const [activeTab, setActiveTab] = useState('timeline');
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { id: 0, text: "Hello! I am CaseTrace AI. Based on your FIR-2026-DEL-001 regarding the stolen two-wheeler, police actions are currently underway. How can I help you today?", sender: "ai" }
  ]);
  const chatEndRef = useRef(null);

  const t = translations[lang];

  useEffect(() => {
    if (activeTab === 'chat' && chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, activeTab]);

  const handleSearch = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const id = complaintId.trim();
    if (mockComplaints[id]) {
      setActiveCase(mockComplaints[id]);
      setActiveTab('timeline');
      // Reset chat
      setMessages([{ id: 0, text: `Hello! I am CaseTrace AI. Based on your ${id} regarding the ${mockComplaints[id].title}, how can I help you today?`, sender: "ai" }]);
    } else {
      setActiveCase(null);
      setErrorMsg(t.notFound);
    }
  };

  const generateFIRSummary = () => {
    if (!activeCase) return;
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding: 40px; font-family: sans-serif; color: #1f2937;">
        <h1 style="color: #1e3a8a; text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px;">CaseTrace FIR Summary</h1>
        <h2 style="font-size: 24px; margin-bottom: 15px;">Case ID: ${complaintId.trim()}</h2>
        <div style="margin-bottom: 30px; background: #f3f4f6; padding: 20px; border-radius: 8px;">
          <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${activeCase.status === 'Neglected' ? '#dc2626' : '#ea580c'}; font-weight: bold;">${activeCase.status}</span></p>
          <p style="margin: 5px 0;"><strong>Filed On:</strong> ${activeCase.filedAt}</p>
          <p style="margin: 5px 0;"><strong>Assigned Officer:</strong> ${activeCase.officer}</p>
          <p style="margin: 5px 0;"><strong>Issue Reported:</strong> ${activeCase.title}</p>
        </div>
        <h3 style="font-size: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 15px;">Timeline Updates</h3>
        <ul style="list-style-type: none; padding-left: 0;">
          ${activeCase.updates.map(u => `<li style="margin-bottom: 15px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;"><strong>${u.date}</strong><br/>${u.text}</li>`).join('')}
        </ul>
        <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #6b7280;">
          Generated automatically by CaseTrace Platform on ${new Date().toLocaleDateString()}
        </div>
      </div>
    `;
    window.html2pdf().from(element).set({ margin: 1, filename: `FIR_Summary_${complaintId.trim()}.pdf` }).save();
  };

  const generateEscalationLetter = () => {
    if (!activeCase) return;
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding: 40px; font-family: 'Times New Roman', serif; line-height: 1.6; color: #000;">
        <h2 style="text-align: center; font-size: 22px; text-decoration: underline; margin-bottom: 30px;">FORMAL ESCALATION LETTER</h2>
        <p><strong>To,</strong></p>
        <p style="margin: 0;">The Superintendent of Police (SP)</p>
        <p style="margin: 0;">City Police Headquarters</p>
        <p style="margin: 0;">Date: ${new Date().toLocaleDateString()}</p>
        <br/>
        <p><strong>Subject:</strong> Escalation of Neglected Police Complaint - FIR ${complaintId.trim()}</p>
        <br/>
        <p>Respected Sir/Madam,</p>
        <p>I am writing to formally escalate the lack of progress and response regarding my registered police complaint. Despite filing the FIR several weeks ago, there continues to be no significant update or investigative progress. The relevant details of my case are tabulated below:</p>
        <div style="margin: 20px 0; padding: 15px; border: 1px solid #000;">
          <p style="margin: 5px 0;"><strong>FIR Number:</strong> ${complaintId.trim()}</p>
          <p style="margin: 5px 0;"><strong>Filed On:</strong> ${activeCase.filedAt}</p>
          <p style="margin: 5px 0;"><strong>Assigned Officer:</strong> ${activeCase.officer}</p>
          <p style="margin: 5px 0;"><strong>Issue Reported:</strong> ${activeCase.title}</p>
        </div>
        <p>Pursuant to standard protocols outlined in the Indian Criminal Procedure Code, I request your direct intervention to review this case file and issue necessary directives to the investigating officer so that the matter can proceed towards a timely resolution.</p>
        <p>I look forward to your prompt response in the interest of justice.</p>
        <br/><br/>
        <p>Sincerely,</p>
        <br/>
        <p>_______________________</p>
        <p>[Citizen Name / Signature]</p>
      </div>
    `;
    window.html2pdf().from(element).set({ margin: 1, filename: `Escalation_Letter_${complaintId.trim()}.pdf` }).save();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if(!chatInput.trim()) return;

    const userMessageText = chatInput;
    const nMsg = { id: Date.now(), text: userMessageText, sender: "user" };
    setMessages(prev => [...prev, nMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              message: userMessageText, 
              complaintId: complaintId.trim(),
              caseDetails: activeCase
          })
      });
      const data = await response.json();
      
      const aiReply = { 
        id: Date.now()+1, 
        text: data.reply || "Something went wrong.",
        sender: "ai" 
      };
      setMessages(prev => [...prev, aiReply]);
    } catch (error) {
       console.error(error);
       setMessages(prev => [...prev, { id: Date.now()+2, text: "Error communicating with the assistant. Please make sure the backend server and Gemini API key are active.", sender: "ai" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-nyayaLight flex flex-col font-sans text-gray-800 transition-colors duration-300">
      {/* Navbar */}
      <nav className="bg-nyayaBlue text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveCase(null)}>
              <Shield className="w-8 h-8 text-white" />
              <span className="font-bold text-2xl tracking-wide">{t.title}</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                className="flex items-center gap-1 hover:text-blue-200 transition-colors"
              >
                <Globe className="w-5 h-5" />
                <span className="font-medium">{lang === 'en' ? 'हिंदी' : 'English'}</span>
              </button>
              <button className="bg-white text-nyayaBlue px-4 py-2 rounded-md font-semibold hover:bg-gray-100 transition shadow">
                Login via OTP
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-blue-900 pb-4 px-4 space-y-3 animate-fade-in-down">
             <button 
                onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                className="flex items-center gap-2 text-white w-full py-2"
              >
                <Globe className="w-5 h-5" />
                <span>{lang === 'en' ? 'Switch to Hindi' : 'Switch to English'}</span>
              </button>
              <button className="w-full bg-white text-nyayaBlue px-4 py-2 rounded-md font-semibold shadow">
                Login via OTP
              </button>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {!activeCase ? (
          <>
            {/* Hero Section */}
            <div className="bg-gradient-to-b from-nyayaBlue to-blue-800 text-white py-20 px-4 transition-all duration-500">
              <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight drop-shadow-sm">
                  {t.heroHeading}
                </h1>
                <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                  {t.heroSubheading}
                </p>
                
                <form onSubmit={handleSearch} className="max-w-2xl mx-auto bg-white p-2 rounded-lg flex shadow-lg flex-col sm:flex-row gap-2 transition-transform transform hover:scale-[1.01]">
                  <div className="flex-grow flex items-center px-4 bg-gray-50 rounded-md border border-gray-200 focus-within:ring-2 ring-nyayaBlue transition-shadow">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t.placeholder}
                      className="w-full bg-transparent outline-none p-3 text-gray-800 font-medium"
                      value={complaintId}
                      onChange={(e) => setComplaintId(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit"
                    className="bg-nyayaBlue hover:bg-blue-900 text-white px-8 py-3 rounded-md font-bold transition-colors whitespace-nowrap shadow-sm active:scale-95"
                  >
                    {t.searchBtn}
                  </button>
                </form>

                {errorMsg && (
                   <div className="mt-6 inline-flex items-center gap-2 bg-red-100/90 text-red-800 px-6 py-3 rounded-md border border-red-200 animate-bounce-short shadow-sm">
                     <AlertTriangle className="w-5 h-5" />
                     <span className="font-semibold">{errorMsg}</span>
                   </div>
                )}
                
                <p className="mt-6 text-sm text-blue-200 font-medium">
                  {t.trySample} <br/>
                  <span className="cursor-pointer hover:text-white transition-colors" onClick={() => setComplaintId("FIR-2026-DEL-001")}><strong>FIR-2026-DEL-001</strong></span> (Active) | <span className="cursor-pointer hover:text-white transition-colors" onClick={() => setComplaintId("FIR-2026-MUM-002")}><strong>FIR-2026-MUM-002</strong></span> (Neglected)
                </p>
              </div>
            </div>

            {/* Features Section */}
            <div className="py-20 px-4 bg-nyayaLight">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center text-nyayaBlue mb-12">
                  {t.featuresTitle}
                </h2>
                
                <div className="grid md:grid-cols-3 gap-8">
                  <div 
                    onClick={() => {
                      setActiveCase(mockComplaints["FIR-2026-DEL-001"]);
                      setActiveTab('chat');
                    }}
                    className="bg-white p-8 rounded-xl shadow border border-gray-100 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 text-center cursor-pointer transform hover:scale-[1.03]"
                  >
                    <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-6 ring-4 ring-blue-50/50 text-nyayaBlue">
                      <MessageCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{t.feature1}</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {t.feature1Desc}
                    </p>
                    <span className="inline-block text-sm font-bold text-nyayaBlue bg-blue-50 px-3 py-1 rounded-full">Click to test →</span>
                  </div>

                  <div 
                    onClick={() => {
                      setActiveCase(mockComplaints["FIR-2026-DEL-001"]);
                      setActiveTab('timeline');
                    }}
                    className="bg-white p-8 rounded-xl shadow border border-gray-100 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 text-center cursor-pointer transform hover:scale-[1.03]"
                  >
                    <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-6 ring-4 ring-blue-50/50 text-nyayaBlue">
                      <Clock className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{t.feature2}</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {t.feature2Desc}
                    </p>
                    <span className="inline-block text-sm font-bold text-nyayaBlue bg-blue-50 px-3 py-1 rounded-full">Click to test →</span>
                  </div>

                  <div className="bg-white p-8 rounded-xl shadow border border-gray-100 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 text-center cursor-default">
                    <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-6 ring-4 ring-red-50/50">
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{t.feature3}</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {t.feature3Desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Case Details View */
          <div className="bg-nyayaLight py-12 px-4 transition-all duration-500 animate-fade-in-up">
            <div className="max-w-4xl mx-auto">
              <button 
                onClick={() => setActiveCase(null)}
                className="flex items-center text-nyayaBlue font-semibold mb-8 hover:text-blue-700 transition-colors w-max"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                {t.backBtn}
              </button>
              
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                     <h2 className="text-gray-400 font-semibold text-sm uppercase tracking-wider mb-1">{t.caseTitle}</h2>
                     <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                        {complaintId.trim()}
                     </h1>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold self-end ${activeCase.statusBg} ${activeCase.statusColor}`}>
                       <div className={`w-2 h-2 rounded-full ${activeCase.statusColor.replace('text', 'bg')}`}></div>
                       {activeCase.status}
                    </div>
                    <button 
                      onClick={generateFIRSummary}
                      className="text-sm bg-nyayaBlue text-white px-4 py-2 rounded shadow hover:bg-blue-800 transition-colors font-semibold"
                    >
                      {t.downloadFIR}
                    </button>
                  </div>
                </div>

                {activeCase.status === "Neglected" && (
                  <div className="bg-red-50 border-y border-red-200 p-4 sm:px-8 flex flex-col sm:flex-row justify-between items-center animate-fade-in-down gap-4">
                    <div className="flex items-center gap-3 text-red-800 font-semibold">
                      <AlertTriangle className="w-6 h-6 shrink-0" />
                      <span>{t.noUpdateAlert}</span>
                    </div>
                    <button 
                      onClick={generateEscalationLetter}
                      className="bg-red-600 text-white px-6 py-2 rounded-md font-bold shadow hover:bg-red-700 transition transform hover:scale-105 whitespace-nowrap"
                    >
                      {t.escalateBtn}
                    </button>
                  </div>
                )}

                <div className="p-6 sm:p-8 grid md:grid-cols-2 gap-8 border-b border-gray-100">
                  <div>
                     <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Issue Reported</h3>
                     <p className="text-lg font-medium text-gray-800">{activeCase.title}</p>
                  </div>
                  <div>
                     <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">{t.filedOn}</h3>
                     <p className="text-lg font-medium text-gray-800">{activeCase.filedAt}</p>
                  </div>
                  <div className="md:col-span-2">
                     <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">{t.assignedTo}</h3>
                     <p className="text-lg font-medium text-gray-800 bg-blue-50 inline-block px-4 py-2 rounded border border-blue-100">
                       {activeCase.officer}
                     </p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mt-4 px-6 sm:px-8 space-x-8">
                  <button 
                    className={`pb-4 font-bold text-lg border-b-2 transition-all duration-300 ${activeTab === 'timeline' ? 'border-nyayaBlue text-nyayaBlue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('timeline')}
                  >
                    {t.timelineTab}
                  </button>
                  <button 
                    className={`pb-4 font-bold text-lg border-b-2 transition-all duration-300 flex items-center gap-2 ${activeTab === 'chat' ? 'border-nyayaBlue text-nyayaBlue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('chat')}
                  >
                    <MessageCircle className={`w-5 h-5 ${activeTab === 'chat' ? 'text-nyayaBlue' : 'text-gray-400'}`} />
                    {t.chatTab}
                  </button>
                </div>

                <div className="p-6 sm:p-8">
                  {/* Timeline View */}
                  <div className={`transition-opacity duration-300 ${activeTab === 'timeline' ? 'block' : 'hidden'}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                      <Clock className="w-6 h-6 text-nyayaBlue" />
                      {t.timelineTitle}
                    </h3>
                    
                    <div className="relative border-l-2 border-blue-100 ml-4">
                      {activeCase.updates.map((update, index) => (
                        <div key={update.id} className="mb-10 ml-8 relative animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                          <span className="absolute -left-11 flex items-center justify-center w-6 h-6 rounded-full bg-white ring-8 ring-white">
                            <CheckCircle2 className={`w-6 h-6 ${index === 0 ? 'text-blue-500' : 'text-green-500'}`} />
                          </span>
                          <div className="text-sm text-gray-500 mb-1 font-semibold">{update.date}</div>
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700 shadow-sm transition-shadow hover:shadow">
                            {update.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Chat Assistant View */}
                  <div className={`transition-opacity duration-300 ${activeTab === 'chat' ? 'block animate-fade-in-up' : 'hidden'}`}>
                    <div className="bg-blue-50 rounded-xl p-4 sm:p-6 border border-blue-100 flex flex-col h-[400px]">
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-blue-200">
                          <div className="bg-nyayaBlue text-white p-2 rounded-full"><MessageCircle className="w-5 h-5" /></div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{t.chatHeader}</h3>
                            <p className="text-sm text-gray-500">{t.chatStatus}</p>
                          </div>
                      </div>
                      
                      <div className="flex-grow overflow-y-auto pr-2 space-y-4 mb-4 custom-scrollbar">
                        {messages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl p-4 text-sm ${msg.sender === 'user' ? 'bg-nyayaBlue text-white rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm shadow-sm'}`}>
                              {msg.text}
                            </div>
                          </div>
                        ))}
                        {isTyping && (
                          <div className="flex justify-start">
                            <div className="bg-white text-gray-500 border border-gray-200 rounded-2xl rounded-tl-sm p-4 shadow-sm text-sm italic animate-pulse">
                              {t.typingMsg}
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      <form onSubmit={handleSendMessage} className="mt-auto relative">
                        <input 
                          type="text" 
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder={t.chatInputPlaceholder}
                          className="w-full bg-white border border-gray-300 p-4 rounded-xl pr-24 outline-none focus:border-nyayaBlue focus:ring-1 ring-nyayaBlue"
                        />
                        <button 
                          type="submit" 
                          disabled={!chatInput.trim() || isTyping}
                          className="absolute right-2 top-2 bottom-2 bg-nyayaBlue text-white px-4 rounded-lg font-semibold hover:bg-blue-900 disabled:opacity-50 transition-colors"
                        >
                          {t.chatSend}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
            <Shield className="w-6 h-6" />
            <span className="font-bold text-xl">{t.title}</span>
          </div>
          <p>{t.footerText}</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
