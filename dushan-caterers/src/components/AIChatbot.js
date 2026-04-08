// src/components/AIChatbot.js
import React, { useState, useRef, useEffect } from 'react';
import { getChatbotResponse } from '../utils/gemini';

const QUICK_REPLIES = ['Wedding packages','Birthday catering','Corporate events','Pricing info','Contact details','View menu'];
const QUICK_ICONS   = ['bi-heart-fill','bi-balloon-fill','bi-briefcase-fill','bi-currency-exchange','bi-telephone-fill','bi-menu-button-wide-fill'];

export default function AIChatbot() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([{ id:1, sender:'bot', text:"Hi! I'm **Dushi** — your AI catering assistant for Dushan Caterers. How can I help you today?", time: new Date() }]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;
    setMessages(prev => [...prev, { id:Date.now(), sender:'user', text:userText, time:new Date() }]);
    setInput('');
    setLoading(true);
    const reply = await getChatbotResponse(userText, messages.slice(-10));
    setMessages(prev => [...prev, { id:Date.now()+1, sender:'bot', text:reply, time:new Date() }]);
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const fmt = (text) => text.split(/\*\*(.*?)\*\*/g).map((p,i) => i%2===1 ? <strong key={i}>{p}</strong> : p);

  return (
    <>
      <button style={S.fab} onClick={() => setOpen(p=>!p)}>
        {open ? <i className="bi bi-x-lg"/> : <><span style={S.fabDot}/><i className="bi bi-chat-dots-fill" style={{marginRight:6}}/> Chat with Dushi</>}
      </button>

      {open && (
        <div style={S.window}>
          <div style={S.header}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={S.avatar}><i className="bi bi-robot" style={{fontSize:18,color:'#1A1A1A'}}/></div>
              <div>
                <div style={{color:'#fff',fontWeight:700,fontSize:14}}>Dushi AI</div>
                <div style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'#aaa'}}>
                  <span style={{width:6,height:6,borderRadius:'50%',background:'#4CAF50',display:'inline-block'}}/> Powered by Gemini
                </div>
              </div>
            </div>
            <button style={S.closeBtn} onClick={()=>setOpen(false)}><i className="bi bi-x-lg"/></button>
          </div>

          <div style={S.messages}>
            {messages.map(msg => (
              <div key={msg.id} style={{...S.msgRow, justifyContent: msg.sender==='user'?'flex-end':'flex-start'}}>
                {msg.sender==='bot' && <div style={S.msgAvatar}><i className="bi bi-robot" style={{fontSize:13}}/></div>}
                <div style={{...S.bubble,...(msg.sender==='user'?S.userBubble:S.botBubble)}}>
                  {fmt(msg.text)}
                  <div style={{fontSize:10,color:'#aaa',marginTop:4,textAlign:'right'}}>
                    {msg.time.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{...S.msgRow,justifyContent:'flex-start'}}>
                <div style={S.msgAvatar}><i className="bi bi-robot" style={{fontSize:13}}/></div>
                <div style={{...S.botBubble,...S.bubble}}>
                  <div style={{display:'flex',gap:4,padding:'4px 2px'}}>
                    {[0,1,2].map(i=><span key={i} style={{width:8,height:8,borderRadius:'50%',background:'#aaa',display:'inline-block',animation:`dotBounce 1.4s ${i*0.2}s infinite`}}/>)}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {messages.length<=2 && (
            <div style={S.quickReplies}>
              {QUICK_REPLIES.map((r,i)=>(
                <button key={r} style={S.quickBtn} onClick={()=>sendMessage(r)}>
                  <i className={`bi ${QUICK_ICONS[i]}`} style={{marginRight:4}}/>{r}
                </button>
              ))}
            </div>
          )}

          <div style={S.inputRow}>
            <input style={S.input} value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={handleKey} placeholder="Ask me anything..." disabled={loading}/>
            <button style={{...S.sendBtn,opacity:loading||!input.trim()?0.5:1}}
              onClick={()=>sendMessage()} disabled={loading||!input.trim()}>
              <i className="bi bi-send-fill"/>
            </button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes dotBounce{0%,80%,100%{transform:translateY(0);opacity:0.4}40%{transform:translateY(-5px);opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
      `}</style>
    </>
  );
}

const GOLD='#D4AF37', DARK='#1A1A1A';
const S={
  fab:{position:'fixed',bottom:24,right:24,background:GOLD,color:DARK,border:'none',borderRadius:50,padding:'12px 20px',cursor:'pointer',fontWeight:700,fontSize:14,fontFamily:'Jost,sans-serif',boxShadow:'0 4px 20px rgba(212,175,55,0.4)',zIndex:9999,display:'flex',alignItems:'center',gap:6},
  fabDot:{width:8,height:8,borderRadius:'50%',background:'#4CAF50',animation:'pulse 1.5s infinite'},
  window:{position:'fixed',bottom:80,right:24,width:360,height:520,background:'#fff',borderRadius:16,boxShadow:'0 8px 40px rgba(0,0,0,0.18)',zIndex:9998,display:'flex',flexDirection:'column',overflow:'hidden',animation:'slideUp 0.3s ease',fontFamily:'Jost,sans-serif'},
  header:{background:DARK,padding:'14px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'},
  avatar:{width:36,height:36,borderRadius:'50%',background:GOLD,display:'flex',alignItems:'center',justifyContent:'center'},
  closeBtn:{background:'none',border:'none',color:'#888',cursor:'pointer',fontSize:16},
  messages:{flex:1,overflowY:'auto',padding:'12px 12px 4px',display:'flex',flexDirection:'column',gap:10},
  msgRow:{display:'flex',alignItems:'flex-end',gap:6},
  msgAvatar:{width:28,height:28,borderRadius:'50%',background:'#f0f0f0',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0},
  bubble:{maxWidth:'80%',padding:'10px 14px',borderRadius:16,fontSize:13,lineHeight:1.5},
  botBubble:{background:'#f5f5f5',color:DARK,borderBottomLeftRadius:4},
  userBubble:{background:GOLD,color:DARK,borderBottomRightRadius:4,fontWeight:500},
  quickReplies:{padding:'8px 12px',display:'flex',flexWrap:'wrap',gap:6,borderTop:'1px solid #f0f0f0'},
  quickBtn:{padding:'5px 10px',border:`1px solid ${GOLD}`,borderRadius:20,background:'#fff',color:DARK,fontSize:11,cursor:'pointer',fontFamily:'Jost,sans-serif',display:'flex',alignItems:'center'},
  inputRow:{display:'flex',gap:8,padding:'10px 12px',borderTop:'1px solid #f0f0f0'},
  input:{flex:1,padding:'9px 14px',border:'1px solid #ddd',borderRadius:24,fontSize:13,fontFamily:'Jost,sans-serif',outline:'none'},
  sendBtn:{width:38,height:38,borderRadius:'50%',background:GOLD,color:DARK,border:'none',cursor:'pointer',fontSize:15,display:'flex',alignItems:'center',justifyContent:'center'},
};