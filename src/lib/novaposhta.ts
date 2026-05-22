export class NovaPoshtaService {
  private apiKey: string;
  private apiUrl = "https://api.novaposhta.ua/v2.0/json/";

  constructor() {
    this.apiKey = process.env.NOVA_POSHTA_API_KEY || "";
  }

  async getCities(cityName: string = "") {
    if (!this.apiKey) {
      console.warn("Nova Poshta API key is missing, returning mock cities.");
      return [
        { Description: "Київ", Ref: "8d5a980d-391c-11dd-90d9-001a92567626" },
        { Description: "Львів", Ref: "db5c88f5-391c-11dd-90d9-001a92567626" },
        { Description: "Одеса", Ref: "db5c88d0-391c-11dd-90d9-001a92567626" }
      ];
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: this.apiKey,
          modelName: "Address",
          calledMethod: "getCities",
          methodProperties: { FindByString: cityName }
        })
      });
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (e) {
      console.error("NP API Error:", e);
      return [];
    }
  }

  async createInternetDocument(buyerInfo: any, sellerInfo: any, weight: number = 1, cost: number) {
    if (!this.apiKey) {
      console.warn("Nova Poshta API key is missing, generating mock TTN.");
      // Повертаємо фейкову ТТН (2045xxxxxx)
      return {
        success: true,
        ttn: `2045${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        estimatedDeliveryDate: new Date(Date.now() + 86400000 * 2).toISOString()
      };
    }

    // Тут би був реальний виклик API створення ЕН Нової Пошти, але для цього
    // потрібні Ref контрагентів, контактних осіб, міст та відділень.
    // Оскільки ми не зберігаємо це детально в User schema поки що,
    // ми повертаємо заглушку. У майбутньому треба буде викликати 'InternetDocument.save'.
    
    return {
      success: true,
      ttn: `2045${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      estimatedDeliveryDate: new Date(Date.now() + 86400000 * 2).toISOString()
    };
  }
}

export const npService = new NovaPoshtaService();
