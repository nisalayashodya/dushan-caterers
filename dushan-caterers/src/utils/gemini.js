// src/utils/gemini.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// ── CHATBOT ──────────────────────────────────────────────────────────────────
export async function getChatbotResponse(userMessage, chatHistory = []) {
  const systemPrompt = `You are "Dushi", a friendly and helpful AI assistant for Dushan Caterers, 
a premium catering company in Sri Lanka. 

You help customers with:
- Information about catering packages and pricing (Budget: LKR 500-800/person, Standard: LKR 800-1500/person, Premium: LKR 1500+/person)
- Menu recommendations based on event type (weddings, birthdays, corporate events, funerals, get-togethers)
- Booking and order inquiries
- General catering advice

Always be warm, professional and helpful. Keep responses concise (2-4 sentences max).
If asked about specific orders or account details, tell them to check their dashboard or contact us directly.
Always respond in English unless the customer writes in Sinhala or Tamil.
Never make up prices or specific availability — direct them to place an order for exact quotes.`;

  try {
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: 'Understood! I am Dushi, ready to help Dushan Caterers customers.' }],
        },
        // Include previous chat history
        ...chatHistory.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        })),
      ],
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  } catch (error) {
    console.error('Gemini chatbot error:', error);
    return "I'm having trouble connecting right now. Please try again in a moment or contact us directly at info@dushancaterers.lk 😊";
  }
}

// ── MENU RECOMMENDATION ───────────────────────────────────────────────────────
export async function getMenuRecommendation({ eventType, guestCount, budget, dietaryNeeds, menuItems }) {
  const menuList = menuItems.map(item =>
    `- ${item.name} (${item.category}) — LKR ${item.price}/person${item.tags ? ` [${item.tags.join(', ')}]` : ''}`
  ).join('\n');

  const prompt = `You are a professional catering consultant for Dushan Caterers in Sri Lanka.

A customer needs a menu recommendation with these details:
- Event Type: ${eventType}
- Number of Guests: ${guestCount}
- Budget per person: LKR ${budget}
- Dietary Requirements: ${dietaryNeeds || 'None specified'}

Available menu items:
${menuList}

Please recommend the best combination of menu items for this event. 
Respond ONLY in this exact JSON format (no extra text, no markdown):
{
  "recommendedItems": ["item name 1", "item name 2", "item name 3"],
  "reasoning": "Brief explanation of why these items suit this event",
  "estimatedTotal": 12000,
  "tips": "One practical tip for this type of event"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Clean up response and parse JSON
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Gemini menu recommendation error:', error);
    return null;
  }
}