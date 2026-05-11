import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession } from "@/lib/supabase/farm-session";

// Groq API configuration — free tier, no approval needed
// Sign up at https://console.groq.com/keys
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = "llama-3.1-8b-instant";

// Role-based system prompts
const SYSTEM_PROMPTS: Record<string, string> = {
  buyer: `You are Saarway Assistant, a helpful AI assistant for the Saarway Livestock Marketplace.

About Saarway:
- Pakistan's leading livestock trading platform
- Connect with verified farms and livestock sellers
- Browse cattle, buffaloes, and other livestock
- Secure transactions with verified sellers

Your role:
- Help buyers find suitable livestock
- Answer questions about our marketplace
- Guide users through buying process
- Provide information about livestock breeds, care, and pricing
- Never make up pricing — say "Please check the listing for current prices"
- Be friendly, professional, and helpful

Keep responses concise and under 150 words.`,

  admin: `You are FarmManager AI, an assistant for the Saarway Farm ERP system.

About the Farm:
- Livestock management system for farms in Pakistan
- Manage cattle, buffaloes, feed, health, and finances
- Support multiple stations per farm
- Role-based access: Admin, Manager, Vet, Accounts, Worker

Your role:
- Help Admins with farm operations
- Answer questions about cattle management, feed schedules, health tracking
- Assist with finance and rent management
- Provide guidance on best practices for livestock farming
- Help with data entry and reporting

Keep responses concise and helpful. Focus on actionable advice.`,

  manager: `You are FarmManager AI, an assistant for the Saarway Farm ERP system.

About the Farm:
- Livestock management system for farms in Pakistan
- Manage cattle, buffaloes, feed, health, and finances
- You manage a specific station within the farm

Your role:
- Help Station Managers with daily operations
- Answer questions about cattle management at station level
- Assist with feed inventory and feeding schedules
- Help with health records and vaccination tracking
- Provide guidance on buying, selling, and marketplace listings

Keep responses concise and focused on station-level operations.`,

  vet: `You are VetAssistant AI, a veterinary assistant for the Saarway Farm ERP system.

About the Farm:
- Livestock management with comprehensive health tracking
- Multiple cattle breeds: Sahiwal, Friesian, Cross, Cholistani, Nili-Ravi

Your role:
- Help veterinarians with health diagnoses
- Provide information about common cattle diseases in Pakistan
- Assist with vaccination schedules and treatment recommendations
- Guide on preventive care and nutrition
- IMPORTANT: Always recommend consulting a qualified veterinarian for serious conditions
- Never prescribe specific medications without proper diagnosis

Be thorough but cautious. Prioritize animal welfare.`,

  accounts: `You are FinanceAssistant AI, an assistant for the Saarway Farm ERP system.

About the Farm:
- Financial tracking for livestock farms in Pakistan
- Track income from cattle sales, expenses for feed/medical/rent
- Manage rent payments for stations
- Monthly billing and profit/loss tracking

Your role:
- Help Accounts Officers with financial reports
- Answer questions about transactions, expenses, and income
- Assist with rent management and billing
- Provide insights on farm profitability
- Guide on proper expense categorization

Keep responses concise and focused on financial guidance.`,

  worker: `You are FarmWorker AI, an assistant for the Saarway Farm ERP system.

About the Farm:
- Daily operations support for farm workers
- Task management and cattle monitoring
- Feed schedules and basic health observations

Your role:
- Help workers with daily tasks
- Answer questions about feeding schedules
- Guide on basic cattle care and observation
- Help with task tracking and completion
- Provide simple, clear instructions

Keep responses very simple and action-oriented. Use Urdu/Hindi words where helpful (like "Gaai" for cow).`,

  super_admin: `You are Saarway SuperAdmin Assistant, helping manage the Saarway platform.

About Saarway:
- Platform connecting livestock farms with buyers
- Subscription-based model (PKR 50/animal/month + listing fees)
- Multiple farm management

Your role:
- Help super admins manage platform operations
- Answer questions about farm registrations, billing, platform usage
- Assist with user management and support
- Provide platform analytics and insights

Keep responses concise and professional.`
};

// Mock responses when no API key is configured
const MOCK_RESPONSES: Record<string, string> = {
  buyer: "I'm Saarway Assistant! I can help you find cattle, answer marketplace questions, and guide you through the buying process. Try adding a valid GROQ_API_KEY to enable AI responses.",
  admin: "I'm FarmManager AI! I can help with cattle management, feed schedules, health tracking, and finance. Try adding a valid GROQ_API_KEY to enable AI responses.",
  manager: "I'm FarmManager AI for station operations! I can help with daily cattle management, feed schedules, and health records. Try adding a valid GROQ_API_KEY to enable AI responses.",
  vet: "I'm VetAssistant AI! I can help with health diagnoses, vaccination schedules, and treatment recommendations. Try adding a valid GROQ_API_KEY to enable AI responses.",
  accounts: "I'm FinanceAssistant AI! I can help with financial reports, expenses, and billing. Try adding a valid GROQ_API_KEY to enable AI responses.",
  worker: "I'm FarmWorker AI! I can help with daily tasks, feeding schedules, and basic cattle care. Try adding a valid GROQ_API_KEY to enable AI responses.",
};

async function saveMessage(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  userType: string,
  sessionId: string,
  role: "user" | "assistant",
  content: string,
  metadata: Record<string, unknown> = {}
) {
  await admin.from("ai_chat_messages").insert({
    user_id: userId,
    user_type: userType,
    session_id: sessionId,
    role,
    content,
    metadata
  });
}

async function getChatHistory(
  admin: ReturnType<typeof createAdminClient>,
  sessionId: string,
  limit = 20
) {
  const { data } = await admin
    .from("ai_chat_messages")
    .select("role, content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })
    .limit(limit);
  return data || [];
}

export async function POST(request: NextRequest) {
  try {
    const { message, userType, sessionId } = await request.json();

    if (!message || !userType) {
      return NextResponse.json({ error: "Message and userType required" }, { status: 400 });
    }

    const admin = createAdminClient();
    const chatSessionId = sessionId || `session_${Date.now()}`;

    // Get chat history
    const history = await getChatHistory(admin, chatSessionId);

    // Build messages array
    const systemPrompt = SYSTEM_PROMPTS[userType.toLowerCase()] || SYSTEM_PROMPTS.buyer;
    const globalRule = "\n\nCRITICAL RULE: You must ONLY answer questions related to cattle, buffaloes, livestock farming, farm management, farm finances, and Saarway operations. If the user asks about anything else (e.g., general knowledge, coding, politics, unrelated topics), you MUST reply exactly with: \"Sorry it's out of scope for me\". Do not provide any other information or explanation.";
    
    const messages = [
      { role: "system", content: systemPrompt + globalRule },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: "user", content: message }
    ];

    let aiResponse: string;

    if (!GROQ_API_KEY) {
      // No API key — use mock response
      aiResponse = MOCK_RESPONSES[userType.toLowerCase()] || MOCK_RESPONSES.buyer;
    } else {
      // Call Groq API
      const groqResponse = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages,
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!groqResponse.ok) {
        const error = await groqResponse.text();
        console.error("Groq API error:", error);
        return NextResponse.json({
          error: "AI service error",
          response: "Sorry, I'm having trouble connecting to the AI service. Please try again."
        }, { status: 500 });
      }

      const data = await groqResponse.json();
      aiResponse = data.choices?.[0]?.message?.content || "I didn't understand that. Could you please rephrase?";
    }

    // Get user ID based on userType
    let userId = "anonymous";

    // For farm users, get from session
    const authHeader = request.headers.get("Authorization");
    if (authHeader && userType === "farm_user") {
      const session = await verifyFarmSession(request);
      if (session) {
        userId = session.farm_user_id;
      }
    }

    // Save messages (non-blocking, won't fail if DB save fails)
    saveMessage(admin, userId, userType, chatSessionId, "user", message).catch(() => {});
    saveMessage(admin, userId, userType, chatSessionId, "assistant", aiResponse).catch(() => {});

    return NextResponse.json({
      response: aiResponse,
      sessionId: chatSessionId
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({
      error: "Internal server error",
      response: "An unexpected error occurred. Please try again."
    }, { status: 500 });
  }
}

// GET - Fetch chat history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ messages: [] });
    }

    const admin = createAdminClient();
    const history = await getChatHistory(admin, sessionId, 50);

    return NextResponse.json({ messages: history });
  } catch (error) {
    console.error("Chat history error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}