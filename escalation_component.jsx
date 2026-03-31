const EscalationView = ({ activeCase, complaintId, onBack, t }) => {
  const { useState } = React;
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 0, text: `Hello! I am your AI Escalation Assistant. Based on your active case (${complaintId}), I can help you draft a formal complaint to the SP, find higher authority contacts, or prepare a WhatsApp message. What do you need?`, sender: "ai" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [formReason, setFormReason] = useState('No action taken');
  const [formDesc, setFormDesc] = useState('');

  const quickPrompts = [
    "Draft escalation letter to SP",
    "Draft WhatsApp message to officer",
    "What are my legal rights?",
    "How to file RTI for my case?"
  ];

  const handlePromptClick = (promptText) => {
    setChatInput(promptText);
    sendMsg(promptText);
  };

  const generatePDFLetter = () => {
    if (!activeCase) return;
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding: 40px; font-family: 'Times New Roman', serif; line-height: 1.6; color: #000;">
        <h2 style="text-align: center; font-size: 22px; text-decoration: underline; margin-bottom: 30px;">FORMAL ESCALATION COMPLAINT</h2>
        <p><strong>To,</strong></p>
        <p style="margin: 0;">The Superintendent of Police (SP)</p>
        <p style="margin: 0;">District Police Headquarters</p>
        <p style="margin: 0;">Date: ${new Date().toLocaleDateString()}</p>
        <br/>
        <p><strong>Subject:</strong> Escalation of Neglected Police Complaint - FIR ${complaintId}</p>
        <br/>
        <p>Respected Sir/Madam,</p>
        <p>I am writing to formally escalate the lack of progress regarding my registered police complaint. The primary reason for escalation is: <strong>${formReason}</strong>.</p>
        <p>Citizen's Statement: <em>"${formDesc}"</em></p>
        <div style="margin: 20px 0; padding: 15px; border: 1px solid #000;">
          <p style="margin: 5px 0;"><strong>FIR Number:</strong> ${complaintId}</p>
          <p style="margin: 5px 0;"><strong>Filed On:</strong> ${activeCase.filedAt}</p>
          <p style="margin: 5px 0;"><strong>Current IO:</strong> ${activeCase.officer}</p>
        </div>
        <p>I request your direct intervention to review this case file under higher authority. I look forward to your prompt response in the interest of justice.</p>
        <br/><br/>
        <p>Sincerely,</p>
        <br/><p>_______________________</p><p>[Citizen Signature]</p>
      </div>
    `;
    window.html2pdf().from(element).set({ margin: 1, filename: `Higher_Authority_Escalation_${complaintId}.pdf` }).save();
  };

  const handleWhatsAppSend = () => {
    const text = encodeURIComponent(`Regarding FIR ${complaintId}:\nReason: ${formReason}\nDetails: ${formDesc}\nPlease review this case urgently.`);
    // Using dummy number for higher auth
    window.open(`https://wa.me/911123456790?text=${text}`, '_blank');
  };

  const sendMsg = (textOverride = null) => {
    const textToSend = textOverride || chatInput;
    if (!textToSend.trim()) return;
    const nMsg = { id: Date.now(), text: textToSend, sender: "user" };
    setMessages(prev => [...prev, nMsg]);
    if (!textOverride) setChatInput('');
    setIsTyping(true);

    const systemInstruction = `You are the NyayaTrack Escalation Assistant. You help citizens escalate cases when police do not act. Current Case: FIR ${complaintId}, Status ${activeCase.status}, IO ${activeCase.officer}. Answer specifically about this case. If asked to draft a letter or WhatsApp message, output the exact draft with the real FIR details filled in. Instruct the user cleanly. Keep responses short and formatting clean (No markdown asterisks).`;
    const prompt = `${systemInstruction}\n\nUser: ${textToSend}`;

    fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    })
    .then(async (res) => {
      const data = await res.json();
      if(!res.ok) throw new Error(data.error?.message || "API Error");
      return data;
    })
    .then(data => {
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that.";
      setMessages(prev => [...prev, { id: Date.now()+1, text: aiText, sender: "ai" }]);
    })
    .catch(err => {
      setMessages(prev => [...prev, { id: Date.now()+1, text: "AI is unavailable right now.", sender: "ai" }]);
    })
    .finally(() => setIsTyping(false));
  };

  return (
    <div className="bg-[#F3F8FF] py-8 px-4 animate-fade-in-up">
      <div className="max-w-6xl mx-auto">
        <button className="flex items-center text-[#002B5B] font-semibold mb-6 hover:text-blue-700 transition-colors w-max" onClick={onBack}>
          <ArrowLeft /> <span className="ml-1">Back to Home</span>
        </button>

        <h1 className="text-3xl font-extrabold text-[#002B5B] mb-8">Case Escalation Center</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Contact Panel */}
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-[#002B5B] flex flex-col">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800"><MessageCircle/> Quick Contact Panel</h2>
            <div className="space-y-4 flex-grow">
              <div className="p-3 bg-blue-50 rounded border border-blue-100">
                <p className="font-bold text-sm text-gray-500">Investigating Officer</p>
                <p className="font-bold">{activeCase.officer}</p>
                <div className="mt-2 flex gap-2">
                  <a href="tel:+911123456789" className="text-sm bg-[#002B5B] text-white px-3 py-1 rounded hover:bg-blue-800">Call</a>
                  <a href={`https://wa.me/911123456789?text=Hello Inspector, regarding ${complaintId}...`} target="_blank" className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">WhatsApp</a>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded border border-blue-100">
                <p className="font-bold text-sm text-gray-500">Station House Officer (SHO)</p>
                <p className="font-bold">Vasant Kunj North PS</p>
                <div className="mt-2 flex gap-2">
                  <a href="tel:+911123456790" className="text-sm bg-[#002B5B] text-white px-3 py-1 rounded hover:bg-blue-800">Call</a>
                  <a href={`https://wa.me/911123456790?text=Hello SHO, escalating ${complaintId}...`} target="_blank" className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">WhatsApp</a>
                </div>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="font-semibold text-gray-600 border-b border-gray-300 pb-1 w-full flex justify-between">Police: <strong>100</strong></span>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="font-semibold text-gray-600 border-b border-gray-300 pb-1 w-full flex justify-between">Cyber: <strong>1930</strong></span>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="font-semibold text-gray-600 w-full flex justify-between">Women HF: <strong>1091</strong></span>
              </div>
            </div>
          </div>

          {/* AI Escalation Assistant */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 lg:col-span-2 flex flex-col h-[600px]">
            <div className="p-4 border-b border-gray-200 bg-blue-50 rounded-t-xl flex items-center gap-3">
               <div className="bg-[#002B5B] text-white p-2 rounded-full"><AlertTriangle /></div>
               <div><h3 className="font-bold text-lg text-gray-900">AI Escalation Assistant</h3>
               <p className="text-xs text-gray-500">Specialized help for neglected issues</p></div>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
               {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender==='user'?'justify-end':'justify-start'}`}>
                     <div className={`max-w-[85%] rounded-xl p-3 text-sm ${msg.sender==='user'?'bg-[#002B5B] text-white rounded-tr-sm':'bg-gray-100 text-gray-800 border border-gray-200 rounded-tl-sm'}`}>
                        {msg.text.split('\\n').map((l,i,a) => <React.Fragment key={i}>{l}{i!==a.length-1&&<br/>}</React.Fragment>)}
                     </div>
                  </div>
               ))}
               {isTyping && <div className="text-gray-400 italic text-sm py-2">AI is typing...</div>}
            </div>
            
            <div className="p-3 bg-gray-50 border-t border-gray-200">
               <div className="flex flex-wrap gap-2 mb-3">
                 {quickPrompts.map(p => (
                   <button key={p} onClick={()=>handlePromptClick(p)} className="text-xs bg-white border border-[#002B5B] text-[#002B5B] px-3 py-1.5 rounded-full hover:bg-blue-50 transition shadow-sm font-semibold whitespace-nowrap">
                     {p}
                   </button>
                 ))}
               </div>
               <form onSubmit={(e)=>{e.preventDefault();sendMsg();}} className="relative">
                  <input type="text" value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Ask how to escalate..." className="w-full bg-white border border-gray-300 p-3 rounded-lg pr-20 outline-none focus:border-[#002B5B]" />
                  <button type="submit" disabled={!chatInput.trim()||isTyping} className="absolute right-1 top-1 bottom-1 bg-[#002B5B] text-white px-4 rounded-md font-semibold hover:bg-blue-900 disabled:opacity-50">Send</button>
               </form>
            </div>
          </div>
          
          {/* Report Form */}
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-red-600 md:col-span-2 lg:col-span-1 h-fit">
             <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800"><AlertTriangle/> Report to Higher Authority</h2>
             <div className="space-y-4">
                <div>
                   <label className="block text-sm font-semibold text-gray-600 mb-1">Complaint ID</label>
                   <input type="text" value={complaintId} disabled className="w-full bg-gray-100 border border-gray-200 rounded p-2 text-gray-500 font-mono" />
                </div>
                <div>
                   <label className="block text-sm font-semibold text-gray-600 mb-1">Reason for Escalation</label>
                   <select value={formReason} onChange={e=>setFormReason(e.target.value)} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-[#002B5B]">
                      <option>No action taken</option>
                      <option>Case neglected</option>
                      <option>Officer misbehavior</option>
                      <option>Demanding bribe</option>
                      <option>Other</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
                   <textarea rows="3" value={formDesc} onChange={e=>setFormDesc(e.target.value)} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-[#002B5B] resize-none" placeholder="Provide details..."></textarea>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                   <button onClick={generatePDFLetter} className="w-full bg-red-600 text-white font-bold py-2 rounded hover:bg-red-700 transition shadow">Generate Formal Letter (PDF)</button>
                   <button onClick={handleWhatsAppSend} className="w-full border border-green-600 text-green-700 font-bold py-2 rounded hover:bg-green-50 transition shadow-sm">Send via WhatsApp</button>
                </div>
             </div>
          </div>

          {/* Escalation Hierarchy */}
          <div className="bg-white rounded-xl shadow-md p-6 md:col-span-2 border border-gray-100">
             <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800 w-full justify-center">Escalation Protocol Ladder</h2>
             <div className="flex flex-col md:flex-row justify-between items-center text-center gap-4 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 hidden md:block mt-[-10px]"></div>
                
                {[
                  { level: "1. IO", desc: "Investigating Officer" },
                  { level: "2. SHO", desc: "Station House Officer (15 Days)" },
                  { level: "3. DSP", desc: "Deputy Superintendent" },
                  { level: "4. SP/DCP", desc: "Superintendent of Police (30 Days)" },
                  { level: "5. IGP", desc: "Inspector General" },
                  { level: "6. DGP", desc: "Director General" }
                ].map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center bg-white p-2">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-white shadow-md z-10 ${idx < 2 ? 'bg-amber-500' : idx < 4 ? 'bg-orange-500' : 'bg-red-600'}`}>{step.level.split('.')[1]}</div>
                    <span className="text-xs font-bold text-gray-700 mt-2">{step.desc}</span>
                  </div>
                ))}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
