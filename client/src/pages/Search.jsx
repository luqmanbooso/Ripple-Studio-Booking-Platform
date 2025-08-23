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
    <div className="min-h-screen bg-dark-950">
      <div className="container py-8">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            Discover Amazing Talent
          </h1>
          <p className="text-gray-400">
            Find the perfect artists and studios for your next project
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-8"
        >
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <Input
                  placeholder="Search artists, studios, genres..."
                  icon={<SearchIcon className="w-5 h-5" />}
                  value={filters.q}
                  onChange={(e) => handleFilterChange('q', e.target.value)}
                />
              </div>
              <select
                className="input-field"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="all">All</option>
                <option value="artists">Artists</option>
                <option value="studios">Studios</option>
              </select>
              <select
                className="input-field"
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
              >
                <option value="-ratingAvg">Highest Rated</option>
                <option value="hourlyRate">Lowest Price</option>
                <option value="-hourlyRate">Highest Price</option>
                <option value="-createdAt">Newest</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Input
                placeholder="Country"
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
              />
              <Input
                placeholder="City"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />
              <Input
                placeholder="Genre"
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
              />
              <Input
                placeholder="Min Rate"
                type="number"
                value={filters.minRate}
                onChange={(e) => handleFilterChange('minRate', e.target.value)}
              />
              <Input
                placeholder="Max Rate"
                type="number"
                value={filters.maxRate}
                onChange={(e) => handleFilterChange('maxRate', e.target.value)}
              />
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
            <h2 className="text-xl font-semibold text-gray-100">
              Search Results
            </h2>
            <p className="text-gray-400">
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
                <div className="h-48 bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
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
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-100 mb-2">
              No results found
            </h3>
            <p className="text-gray-400 mb-6">
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
