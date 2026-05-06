"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';

interface TeamFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedProvince: string;
  onProvinceChange: (value: string) => void;
  selectedConference: string;
  onConferenceChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: string;
  onSortOrderChange: (value: string) => void;
  provinces: string[];
  conferences: string[];
  isLoading: boolean;
  onClearFilters: () => void;
}

export default function TeamFilters({
  searchTerm,
  onSearchChange,
  selectedProvince,
  onProvinceChange,
  selectedConference,
  onConferenceChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  provinces,
  conferences,
  isLoading,
  onClearFilters
}: TeamFiltersProps) {
  const hasActiveFilters = searchTerm || selectedProvince !== 'all' || selectedConference !== 'all';

  return (
    <Card className="bg-black border-yellow-400/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-400">
          <Filter className="w-5 h-5" />
          Filter Teams
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Search Teams
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by team name..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-background border-border text-white placeholder:text-gray-400"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Province Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Province
            </label>
            <Select value={selectedProvince} onValueChange={onProvinceChange} disabled={isLoading}>
              <SelectTrigger className="text-white bg-background border-border">
                <SelectValue placeholder="All Provinces" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto bg-gray-900 border-gray-700">
                <SelectItem value="all" className="text-white hover:bg-gray-800 focus:bg-gray-800">
                  All Provinces
                </SelectItem>
                {provinces.map((province) => (
                  <SelectItem 
                    key={province} 
                    value={province}
                    className="text-white hover:bg-gray-800 focus:bg-gray-800"
                  >
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Conference Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Conference
            </label>
            <Select value={selectedConference} onValueChange={onConferenceChange} disabled={isLoading}>
              <SelectTrigger className="text-white bg-background border-border">
                <SelectValue placeholder="All Conferences" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto bg-gray-900 border-gray-700">
                <SelectItem value="all" className="text-white hover:bg-gray-800 focus:bg-gray-800">
                  All Conferences
                </SelectItem>
                {conferences.map((conference) => (
                  <SelectItem 
                    key={conference} 
                    value={conference}
                    className="text-white hover:bg-gray-800 focus:bg-gray-800"
                  >
                    {conference}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Options */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Sort By
            </label>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={onSortByChange} disabled={isLoading}>
                <SelectTrigger className="flex-1 text-white bg-background border-border">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto bg-gray-900 border-gray-700">
                  <SelectItem value="team_name" className="text-white hover:bg-gray-800 focus:bg-gray-800">
                    Team Name
                  </SelectItem>
                  <SelectItem value="city" className="text-white hover:bg-gray-800 focus:bg-gray-800">
                    City
                  </SelectItem>
                  <SelectItem value="province" className="text-white hover:bg-gray-800 focus:bg-gray-800">
                    Province
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={onSortOrderChange} disabled={isLoading}>
                <SelectTrigger className="w-20 text-white bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto bg-gray-900 border-gray-700">
                  <SelectItem value="asc" className="text-white hover:bg-gray-800 focus:bg-gray-800">
                    A-Z
                  </SelectItem>
                  <SelectItem value="desc" className="text-white hover:bg-gray-800 focus:bg-gray-800">
                    Z-A
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">Active filters:</span>
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                      Search: {searchTerm}
                    </Badge>
                  )}
                  {selectedProvince !== 'all' && (
                    <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                      Province: {selectedProvince}
                    </Badge>
                  )}
                  {selectedConference !== 'all' && (
                    <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                      Conference: {selectedConference}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
