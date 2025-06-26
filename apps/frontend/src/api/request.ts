interface RequestOptions extends RequestInit {
  data?: Record<string, any>
}

export async function request<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { data, headers, ...rest } = options
  
  const config: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...rest,
  }

  if (data) {
    config.body = JSON.stringify(data)
  }

  const response = await fetch(url, config)
  const result = await response?.json()

  if (!response.ok) {
    throw new Error(result.message || 'Request failed')
  }

  return result as T
}
