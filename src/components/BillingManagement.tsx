'use client'

import { useState } from 'react'
import { CreditCard, Download, AlertCircle, CheckCircle } from 'lucide-react'

interface BillingManagementProps {
  organization: {
    subscription_tier: string
    stripe_customer_id?: string
    subscription_status?: string
  }
}

export default function BillingManagement({ organization }: BillingManagementProps) {
  const [loading, setLoading] = useState(false)

  const handleManageBilling = async () => {
    if (!organization.stripe_customer_id) {
      // No Stripe customer yet, redirect to pricing
      window.location.href = '/pricing'
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: organization.stripe_customer_id
        }),
      })

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating portal session:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTierInfo = (tier: string | null) => {
    switch (tier) {
      case 'creator':
        return {
          name: 'Creator',
          price: '$49',
          color: 'text-blue-600 bg-blue-100'
        }
      case 'professional':
        return {
          name: 'Professional',
          price: '$149',
          color: 'text-purple-600 bg-purple-100'
        }
      case 'agency':
        return {
          name: 'Agency',
          price: '$399',
          color: 'text-gold-600 bg-gold-100'
        }
      default:
        return {
          name: 'No Active Plan',
          price: 'Free Trial Available',
          color: 'text-gray-600 bg-gray-100'
        }
    }
  }

  const getStatusInfo = (status?: string, tier?: string | null) => {
    switch (status) {
      case 'active':
        return {
          text: 'Active',
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          color: 'text-green-600'
        }
      case 'trialing':
        return {
          text: 'Free Trial',
          icon: <CheckCircle className="h-4 w-4 text-blue-500" />,
          color: 'text-blue-600'
        }
      case 'past_due':
        return {
          text: 'Past Due',
          icon: <AlertCircle className="h-4 w-4 text-yellow-500" />,
          color: 'text-yellow-600'
        }
      case 'canceled':
        return {
          text: 'Canceled',
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          color: 'text-red-600'
        }
      default:
        return {
          text: tier ? 'Trial Available' : 'No Plan',
          icon: <CheckCircle className="h-4 w-4 text-gray-500" />,
          color: 'text-gray-600'
        }
    }
  }

  const tierInfo = getTierInfo(organization.subscription_tier)
  const statusInfo = getStatusInfo(organization.subscription_status, organization.subscription_tier)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Billing & Subscription</h2>
        <div className="flex items-center space-x-2">
          {statusInfo.icon}
          <span className={statusInfo.color}>{statusInfo.text}</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Current Plan */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${tierInfo.color}`}>
                  {tierInfo.name}
                </span>
                <span className="text-2xl font-bold text-gray-900">{tierInfo.price}</span>
                {tierInfo.price !== 'Free' && (
                  <span className="text-gray-600">/month</span>
                )}
              </div>
              <p className="mt-2 text-gray-600">
                {!organization.subscription_tier 
                  ? 'Start your free trial to unlock premium features'
                  : organization.subscription_status === 'trialing'
                  ? 'Enjoying your trial? Upgrade to continue with full access'
                  : 'You have access to all premium features in this tier'
                }
              </p>
            </div>
            
            {organization.subscription_tier && organization.subscription_status === 'active' && (
              <button
                onClick={handleManageBilling}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                <span>{loading ? 'Loading...' : 'Manage Billing'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Usage Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Content Generations</span>
              <span className="text-sm font-medium">150 / 1,000</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '15%' }}></div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Perplexity Queries</span>
              <span className="text-sm font-medium">8 / 25</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '32%' }}></div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Niches Monitored</span>
              <span className="text-sm font-medium">3 / 5</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          {!organization.subscription_tier || organization.subscription_status === 'trialing' ? (
            <button
              onClick={() => window.location.href = '/pricing'}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
            >
              {organization.subscription_status === 'trialing' ? 'Upgrade Now' : 'Start Free Trial'}
            </button>
          ) : (
            <>
              <button
                onClick={() => window.location.href = '/pricing'}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Change Plan
              </button>
              <button
                onClick={handleManageBilling}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download Invoice</span>
              </button>
            </>
          )}
        </div>

        {/* Billing History Preview */}
        {organization.subscription_tier && organization.subscription_status === 'active' && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Billing</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    {tierInfo.name} Plan - January 2025
                  </span>
                  <span className="block text-xs text-gray-600">Jan 1, 2025</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">{tierInfo.price}</span>
                  <span className="block text-xs text-green-600">Paid</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleManageBilling}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700"
            >
              View all billing history →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}