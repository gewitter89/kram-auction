// Nova Poshta Integration Service for KRAM
// https://devcenter.novaposhta.ua/

const NOVA_POSHTA_API_KEY = process.env.NOVA_POSHTA_API_KEY || ''
const NOVA_POSHTA_API_URL = 'https://api.novaposhta.ua/v2.0/json/'

// Generic API request function
async function novaPoshtaRequest<T>(
  model: string,
  method: string,
  params: Record<string, any> = {}
): Promise<T | null> {
  if (!NOVA_POSHTA_API_KEY) {
    console.error('Nova Poshta API key not configured')
    return null
  }

  try {
    const response = await fetch(NOVA_POSHTA_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: NOVA_POSHTA_API_KEY,
        modelName: model,
        calledMethod: method,
        methodProperties: params,
      }),
    })

    if (!response.ok) {
      console.error('Nova Poshta API error:', response.status)
      return null
    }

    const data = await response.json()

    if (data.errors && data.errors.length > 0) {
      console.error('Nova Poshta API errors:', data.errors)
      return null
    }

    return data.data as T
  } catch (error) {
    console.error('Nova Poshta request failed:', error)
    return null
  }
}

// City types
export interface NovaPoshtaCity {
  Ref: string
  Description: string
  DescriptionRu: string
  Area: string
  SettlementType: string
}

// Warehouse types
export interface NovaPoshtaWarehouse {
  Ref: string
  Description: string
  DescriptionRu: string
  Number: string
  CityRef: string
  CityDescription: string
  TypeOfWarehouse: string
}

// Tracking types
export interface NovaPoshtaTrackingDocument {
  Number: string
  Redelivery: number
  DateCreated: string
  PreferredDeliveryDate: string
  ScheduledDeliveryDate: string
  DocumentWeight: number
  CheckWeight: number
  CheckWeightMethod: string
  DocumentCost: number
  SumBeforeCheckWeight: number
  PayerType: string
  RecipientFullName: string
  RecipientPostIndex: string
  RecipientAddress: string
  RecipientDateTime: string
  ActualDeliveryDate: string
  TrackingStatusCode: string
  TrackingStatus: string
  StatusCode: string
  Status: string
}

/**
 * Search cities by query
 */
export async function searchCities(query: string): Promise<NovaPoshtaCity[]> {
  if (!query || query.length < 2) return []

  const result = await novaPoshtaRequest<NovaPoshtaCity[]>(
    'AddressGeneral',
    'searchSettlements',
    { CityName: query, Limit: 20 }
  )

  return result || []
}

/**
 * Get warehouses for a city
 */
export async function getWarehouses(
  cityRef: string,
  query?: string
): Promise<NovaPoshtaWarehouse[]> {
  if (!cityRef) return []

  const params: Record<string, any> = {
    CityRef: cityRef,
    Limit: 100,
  }

  if (query) {
    params.FindByString = query
  }

  const result = await novaPoshtaRequest<NovaPoshtaWarehouse[]>(
    'AddressGeneral',
    'getWarehouses',
    params
  )

  return result || []
}

/**
 * Get postomat (self-service terminals) for a city
 */
export async function getPostomats(cityRef: string): Promise<NovaPoshtaWarehouse[]> {
  if (!cityRef) return []

  const result = await novaPoshtaRequest<NovaPoshtaWarehouse[]>(
    'AddressGeneral',
    'getWarehouses',
    {
      CityRef: cityRef,
      TypeOfWarehouseRef: '6e53f6df-c056-11e5-9d5a-0050568c3a0d', // Postomat type
      Limit: 100,
    }
  )

  return result || []
}

/**
 * Calculate delivery cost
 */
export async function calculateDeliveryCost(params: {
  citySenderRef: string
  cityRecipientRef: string
  weight: number
  serviceType: 'DoorsDoors' | 'DoorsWarehouse' | 'WarehouseDoors' | 'WarehouseWarehouse'
  cost?: number
}): Promise<{
  cost: number
  assessedCost: number
} | null> {
  const result = await novaPoshtaRequest<any[]>(
    'InternetDocument',
    'getDocumentPrice',
    {
      CitySender: params.citySenderRef,
      CityRecipient: params.cityRecipientRef,
      Weight: params.weight,
      ServiceType: params.serviceType,
      Cost: params.cost || 100,
      CargoType: 'Parcel',
      SeatsAmount: 1,
    }
  )

  if (!result || result.length === 0) return null

  return {
    cost: result[0].Cost || 0,
    assessedCost: result[0].AssessedCost || 0,
  }
}

/**
 * Track document by tracking number
 */
export async function trackDocument(
  trackingNumber: string
): Promise<NovaPoshtaTrackingDocument | null> {
  if (!trackingNumber) return null

  const result = await novaPoshtaRequest<NovaPoshtaTrackingDocument[]>(
    'TrackingDocument',
    'getStatusDocuments',
    {
      Documents: [{ DocumentNumber: trackingNumber }],
    }
  )

  if (!result || result.length === 0) return null

  return result[0]
}

/**
 * Get human-readable status description
 */
export function getTrackingStatusDescription(statusCode: string): string {
  const statusMap: Record<string, string> = {
    '1': 'Створено',
    '2': 'Видалено',
    '3': 'Номер не знайдено',
    '4': 'Відправлення у місті ХХX',
    '5': 'Відправлення прямує до міста YYY',
    '6': 'Відправлення у місті YYY, орієнтовна доставка до Відділення ZZZZ',
    '7': 'Прибув у відділення',
    '8': 'Прибув у відділення (контрагент)',
    '9': 'Відправлення отримано',
    '10': 'Відправлення отримано %DateReceived%',
    '11': 'Відправлення доставлене',
    '12': 'Нова Пошта очікує надходження від відправника',
    '14': 'Відправлення передане до огляду отримувачу',
    '101': 'На шляху до одержувача',
    '102': 'Повернення відправлень прямує до відправника',
    '103': 'Відмова одержувача',
    '104': 'Зміна адреси/змінено БЕЗКОШТОВНО!',
    '105': 'Припинено зберігання',
    '106': 'Одержано і створено ЄН накладну',
  }

  return statusMap[statusCode] || 'Невідомий статус'
}

/**
 * Check if API is configured
 */
export function isNovaPoshtaConfigured(): boolean {
  return !!NOVA_POSHTA_API_KEY
}
