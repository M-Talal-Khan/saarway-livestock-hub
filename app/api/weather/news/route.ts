import { NextRequest, NextResponse } from "next/server";

interface NewsItem {
  category: string;
  title: string;
  summary: string;
  time: string;
  source: string;
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = "llama-3.1-8b-instant";

// Pakistan agriculture & livestock focused fallback news
const PAKISTAN_NEWS = [
  // Heatwave conditions
  { temp: [38, 50], category: "Advisory", title: "Punjab Heatwave: Temps Reach 44°C", summary: "Farmers advised to ensure constant water supply. Shade structures critical for animal comfort.", time: "Live", source: "Dawn Agri" },
  { temp: [38, 50], category: "Health", title: "Heat Stress Cases Surge at Veterinary Hospitals", summary: "Lahore and Faisalabad report 40% increase in cattle heat stress. Early morning grazing recommended.", time: "1h ago", source: "Express Tribune" },
  { temp: [38, 50], category: "Tip", title: "Electrolyte Supplements for Dairy Cattle", summary: "Add glucose and salt to drinking water during extreme heat to prevent dehydration.", time: "3h ago", source: "PARC" },
  { temp: [38, 50], category: "Warning", title: "Feedlot Mortality Risk: Heatwave Protocol", summary: "Crossbred cattle most vulnerable. Move animals to shaded areas by 10am.", time: "2h ago", source: "Livestock Dept" },

  // Cold conditions
  { temp: [-20, 5], category: "Warning", title: "Cold Wave Alert: Punjab and Sindh", summary: "Temperature expected to drop to 1°C in rural areas. Young animals need extra care.", time: "Live", source: "PMD" },
  { temp: [-20, 5], category: "Advisory", title: "Calf Shelter Guidelines During Winter", summary: "Maintain 15-20°C in shelter. Bedding straw should be double the normal amount.", time: "2h ago", source: "Vet Services" },
  { temp: [-20, 5], category: "Health", title: "Pneumonia Outbreak Warning for Young Stock", summary: "Respiratory cases rising in unvaccinated calves. Ventilation without drafts essential.", time: "4h ago", source: "FAO Pakistan" },
  { temp: [-20, 5], category: "Market", title: "Feed Prices Rise 15% Due to Winter Demand", summary: "Concentrate prices up as farmers increase feeding for body heat maintenance.", time: "5h ago", source: "PBS" },

  // Rainy conditions
  { temp: [0, 100], rain: true, category: "Alert", title: "Monsoon 2026: Above Normal Rainfall Expected", summary: "PMD predicts 20% above average rainfall. Prepare flood barriers on low-lying farms.", time: "Live", source: "PMD" },
  { temp: [0, 100], rain: true, category: "Warning", title: "Flash Flood Risk in Riverine Areas", summary: "Chenab and Ravi basins at risk. Move livestock to higher elevations.", time: "1h ago", source: "PDMA" },
  { temp: [0, 100], rain: true, category: "Health", title: "Foot Rot and Mastitis Prevention After Floods", summary: "Increase shelter cleanliness. Hoof bath with copper sulfate recommended.", time: "3h ago", source: "Livestock Research" },
  { temp: [0, 100], rain: true, category: "Market", title: "Fodder Prices Spike Due to Crop Damage", summary: "Flood-affected areas see 30% increase in berseem and wheat straw prices.", time: "4h ago", source: "Market Desk" },

  // Normal conditions
  { temp: [15, 37], category: "Update", title: "Optimal Weather for Summer Crops", summary: "Current conditions favorable for maize and rice cultivation.", time: "Live", source: "Agri Extension" },
  { temp: [15, 37], category: "Market", title: "SIAL: Beef Prices Stable This Week", summary: "Live beef at PKR 550-600/kg. Good demand for quality animals.", time: "2h ago", source: "SIAL" },
  { temp: [15, 37], category: "Tip", title: "Best Grazing Hours: 5-8 AM and 4-7 PM", summary: "Pasture quality peaks in early morning. Avoid midday grazing in summer.", time: "4h ago", source: "Livestock Advisor" },
  { temp: [15, 37], category: "Health", title: "Vaccination Campaign: FMD Prevention Week", summary: "Free foot-and-mouth disease vaccination available at all tehsil offices.", time: "6h ago", source: "Govt Health" },
  { temp: [15, 37], category: "Update", title: "New Dairy Farming Techniques Workshop", summary: "University of Agriculture Faisalabad hosting free training sessions.", time: "Yesterday", source: "UAF" },
  { temp: [15, 37], category: "Market", title: "Buffalo Milk Prices Hold at PKR 180/liter", summary: "Urban demand steady. Rural prices remain lower at PKR 140-150.", time: "5h ago", source: "Price Monitor" },
];

function getRelevantNews(temp: number, isRainy: boolean): NewsItem[] {
  let relevant = PAKISTAN_NEWS.filter(n => {
    if (n.rain && !isRainy) return false;
    if (!n.rain && isRainy) return true;
    return temp >= n.temp[0] && temp <= n.temp[1];
  });

  if (relevant.length < 3) {
    const normalNews = PAKISTAN_NEWS.filter(n => n.temp[0] === 15 && !n.rain);
    relevant = [...relevant, ...normalNews].slice(0, 5);
  }

  return relevant.slice(0, 5).sort(() => Math.random() - 0.5);
}

async function fetchGroqNews(temp: number, description: string, city: string): Promise<NewsItem[] | null> {
  if (!GROQ_API_KEY) return null;

  const today = new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const prompt = `You are a Pakistani agriculture and livestock news generator. Today is ${today}. The current weather in ${city || "Pakistan"} is ${temp}°C with ${description || "clear skies"}.

Generate exactly 5 realistic, helpful news items about Pakistan's livestock industry, cattle farming, dairy market, veterinary health, or weather impact on farming. Each item must be directly relevant to cattle/buffalo farming in Pakistan.

The news should feel current and vary in category. Mix advisories, market updates, health tips, and weather impacts.

Respond ONLY with a valid JSON array. No markdown, no explanation. Each item must have exactly these fields:
[
  {
    "category": "Advisory|Health|Market|Tip|Warning|Update|Alert",
    "title": "Short headline under 60 chars",
    "summary": "One sentence summary under 120 chars",
    "time": "Live|1h ago|2h ago|3h ago|Today",
    "source": "A realistic Pakistani news source name"
  }
]`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
        temperature: 0.9,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return null;

    // Extract JSON array from response (handle potential markdown wrapping)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(parsed) || parsed.length === 0) return null;

    // Validate and sanitize each item
    const validNews: NewsItem[] = parsed
      .filter((item: any) => item.title && item.summary && item.category)
      .slice(0, 5)
      .map((item: any) => ({
        category: String(item.category).substring(0, 20),
        title: String(item.title).substring(0, 60),
        summary: String(item.summary).substring(0, 120),
        time: String(item.time || "Today").substring(0, 10),
        source: String(item.source || "Livestock Desk").substring(0, 25),
      }));

    return validNews.length >= 3 ? validNews : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const temp = parseInt(searchParams.get("temp") || "25");
  const description = (searchParams.get("desc") || "").toLowerCase();
  const city = searchParams.get("city") || "Pakistan";
  const isRainy = description.includes("rain") || description.includes("drizzle") || description.includes("shower");

  // Try Groq AI for fresh, dynamic news
  const groqNews = await fetchGroqNews(temp, description, city);
  if (groqNews) {
    return NextResponse.json({
      news: groqNews,
      source: "AI Generated"
    });
  }

  // Fallback to curated Pakistan-specific contextual news
  const news = getRelevantNews(temp, isRainy);
  return NextResponse.json({
    news,
    source: isRainy ? "Rain Advisory" : temp >= 38 ? "Heat Alert" : temp <= 5 ? "Cold Warning" : "Pakistan Agri"
  });
}