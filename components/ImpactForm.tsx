'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateMetrics } from '@/app/actions/events'

type CurrentMetrics = {
  collectedWasteKg: number
  plantedTrees: number
  areaRecoveredM2: number
}

export default function ImpactForm({
  eventId,
  currentMetrics,
}: {
  eventId: string
  currentMetrics: CurrentMetrics
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      eventId,
      collectedWasteKg: parseFloat(formData.get('collectedWasteKg') as string) || 0,
      plantedTrees: parseInt(formData.get('plantedTrees') as string) || 0,
      areaRecoveredM2: parseFloat(formData.get('areaRecoveredM2') as string) || 0,
    }

    const result = await updateMetrics(data)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Métricas de impacto atualizadas com sucesso!
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="collectedWasteKg" className="block text-sm font-medium text-gray-700 mb-2">
            Resíduos Coletados (kg) ♻️
          </label>
          <input
            id="collectedWasteKg"
            name="collectedWasteKg"
            type="number"
            step="0.01"
            min="0"
            defaultValue={currentMetrics.collectedWasteKg}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            placeholder="0.00"
          />
          <p className="text-xs text-gray-500 mt-1">Peso dos resíduos coletados e removidos</p>
        </div>

        <div>
          <label htmlFor="plantedTrees" className="block text-sm font-medium text-gray-700 mb-2">
            Árvores Plantadas 🌳
          </label>
          <input
            id="plantedTrees"
            name="plantedTrees"
            type="number"
            min="0"
            defaultValue={currentMetrics.plantedTrees}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            placeholder="0"
          />
          <p className="text-xs text-gray-500 mt-1">Número de árvores plantadas</p>
        </div>

        <div>
          <label htmlFor="areaRecoveredM2" className="block text-sm font-medium text-gray-700 mb-2">
            Área Recuperada (m²) 🌿
          </label>
          <input
            id="areaRecoveredM2"
            name="areaRecoveredM2"
            type="number"
            step="0.01"
            min="0"
            defaultValue={currentMetrics.areaRecoveredM2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            placeholder="0.00"
          />
          <p className="text-xs text-gray-500 mt-1">Área de terra restaurada ou limpa</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
      >
        {loading ? 'Atualizando...' : 'Atualizar Métricas de Impacto'}
      </button>
    </form>
  )
}
