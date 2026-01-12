"use client"

import React, { useState, useCallback } from 'react';
import { Upload, Camera, X, TrendingUp, TrendingDown, Minus, DollarSign, Package, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';

interface SoldListing {
  id: string;
  price: number;
  date: string;
  condition: string;
  title: string;
}

interface ProductData {
  name: string;
  category: string;
  confidence: number;
  imageUrl: string;
}

interface PriceData {
  average: number;
  median: number;
  lowest: number;
  highest: number;
  soldListings: SoldListing[];
  activeListings: number;
  totalSold: number;
  sellThroughRate: number;
  trend: 'up' | 'down' | 'stable';
  averageTimeToSell: number;
}

interface PriceRange {
  range: string;
  min: number;
  max: number;
  count: number;
}

export default function ProductPriceLookup() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [timeFilter, setTimeFilter] = useState<30 | 60 | 90>(30);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPG, PNG, or WEBP)');
      return;
    }

    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      analyzeProduct();
    };
    reader.readAsDataURL(file);
  };

  const analyzeProduct = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const mockProduct: ProductData = {
        name: "Apple iPhone 13 Pro Max 256GB",
        category: "Smartphones",
        confidence: 94,
        imageUrl: uploadedImage || ""
      };
      
      setProductData(mockProduct);
      fetchPriceData();
    }, 2000);
  };

  const fetchPriceData = () => {
    setTimeout(() => {
      const mockSoldListings: SoldListing[] = [
        { id: '1', price: 849, date: '2024-01-15', condition: 'Used - Excellent', title: 'iPhone 13 Pro Max 256GB Blue' },
        { id: '2', price: 825, date: '2024-01-14', condition: 'Used - Good', title: 'iPhone 13 Pro Max 256GB' },
        { id: '3', price: 899, date: '2024-01-13', condition: 'Used - Like New', title: 'iPhone 13 Pro Max 256GB Gold' },
        { id: '4', price: 875, date: '2024-01-12', condition: 'Used - Excellent', title: 'iPhone 13 Pro Max 256GB' },
        { id: '5', price: 810, date: '2024-01-11', condition: 'Used - Good', title: 'iPhone 13 Pro Max 256GB Silver' },
        { id: '6', price: 920, date: '2024-01-10', condition: 'Used - Like New', title: 'iPhone 13 Pro Max 256GB' },
        { id: '7', price: 840, date: '2024-01-09', condition: 'Used - Excellent', title: 'iPhone 13 Pro Max 256GB' },
        { id: '8', price: 795, date: '2024-01-08', condition: 'Used - Good', title: 'iPhone 13 Pro Max 256GB' },
      ];

      const prices = mockSoldListings.map(l => l.price);
      const average = prices.reduce((a, b) => a + b, 0) / prices.length;
      const sorted = [...prices].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];

      const mockPriceData: PriceData = {
        average: Math.round(average),
        median: median,
        lowest: Math.min(...prices),
        highest: Math.max(...prices),
        soldListings: mockSoldListings,
        activeListings: 156,
        totalSold: 48,
        sellThroughRate: 75,
        trend: 'up',
        averageTimeToSell: 5
      };

      setPriceData(mockPriceData);
      setIsAnalyzing(false);
    }, 1500);
  };

  const clearUpload = () => {
    setUploadedImage(null);
    setProductData(null);
    setPriceData(null);
    setError(null);
  };

  const getPriceDistribution = (): PriceRange[] => {
    if (!priceData) return [];
    
    const ranges: PriceRange[] = [
      { range: '$750-$799', min: 750, max: 799, count: 0 },
      { range: '$800-$849', min: 800, max: 849, count: 0 },
      { range: '$850-$899', min: 850, max: 899, count: 0 },
      { range: '$900+', min: 900, max: 1000, count: 0 },
    ];

    priceData.soldListings.forEach(listing => {
      const range = ranges.find(r => listing.price >= r.min && listing.price <= r.max);
      if (range) range.count++;
    });

    return ranges;
  };

  const getSellThroughColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600';
    if (rate >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSellThroughBgColor = (rate: number) => {
    if (rate >= 70) return 'bg-green-600';
    if (rate >= 40) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const handleButtonClick = () => {
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Package className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Product Price Lookup</h1>
          </div>
          <p className="text-gray-600 text-lg">Upload a product image to get instant pricing insights from eBay sold listings</p>
        </motion.div>

        {!uploadedImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="mb-8">
              <CardContent className="p-8">
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                    dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-700">Upload Product Image</h3>
                  <p className="text-gray-500 mb-6">Drag and drop your image here, or click to browse</p>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileInput}
                  />
                  <Button onClick={handleButtonClick} className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                  <p className="text-sm text-gray-400 mt-4">Supports JPG, PNG, WEBP (Max 5MB)</p>
                </div>
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="mb-8">
                <CardContent className="p-12 text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold mb-2">Analyzing Product...</h3>
                  <p className="text-gray-600">Identifying product and fetching pricing data</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {productData && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      {uploadedImage && (
                        <img src={uploadedImage} alt="Product" className="w-24 h-24 object-cover rounded-lg" />
                      )}
                      <div>
                        <CardTitle className="text-2xl mb-2">{productData.name}</CardTitle>
                        <CardDescription className="text-base">
                          Category: {productData.category} • Confidence: {productData.confidence}%
                        </CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={clearUpload}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {priceData && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Average Price</span>
                        <DollarSign className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">${priceData.average}</div>
                      <div className="flex items-center mt-2 text-sm">
                        {priceData.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600 mr-1" />}
                        {priceData.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-600 mr-1" />}
                        {priceData.trend === 'stable' && <Minus className="w-4 h-4 text-gray-600 mr-1" />}
                        <span className={priceData.trend === 'up' ? 'text-green-600' : priceData.trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                          {priceData.trend === 'up' ? 'Trending up' : priceData.trend === 'down' ? 'Trending down' : 'Stable'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Price Range</span>
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">
                        ${priceData.lowest} - ${priceData.highest}
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        Median: ${priceData.median}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Sell-Through Rate</span>
                        <CheckCircle className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className={`text-3xl font-bold ${getSellThroughColor(priceData.sellThroughRate)}`}>
                        {priceData.sellThroughRate}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div
                          className={`h-2 rounded-full ${getSellThroughBgColor(priceData.sellThroughRate)}`}
                          style={{ width: `${priceData.sellThroughRate}%` }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Avg. Time to Sell</span>
                        <Clock className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{priceData.averageTimeToSell} days</div>
                      <div className="text-sm text-gray-600 mt-2">
                        {priceData.totalSold} sold / {priceData.activeListings} active
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex justify-center gap-2 mb-6"
              >
                <Button
                  variant={timeFilter === 30 ? 'default' : 'outline'}
                  onClick={() => setTimeFilter(30)}
                >
                  30 Days
                </Button>
                <Button
                  variant={timeFilter === 60 ? 'default' : 'outline'}
                  onClick={() => setTimeFilter(60)}
                >
                  60 Days
                </Button>
                <Button
                  variant={timeFilter === 90 ? 'default' : 'outline'}
                  onClick={() => setTimeFilter(90)}
                >
                  90 Days
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Price Distribution</CardTitle>
                    <CardDescription>Number of items sold in each price range</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getPriceDistribution()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                          {getPriceDistribution().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 1 ? '#4f46e5' : '#94a3b8'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Sold Listings</CardTitle>
                    <CardDescription>Last {priceData.soldListings.length} items sold on eBay</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {priceData.soldListings.map((listing, index) => (
                        <motion.div
                          key={listing.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1 + index * 0.05 }}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{listing.title}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {listing.condition} • {format(new Date(listing.date), 'MMM dd, yyyy')}
                            </div>
                          </div>
                          <div className="text-xl font-bold text-indigo-600">${listing.price}</div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
