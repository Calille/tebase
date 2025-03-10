import React, { useState, useEffect } from "react";
import {
  BarChart,
  PieChart,
  Award,
  Globe,
  BookOpen,
  Briefcase,
  GraduationCap,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Teacher, teacherService } from "@/services/teacherService";

interface TeacherAnalyticsProps {
  teachers?: Teacher[];
}

const TeacherAnalytics = ({ teachers: initialTeachers }: TeacherAnalyticsProps) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      if (initialTeachers) {
        setTeachers(initialTeachers);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await teacherService.getTeachers();
        if (data.length > 0) {
          setTeachers(data);
        }
      } catch (err) {
        console.error("Failed to fetch teachers:", err);
        setError("Failed to load teachers. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [initialTeachers]);

  // Calculate certification statistics
  const certificationStats = React.useMemo(() => {
    const stats: Record<string, number> = {};
    
    teachers.forEach(teacher => {
      if (teacher.certifications && teacher.certifications.length > 0) {
        teacher.certifications.forEach(cert => {
          stats[cert] = (stats[cert] || 0) + 1;
        });
      }
    });
    
    return Object.entries(stats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [teachers]);

  // Calculate language statistics
  const languageStats = React.useMemo(() => {
    const stats: Record<string, number> = {};
    
    teachers.forEach(teacher => {
      if (teacher.languages && teacher.languages.length > 0) {
        teacher.languages.forEach(lang => {
          stats[lang] = (stats[lang] || 0) + 1;
        });
      }
    });
    
    return Object.entries(stats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [teachers]);

  // Calculate teaching method statistics
  const teachingMethodStats = React.useMemo(() => {
    const stats: Record<string, number> = {};
    
    teachers.forEach(teacher => {
      if (teacher.teachingMethods && teacher.teachingMethods.length > 0) {
        teacher.teachingMethods.forEach(method => {
          stats[method] = (stats[method] || 0) + 1;
        });
      }
    });
    
    return Object.entries(stats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [teachers]);

  // Calculate experience level statistics
  const experienceStats = React.useMemo(() => {
    const levels = {
      "0-2 years": 0,
      "3-5 years": 0,
      "6-10 years": 0,
      "10+ years": 0
    };
    
    teachers.forEach(teacher => {
      if (teacher.employmentHistory && teacher.employmentHistory.length > 0) {
        // Calculate total years of experience
        const totalYears = teacher.employmentHistory.reduce((total, job) => {
          if (!job.startDate) return total;
          
          const startYear = parseInt(job.startDate.split('-')[0]);
          const endYear = job.endDate 
            ? parseInt(job.endDate.split('-')[0]) 
            : new Date().getFullYear();
          
          return total + (endYear - startYear);
        }, 0);
        
        // Categorize by experience level
        if (totalYears <= 2) {
          levels["0-2 years"]++;
        } else if (totalYears <= 5) {
          levels["3-5 years"]++;
        } else if (totalYears <= 10) {
          levels["6-10 years"]++;
        } else {
          levels["10+ years"]++;
        }
      }
    });
    
    return Object.entries(levels)
      .map(([name, count]) => ({ name, count }));
  }, [teachers]);

  // Calculate nationality statistics
  const nationalityStats = React.useMemo(() => {
    const stats: Record<string, number> = {};
    
    teachers.forEach(teacher => {
      if (teacher.nationality) {
        stats[teacher.nationality] = (stats[teacher.nationality] || 0) + 1;
      }
    });
    
    return Object.entries(stats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [teachers]);

  // Calculate contract type statistics
  const contractStats = React.useMemo(() => {
    const stats: Record<string, number> = {};
    
    teachers.forEach(teacher => {
      if (teacher.contractType) {
        stats[teacher.contractType] = (stats[teacher.contractType] || 0) + 1;
      }
    });
    
    return Object.entries(stats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [teachers]);

  if (loading) {
    return <div className="p-8 text-center">Loading teacher analytics...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teacher Analytics</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
            <p className="text-xs text-gray-500">
              {teachers.filter(t => t.status === 'active').length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Languages</CardTitle>
            <Globe className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{languageStats.length}</div>
            <p className="text-xs text-gray-500">
              Most common: {languageStats[0]?.name || 'None'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Certifications</CardTitle>
            <Award className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificationStats.length}</div>
            <p className="text-xs text-gray-500">
              Most common: {certificationStats[0]?.name || 'None'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Teaching Methods</CardTitle>
            <BookOpen className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachingMethodStats.length}</div>
            <p className="text-xs text-gray-500">
              Most common: {teachingMethodStats[0]?.name || 'None'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="certifications">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="languages">Languages</TabsTrigger>
          <TabsTrigger value="teaching-methods">Teaching Methods</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="certifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Bar Chart Visualization */}
                <div className="h-[300px] w-full">
                  {certificationStats.length > 0 ? (
                    <div className="flex h-full flex-col justify-end space-y-2">
                      {certificationStats.map((cert, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-24 truncate text-sm">{cert.name}</div>
                          <div 
                            className="h-9 bg-blue-500 rounded-sm" 
                            style={{ 
                              width: `${Math.max(
                                (cert.count / Math.max(...certificationStats.map(c => c.count))) * 100, 
                                5
                              )}%` 
                            }}
                          />
                          <div className="text-sm">{cert.count}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-gray-500">No certification data available</p>
                    </div>
                  )}
                </div>
                
                {/* Top Certifications */}
                <div>
                  <h3 className="mb-4 text-sm font-medium">Top Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {certificationStats.slice(0, 5).map((cert, index) => (
                      <Badge key={index} className="bg-blue-50 text-blue-700 border-blue-200">
                        {cert.name} ({cert.count})
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="languages" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Bar Chart Visualization */}
                <div className="h-[300px] w-full">
                  {languageStats.length > 0 ? (
                    <div className="flex h-full flex-col justify-end space-y-2">
                      {languageStats.map((lang, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-24 truncate text-sm">{lang.name}</div>
                          <div 
                            className="h-9 bg-green-500 rounded-sm" 
                            style={{ 
                              width: `${Math.max(
                                (lang.count / Math.max(...languageStats.map(l => l.count))) * 100, 
                                5
                              )}%` 
                            }}
                          />
                          <div className="text-sm">{lang.count}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-gray-500">No language data available</p>
                    </div>
                  )}
                </div>
                
                {/* Language Distribution */}
                <div>
                  <h3 className="mb-4 text-sm font-medium">Language Distribution</h3>
                  <div className="flex flex-wrap gap-2">
                    {languageStats.map((lang, index) => (
                      <Badge key={index} className="bg-green-50 text-green-700 border-green-200">
                        {lang.name} ({lang.count})
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="teaching-methods" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Teaching Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Bar Chart Visualization */}
                <div className="h-[300px] w-full">
                  {teachingMethodStats.length > 0 ? (
                    <div className="flex h-full flex-col justify-end space-y-2">
                      {teachingMethodStats.map((method, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-36 truncate text-sm">{method.name}</div>
                          <div 
                            className="h-9 bg-purple-500 rounded-sm" 
                            style={{ 
                              width: `${Math.max(
                                (method.count / Math.max(...teachingMethodStats.map(m => m.count))) * 100, 
                                5
                              )}%` 
                            }}
                          />
                          <div className="text-sm">{method.count}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-gray-500">No teaching method data available</p>
                    </div>
                  )}
                </div>
                
                {/* Teaching Methods Distribution */}
                <div>
                  <h3 className="mb-4 text-sm font-medium">Teaching Methods Distribution</h3>
                  <div className="flex flex-wrap gap-2">
                    {teachingMethodStats.map((method, index) => (
                      <Badge key={index} className="bg-purple-50 text-purple-700 border-purple-200">
                        {method.name} ({method.count})
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="experience" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Bar Chart Visualization */}
                <div className="h-[300px] w-full">
                  {experienceStats.some(exp => exp.count > 0) ? (
                    <div className="flex h-full flex-col justify-end space-y-2">
                      {experienceStats.map((exp, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-24 truncate text-sm">{exp.name}</div>
                          <div 
                            className="h-9 bg-amber-500 rounded-sm" 
                            style={{ 
                              width: `${Math.max(
                                (exp.count / Math.max(...experienceStats.map(e => e.count))) * 100, 
                                5
                              )}%` 
                            }}
                          />
                          <div className="text-sm">{exp.count}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-gray-500">No experience data available</p>
                    </div>
                  )}
                </div>
                
                {/* Contract Types */}
                <div>
                  <h3 className="mb-4 text-sm font-medium">Contract Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {contractStats.map((contract, index) => (
                      <Badge key={index} className="bg-amber-50 text-amber-700 border-amber-200">
                        {contract.name} ({contract.count})
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="demographics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Demographics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Nationality Chart */}
                <div>
                  <h3 className="mb-4 text-sm font-medium">Nationality Distribution</h3>
                  <div className="h-[200px] w-full">
                    {nationalityStats.length > 0 ? (
                      <div className="flex h-full flex-col justify-end space-y-2">
                        {nationalityStats.map((nat, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-24 truncate text-sm">{nat.name}</div>
                            <div 
                              className="h-9 bg-indigo-500 rounded-sm" 
                              style={{ 
                                width: `${Math.max(
                                  (nat.count / Math.max(...nationalityStats.map(n => n.count))) * 100, 
                                  5
                                )}%` 
                              }}
                            />
                            <div className="text-sm">{nat.count}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-gray-500">No nationality data available</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Visa Status */}
                <div>
                  <h3 className="mb-4 text-sm font-medium">Visa Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {teachers
                      .reduce((acc, teacher) => {
                        if (teacher.visaStatus) {
                          const existing = acc.find(item => item.status === teacher.visaStatus);
                          if (existing) {
                            existing.count++;
                          } else {
                            acc.push({ status: teacher.visaStatus, count: 1 });
                          }
                        }
                        return acc;
                      }, [] as { status: string; count: number }[])
                      .sort((a, b) => b.count - a.count)
                      .map((visa, index) => (
                        <Badge key={index} className="bg-indigo-50 text-indigo-700 border-indigo-200">
                          {visa.status} ({visa.count})
                        </Badge>
                      ))
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherAnalytics; 