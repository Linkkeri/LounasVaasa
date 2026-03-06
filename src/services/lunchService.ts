import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface MenuItem {
  name: string;
  description?: string;
}

export interface RestaurantMenu {
  restaurantName: string;
  price?: string;
  items: MenuItem[];
  url: string;
}

export async function fetchLunchMenus(date: Date): Promise<RestaurantMenu[]> {
  const dateStr = date.toLocaleDateString('fi-FI', { day: 'numeric', month: 'numeric', year: 'numeric' });
  const dayName = date.toLocaleDateString('fi-FI', { weekday: 'long' });

  const prompt = `Hae tämän päivän (${dateStr}, ${dayName}) lounaslista näistä osoitteista:
1. https://www.fivedayslunch.fi/ruokalista/
2. https://www.raflaamo.fi/fi/ravintola/vaasa/pizza-buffa-prisma-liisanlehto-vaasa/menu/lounas
3. https://ravintolaflow.fi/etusivu/

Etsi nimenomaan tämän päivän (${dayName}, ${dateStr}) tiedot. Jos ravintolalla on viikoittainen lista, poimi vain kyseisen päivän kohdalta.
Palauta tiedot JSON-muodossa.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ urlContext: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              restaurantName: { type: Type.STRING },
              price: { type: Type.STRING },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ["name"],
                },
              },
            },
            required: ["restaurantName", "items"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Tyhjä vastaus mallilta");
    
    const menus: RestaurantMenu[] = JSON.parse(text);
    
    // Add URLs back since the model might not return them exactly as requested in schema
    const urls = [
      "https://www.fivedayslunch.fi/ruokalista/",
      "https://www.raflaamo.fi/fi/ravintola/vaasa/pizza-buffa-prisma-liisanlehto-vaasa/menu/lounas",
      "https://ravintolaflow.fi/etusivu/"
    ];
    
    return menus.map((menu, index) => ({
      ...menu,
      url: urls[index] || ""
    }));
  } catch (error) {
    console.error("Virhe haettaessa lounaslistoja:", error);
    throw error;
  }
}
