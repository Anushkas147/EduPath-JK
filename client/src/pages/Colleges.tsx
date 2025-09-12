import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, MapPin, Users, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import CollegeCard from "@/components/CollegeCard";
import collegesData from "@/data/colleges.json";
import { useLanguage } from "@/components/LanguageSwitcher";
import { getTranslation } from "@/lib/translations";

interface FilterState {
  search: string;
  location: string;
  stream: string;
  type: string;
  feeRange: string[];
  facilities: string[];
}

export default function Colleges() {
  const currentLanguage = useLanguage();
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    location: "all",
    stream: "all",
    type: "all",
    feeRange: [],
    facilities: [],
  });

  const { data: savedColleges = [] } = useQuery({
    queryKey: ["/api/saved/colleges"],
    retry: false,
  }) as { data: any[] };

  const savedCollegeNames = (savedColleges || []).map((saved: any) => saved.collegeName);

  const filteredColleges = useMemo(() => {
    return collegesData.filter((college) => {
      // Search filter
      if (filters.search && !college.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !college.location.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Location filter
      if (filters.location && filters.location !== 'all') {
        const locationMatch = college.location.toLowerCase().includes(filters.location.toLowerCase());
        if (!locationMatch) return false;
      }

      // Stream filter
      if (filters.stream && filters.stream !== 'all') {
        const streamMatch = college.popular_courses.some(course => 
          course.toLowerCase().includes(filters.stream.toLowerCase())
        );
        if (!streamMatch) return false;
      }

      // Type filter
      if (filters.type && filters.type !== 'all') {
        const isGovernment = college.name.toLowerCase().includes('government') || 
                           college.name.toLowerCase().includes('govt');
        const isNIT = college.name.toLowerCase().includes('nit');
        const isAIIMS = college.name.toLowerCase().includes('aiims');
        const isUniversity = college.name.toLowerCase().includes('university');
        
        if (filters.type === 'government' && !isGovernment && !isNIT && !isAIIMS) return false;
        if (filters.type === 'university' && !isUniversity) return false;
        if (filters.type === 'medical' && !college.popular_courses.some(course => 
          course.toLowerCase().includes('mbbs') || course.toLowerCase().includes('medical')
        )) return false;
      }

      // Fee range filter
      if (filters.feeRange.length > 0) {
        const feeText = college.fees.toLowerCase();
        let matchesFeeRange = false;
        
        filters.feeRange.forEach(range => {
          if (range === "under-25k" && (feeText.includes("8,000") || feeText.includes("10,000") || feeText.includes("15,000"))) {
            matchesFeeRange = true;
          }
          if (range === "25k-50k" && (feeText.includes("25,000") || feeText.includes("30,000") || feeText.includes("40,000"))) {
            matchesFeeRange = true;
          }
          if (range === "50k-1l" && (feeText.includes("60,000") || feeText.includes("1.4") || feeText.includes("1.5"))) {
            matchesFeeRange = true;
          }
        });
        
        if (!matchesFeeRange) return false;
      }

      // Facilities filter
      if (filters.facilities.length > 0) {
        const hasRequiredFacilities = filters.facilities.every(facility => 
          college.facilities.some(collegeFacility => 
            collegeFacility.toLowerCase().includes(facility.toLowerCase())
          ) || (facility === "hostel" && college.hostel === "Available")
        );
        if (!hasRequiredFacilities) return false;
      }

      return true;
    });
  }, [filters]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFacilityChange = (facility: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      facilities: checked 
        ? [...prev.facilities, facility]
        : prev.facilities.filter(f => f !== facility)
    }));
  };

  const handleFeeRangeChange = (range: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      feeRange: checked 
        ? [...prev.feeRange, range]
        : prev.feeRange.filter(r => r !== range)
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      location: "all",
      stream: "all",
      type: "all",
      feeRange: [],
      facilities: [],
    });
  };

  const uniqueLocations = Array.from(new Set(collegesData.map(college => 
    college.location.split(',')[1]?.trim() || college.location.split(',')[0]?.trim()
  ))).sort();

  return (
    <div className="pt-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4" data-testid="text-colleges-title">
            {getTranslation("collegeDirectory", currentLanguage)}
          </h1>
          <p className="text-muted-foreground" data-testid="text-colleges-description">
            {getTranslation("discoverCollegesDesc", currentLanguage)}
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="search" className="text-sm font-medium text-foreground mb-2 block">
                  Search Colleges
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="College name or location..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                    data-testid="input-search-colleges"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">Location</Label>
                <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
                  <SelectTrigger data-testid="select-location">
                    <SelectValue placeholder="All Districts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    {uniqueLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">Stream</Label>
                <Select value={filters.stream} onValueChange={(value) => handleFilterChange('stream', value)}>
                  <SelectTrigger data-testid="select-stream">
                    <SelectValue placeholder="All Streams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Streams</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="arts">Arts</SelectItem>
                    <SelectItem value="commerce">Commerce</SelectItem>
                    <SelectItem value="computer">Computer Science</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">Type</Label>
                <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                  <SelectTrigger data-testid="select-type">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="university">University</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Quick filters:</span>
                <Button 
                  variant={filters.stream === "engineering" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleFilterChange('stream', filters.stream === "engineering" ? "" : "engineering")}
                  data-testid="filter-engineering"
                >
                  Engineering
                </Button>
                <Button 
                  variant={filters.stream === "medical" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleFilterChange('stream', filters.stream === "medical" ? "" : "medical")}
                  data-testid="filter-medical"
                >
                  Medical
                </Button>
                <Button 
                  variant={filters.type === "government" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleFilterChange('type', filters.type === "government" ? "" : "government")}
                  data-testid="filter-government"
                >
                  Government
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* College Results */}
          <div className="lg:col-span-3 space-y-6">
            <div className="mb-4">
              <p className="text-muted-foreground" data-testid="text-results-count">
                Showing {filteredColleges.length} colleges
              </p>
            </div>

            {filteredColleges.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-no-results">
                    No colleges found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters to see more results.
                  </p>
                  <Button onClick={clearFilters} data-testid="button-clear-all-filters">
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredColleges.map((college) => (
                <CollegeCard
                  key={college.name}
                  college={college}
                  isSaved={savedCollegeNames.includes(college.name)}
                />
              ))
            )}
          </div>

          {/* Sidebar Filters */}
          <div className="space-y-6">
            {/* Advanced Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" data-testid="text-advanced-filters-title">
                  <Filter className="w-5 h-5" />
                  Advanced Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">Fee Range</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="under-25k"
                        checked={filters.feeRange.includes("under-25k")}
                        onCheckedChange={(checked) => handleFeeRangeChange("under-25k", checked as boolean)}
                        data-testid="checkbox-fee-under-25k"
                      />
                      <Label htmlFor="under-25k" className="text-sm cursor-pointer">
                        Under ₹25K
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="25k-50k"
                        checked={filters.feeRange.includes("25k-50k")}
                        onCheckedChange={(checked) => handleFeeRangeChange("25k-50k", checked as boolean)}
                        data-testid="checkbox-fee-25k-50k"
                      />
                      <Label htmlFor="25k-50k" className="text-sm cursor-pointer">
                        ₹25K - ₹50K
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="50k-1l"
                        checked={filters.feeRange.includes("50k-1l")}
                        onCheckedChange={(checked) => handleFeeRangeChange("50k-1l", checked as boolean)}
                        data-testid="checkbox-fee-50k-1l"
                      />
                      <Label htmlFor="50k-1l" className="text-sm cursor-pointer">
                        ₹50K - ₹1L
                      </Label>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">Facilities</Label>
                  <div className="space-y-2">
                    {["hostel", "library", "labs", "sports"].map((facility) => (
                      <div key={facility} className="flex items-center space-x-2">
                        <Checkbox
                          id={facility}
                          checked={filters.facilities.includes(facility)}
                          onCheckedChange={(checked) => handleFacilityChange(facility, checked as boolean)}
                          data-testid={`checkbox-facility-${facility}`}
                        />
                        <Label htmlFor={facility} className="text-sm cursor-pointer">
                          {facility.charAt(0).toUpperCase() + facility.slice(1)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Summary */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-results-summary-title">Search Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2" data-testid="text-total-colleges">
                    {filteredColleges.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Colleges found matching your criteria</p>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Government</span>
                    <span className="font-medium" data-testid="count-government">
                      {filteredColleges.filter(c => 
                        c.name.toLowerCase().includes('government') || 
                        c.name.toLowerCase().includes('govt')
                      ).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">With Hostels</span>
                    <span className="font-medium" data-testid="count-hostels">
                      {filteredColleges.filter(c => c.hostel === "Available").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Medical Colleges</span>
                    <span className="font-medium" data-testid="count-medical">
                      {filteredColleges.filter(c => 
                        c.popular_courses.some(course => 
                          course.toLowerCase().includes('mbbs') || 
                          course.toLowerCase().includes('medical')
                        )
                      ).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
