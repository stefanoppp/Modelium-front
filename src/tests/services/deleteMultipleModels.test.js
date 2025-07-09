import { describe, it, expect, beforeEach, vi } from 'vitest'
import { deleteMultipleModels } from '@/services/apiService'
import apiClient from '@/services/apiService'

// Mock del apiClient
vi.mock('@/services/apiService', async () => {
  const actual = await vi.importActual('@/services/apiService')
  return {
    ...actual,
    default: {
      delete: vi.fn(),
      post: vi.fn()
    }
  }
})

describe('deleteMultipleModels', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock console methods para evitar spam en tests
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('debe usar DELETE por defecto y ser exitoso', async () => {
    const modelIds = ['1', '2', '3']
    const mockResponse = {
      data: {
        message: 'Successfully deleted 3 models',
        deleted_count: 3,
        method_used: 'DELETE'
      },
      headers: {
        'x-delete-method': 'DELETE',
        'x-operation-count': '3'
      }
    }

    apiClient.delete.mockResolvedValue(mockResponse)

    const result = await deleteMultipleModels(modelIds)

    expect(apiClient.delete).toHaveBeenCalledWith('/models/delete-multiple/', {
      data: { model_ids: modelIds }
    })
    expect(result).toEqual(mockResponse.data)
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Intentando eliminar 3 modelos usando método DELETE')
    )
  })

  it('debe hacer fallback a POST cuando DELETE falla con 405', async () => {
    const modelIds = ['1', '2']
    const deleteError = { response: { status: 405 } }
    const postResponse = {
      data: {
        message: 'Successfully deleted 2 models',
        deleted_count: 2,
        method_used: 'POST'
      },
      headers: {
        'x-delete-method': 'POST',
        'x-operation-count': '2'
      }
    }

    apiClient.delete.mockRejectedValue(deleteError)
    apiClient.post.mockResolvedValue(postResponse)

    const result = await deleteMultipleModels(modelIds)

    expect(apiClient.delete).toHaveBeenCalledFirst()
    expect(apiClient.post).toHaveBeenCalledWith('/models/delete-multiple/', {
      model_ids: modelIds
    })
    expect(result).toEqual(postResponse.data)
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('DELETE con body no soportado, usando POST como fallback')
    )
  })

  it('debe validar array de IDs vacío', async () => {
    await expect(deleteMultipleModels([])).rejects.toThrow(
      'Se requiere un array válido de IDs de modelos'
    )
  })

  it('debe validar array de IDs null/undefined', async () => {
    await expect(deleteMultipleModels(null)).rejects.toThrow(
      'Se requiere un array válido de IDs de modelos'
    )
    await expect(deleteMultipleModels(undefined)).rejects.toThrow(
      'Se requiere un array válido de IDs de modelos'
    )
  })

  it('debe validar límite máximo de modelos', async () => {
    const tooManyIds = Array(101).fill().map((_, i) => i.toString())
    
    await expect(deleteMultipleModels(tooManyIds)).rejects.toThrow(
      'No se pueden eliminar más de 100 modelos a la vez'
    )
  })

  it('debe propagar errores cuando ambos métodos fallan', async () => {
    const modelIds = ['1']
    const deleteError = { response: { status: 405 } }
    const postError = { response: { status: 500, data: { error: 'Server error' } } }

    apiClient.delete.mockRejectedValue(deleteError)
    apiClient.post.mockRejectedValue(postError)

    await expect(deleteMultipleModels(modelIds)).rejects.toEqual(postError)
  })

  it('debe propagar errores de DELETE cuando no es 405/400/413', async () => {
    const modelIds = ['1']
    const deleteError = { response: { status: 500, data: { error: 'Server error' } } }

    apiClient.delete.mockRejectedValue(deleteError)

    await expect(deleteMultipleModels(modelIds)).rejects.toEqual(deleteError)
    expect(apiClient.post).not.toHaveBeenCalled()
  })
})
