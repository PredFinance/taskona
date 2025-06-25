"use client"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import ComingSoon from "@/components/coming-soon"
import { ShoppingBag, TrendingUp, DollarSign, Clock, Star } from "lucide-react"

// TODO: This will be a comprehensive product marketplace where users can:
// 1. Buy digital products that generate daily income
// 2. View their purchased products and daily earnings
// 3. Track ROI and earning history
// 4. Upgrade products for higher returns
// 5. Refer others to buy products for commission

// PRODUCT CATEGORIES TO IMPLEMENT:
// - Digital Marketing Tools (₦5,000 - ₦50 daily for 180 days)
// - E-commerce Packages (₦10,000 - ₦100 daily for 150 days)
// - Investment Portfolios (₦20,000 - ₦200 daily for 120 days)
// - Premium Memberships (₦50,000 - ₦500 daily for 100 days)

// FEATURES TO ADD:
// - Product catalog with detailed descriptions
// - Purchase history and active products
// - Daily earning collection system
// - Product performance analytics
// - Referral commissions for product sales
// - Product upgrade system
// - Earning withdrawal integration

export default function ProductsPage() {
  const mockProducts = [
    {
      id: 1,
      name: "Digital Marketing Starter",
      price: 5000,
      dailyEarning: 50,
      duration: 180,
      category: "Marketing",
      description: "Generate daily income through digital marketing tools and strategies",
      roi: "180%",
      totalReturn: 9000,
    },
    {
      id: 2,
      name: "E-commerce Pro Package",
      price: 10000,
      dailyEarning: 100,
      duration: 150,
      category: "E-commerce",
      description: "Complete e-commerce solution with daily profit sharing",
      roi: "150%",
      totalReturn: 15000,
    },
    {
      id: 3,
      name: "Investment Portfolio",
      price: 20000,
      dailyEarning: 200,
      duration: 120,
      category: "Investment",
      description: "Diversified investment portfolio with guaranteed daily returns",
      roi: "120%",
      totalReturn: 24000,
    },
  ]

  return (
    <DashboardLayout activeTab="products">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Marketplace</h1>
          <p className="text-gray-600">Invest in digital products and earn daily income</p>
        </div>

        {/* Coming Soon Component */}
        <ComingSoon
          title="Product Marketplace Coming Soon!"
          description="We're building an amazing marketplace where you can buy digital products that generate daily income. Stay tuned!"
          icon="star"
          size="lg"
        />

        {/* Preview of Future Features */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Coming:</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockProducts.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4 opacity-60">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{product.category}</span>
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-xs ml-1">4.8</span>
                  </div>
                </div>

                <h4 className="font-semibold text-gray-900 mb-2">{product.name}</h4>
                <p className="text-sm text-gray-600 mb-4">{product.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium">₦{product.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Daily Earning:</span>
                    <span className="font-medium text-green-600">₦{product.dailyEarning}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{product.duration} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total ROI:</span>
                    <span className="font-medium text-green-600">{product.roi}</span>
                  </div>
                </div>

                <button disabled className="w-full bg-gray-300 text-gray-500 py-2 rounded-lg cursor-not-allowed">
                  Coming Soon
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
              <h4 className="font-semibold text-green-800">Daily Earnings</h4>
            </div>
            <p className="text-sm text-green-700">
              Earn consistent daily income from your product investments with guaranteed returns.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <DollarSign className="w-6 h-6 text-blue-600 mr-2" />
              <h4 className="font-semibold text-blue-800">High ROI</h4>
            </div>
            <p className="text-sm text-blue-700">
              Get up to 200% return on investment with our carefully selected digital products.
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <Clock className="w-6 h-6 text-purple-600 mr-2" />
              <h4 className="font-semibold text-purple-800">Flexible Terms</h4>
            </div>
            <p className="text-sm text-purple-700">
              Choose from various investment durations from 100 to 180 days based on your preference.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
