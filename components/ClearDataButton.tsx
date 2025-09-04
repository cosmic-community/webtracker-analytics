'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'

export default function ClearDataButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleClearData = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/clear-sample-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirm: true }),
      })

      const data = await response.json()
      
      if (data.success) {
        setResult({ 
          success: true, 
          message: data.message 
        })
      } else {
        setResult({ 
          success: false, 
          message: data.error || 'Failed to clear data' 
        })
      }
    } catch (error) {
      setResult({ 
        success: false, 
        message: 'Network error while clearing data' 
      })
    } finally {
      setIsLoading(false)
      setShowConfirm(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-800">Clear All Sample Data</h3>
            <p className="text-sm text-red-600 mt-1">
              This will permanently delete ALL tracking sessions and heatmap data from your Cosmic CMS. 
              This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleClearData}
                disabled={isLoading}
                className="btn-secondary bg-red-600 text-white hover:bg-red-700 text-sm px-4 py-2"
              >
                {isLoading ? 'Clearing...' : 'Yes, Clear All Data'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-secondary text-sm px-4 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowConfirm(true)}
        className="btn-secondary inline-flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="w-4 h-4" />
        Clear Sample Data
      </button>

      {result && (
        <div className={`p-4 rounded-lg ${
          result.success 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <p className="font-medium">
            {result.success ? '✅ Success' : '❌ Error'}
          </p>
          <p className="text-sm mt-1">{result.message}</p>
        </div>
      )}
    </div>
  )
}