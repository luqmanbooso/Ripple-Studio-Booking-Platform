import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Search as SearchIcon, 
  Filter, 
  MapPin, 
  Star, 
  Music, 
  Building,
  Grid,
  List
} from 'lucide-react'

import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'
import ArtistCard from '../components/cards/ArtistCard'
import StudioCard from '../components/cards/StudioCard'
import { useGetArtistsQuery } from '../store/artistApi'
import { useGetStudiosQuery } from '../store/studioApi'

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState('grid')
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    type: searchParams.get('type') || 'all',
    country: searchParams.get('country') || '',
    city: searchParams.get('city') || '',
    genre: searchParams.get('genre') || '',
    minRate: searchParams.get('minRate') || '',
    maxRate: searchParams.get('maxRate') || '',
    sort: searchParams.get('sort') || '-ratingAvg'
  })

  const shouldFetchArtists = filters.type === 'all' || filters.type === 'artists'
  const shouldFetchStudios = filters.type === 'all' || filters.type === 'studios'

  const { 
    data: artistsData, 
    isLoading: artistsLoading 
  } = useGetArtistsQuery(filters, { skip: !shouldFetchArtists })

  const { 
    data: studiosData, 
    isLoading: studiosLoading 
  } = useGetStudiosQuery(filters, { skip: !shouldFetchStudios })

  const isLoading = artistsLoading || studiosLoading

  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    setSearchParams(params)
  }, [filters, setSearchParams])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // Filters are already updated via handleFilterChange
  }

  const allResults = [
    ...(artistsData?.data?.artists || []).map(artist => ({ ...artist, type: 'artist' })),
    ...(studiosData?.data?.studios || []).map(studio => ({ ...studio, type: 'studio' }))
  ]

  const totalResults = (artistsData?.data?.pagination?.total || 0) + (studiosData?.data?.pagination?.total || 0)

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950">
      <div className="container py-8">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-light-text dark:text-gray-100 mb-2">
            Discover Amazing Talent
          </h1>
          <p className="text-light-textSecondary dark:text-gray-400">
            Find the perfect artists and studios for your next project
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-8 border-light-primary/20 dark:border-primary-500/20"
        >
          <form onSubmit={handleSearch} className="space-y-8">
            {/* Main Search Row */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-light-textSecondary dark:text-gray-400 mb-2">
                  Search Query
                </label>
                <div className="relative">
                  <SearchIcon className="absolute left-1.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light-textMuted dark:text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search artists, studios, genres..."
                    value={filters.q}
                    onChange={(e) => handleFilterChange('q', e.target.value)}
                    className="search-input pl-5 text-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-light-textSecondary dark:text-gray-400 mb-2">
                  Type
                </label>
                <select
                  className="select-field text-lg w-full"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="all" className="bg-white dark:bg-gray-800 text-light-text dark:text-gray-100">All</option>
                  <option value="artists" className="bg-white dark:bg-gray-800 text-light-text dark:text-gray-100">Artists</option>
                  <option value="studios" className="bg-white dark:bg-gray-800 text-light-text dark:text-gray-100">Studios</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-light-textSecondary dark:text-gray-400 mb-2">
                  Sort By
                </label>
                <select
                  className="select-field text-lg w-full"
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                >
                  <option value="-ratingAvg" className="bg-white dark:bg-gray-800 text-light-text dark:text-gray-100">Highest Rated</option>
                  <option value="hourlyRate" className="bg-white dark:bg-gray-800 text-light-text dark:text-gray-100">Lowest Price</option>
                  <option value="-hourlyRate" className="bg-white dark:bg-gray-800 text-light-text dark:text-gray-100">Highest Price</option>
                  <option value="-createdAt" className="bg-white dark:bg-gray-800 text-light-text dark:text-gray-100">Newest</option>
                </select>
              </div>
            </div>

            {/* Visual Separator */}
            <div className="border-t border-light-border/30 dark:border-gray-700/30 pt-6">
              <h3 className="text-lg font-semibold text-light-text dark:text-gray-100 mb-4">
                Additional Filters
              </h3>
            </div>

            {/* Additional Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <div>
                <label className="block text-sm font-medium text-light-textSecondary dark:text-gray-400 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="e.g., USA"
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-textSecondary dark:text-gray-400 mb-2">
                  City
                </label>
                <input
                  type="text"
                  placeholder="e.g., New York"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-textSecondary dark:text-gray-400 mb-2">
                  Genre
                </label>
                <input
                  type="text"
                  placeholder="e.g., Rock, Jazz"
                  value={filters.genre}
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-textSecondary dark:text-gray-400 mb-2">
                  Min Rate
                </label>
                <input
                  type="number"
                  placeholder="$0"
                  value={filters.minRate}
                  onChange={(e) => handleFilterChange('minRate', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-textSecondary dark:text-gray-400 mb-2">
                  Max Rate
                </label>
                <input
                  type="number"
                  placeholder="$500"
                  value={filters.maxRate}
                  onChange={(e) => handleFilterChange('maxRate', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </form>
        </motion.div>

        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h2 className="text-xl font-semibold text-light-text dark:text-gray-100">
              Search Results
            </h2>
            <p className="text-light-textSecondary dark:text-gray-400">
              {isLoading ? 'Loading...' : `${totalResults} results found`}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              icon={<Grid className="w-4 h-4" />}
            />
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              icon={<List className="w-4 h-4" />}
            />
          </div>
        </motion.div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-light-textMuted dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-light-textMuted dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-light-textMuted dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : allResults.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}
          >
            {allResults.map((item, index) => (
              <motion.div
                key={`${item.type}-${item._id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {item.type === 'artist' ? (
                  <ArtistCard artist={item} />
                ) : (
                  <StudioCard studio={item} />
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-light-textMuted dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-12 h-12 text-light-textMuted dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-light-text dark:text-gray-100 mb-2">
              No results found
            </h3>
            <p className="text-light-textSecondary dark:text-gray-400 mb-6">
              Try adjusting your search filters or search terms
            </p>
            <Button
              onClick={() => {
                setFilters({
                  q: '',
                  type: 'all',
                  country: '',
                  city: '',
                  genre: '',
                  minRate: '',
                  maxRate: '',
                  sort: '-ratingAvg'
                })
              }}
            >
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Search
