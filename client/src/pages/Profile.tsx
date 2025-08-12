import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { ApiClient } from "@/config/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Briefcase, MapPin, GraduationCap, Award, Pencil, X, Check, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    title: "Software Engineer",
    location: "New York, USA",
    bio: "Passionate about building innovative solutions and learning new technologies.",
    education: "Bachelor's in Computer Science",
    skills: ["React", "TypeScript", "Node.js", "Python"],
    experience: "5 years of experience in software development"
  });
  const [backupData, setBackupData] = useState<typeof profileData | null>(null);
  const hasChanges = backupData ? JSON.stringify(profileData) !== JSON.stringify(backupData) : false;

  // Load latest profile from server
  const { getToken } = useAuth();
  useEffect(() => {
    const load = async () => {
      const token = getToken();
      if (!token) return;
      const resp = await ApiClient.getProfile(token);
      if (resp.success && resp.data) {
        setProfileData((prev) => ({
          ...prev,
          name: resp.data.name || prev.name,
          email: resp.data.email || prev.email,
          // Keep local fields like title/location/bio if not server-managed
        }));
      }
    };
    load();
  }, [getToken]);

  const handleSave = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const resp = await ApiClient.updateProfile({
        name: profileData.name,
        profileImage: undefined,
      }, token);
      if (resp.success) {
        setIsEditing(false);
        setBackupData(null);
      }
    } catch (_) {
      // Silent fail; optionally show toast
    }
  };
  
  const handleEditToggle = () => {
    if (!isEditing) {
      setBackupData(profileData);
      setIsEditing(true);
    }
  };
  
  const handleCancel = () => {
    if (backupData) setProfileData(backupData);
    setIsEditing(false);
    setBackupData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Button
              variant="ghost"
              className="gap-2"
              onClick={() => navigate('/dashboard')}
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Button>
          </div>
          {/* Profile Header */}
          <Card className="mb-8 overflow-hidden">
            <div className="h-24 w-full bg-gradient-to-r from-brand-100 to-transparent" />
            <CardContent className="pt-0 -mt-12">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="h-32 w-32 ring-4 ring-white shadow-md">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'User')}&background=7c3aed&color=fff&size=512&font-size=0.4&bold=true`} />
                  <AvatarFallback className="text-4xl">{profileData.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left">
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          placeholder="Your name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={profileData.title}
                          onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                          placeholder="e.g., Software Engineer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                          placeholder="City, Country"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold mb-2">{profileData.name}</h1>
                      <p className="text-gray-600 mb-4">{profileData.title}</p>
                      <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {profileData.location}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {profileData.email}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {isEditing ? (
                  <div className="flex w-full md:w-auto gap-2 justify-end">
                    <Button
                      variant="default"
                      className="gap-2"
                      onClick={handleSave}
                      disabled={!hasChanges || !profileData.name.trim()}
                    >
                      <Check className="h-4 w-4" /> Save
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={handleCancel}>
                      <X className="h-4 w-4" /> Cancel
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" className="gap-2" onClick={handleEditToggle}>
                    <Pencil className="h-4 w-4" /> Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Content */}
          <Tabs defaultValue="about" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-grid bg-muted/50 rounded-lg p-1">
              <TabsTrigger className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md" value="about">About</TabsTrigger>
              <TabsTrigger className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md" value="experience">Experience</TabsTrigger>
              <TabsTrigger className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md" value="skills">Skills</TabsTrigger>
            </TabsList>

            <TabsContent value="about">
              <Card>
                <CardHeader>
                  <CardTitle>About Me</CardTitle>
                  <CardDescription>Your professional summary and background</CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={profileData.bio}
                          onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="education">Education</Label>
                        <Input
                          id="education"
                          value={profileData.education}
                          onChange={(e) => setProfileData({...profileData, education: e.target.value})}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <GraduationCap className="h-5 w-5 text-gray-400 mt-1" />
                        <div>
                          <h3 className="font-semibold">Education</h3>
                          <p className="text-gray-600">{profileData.education}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Briefcase className="h-5 w-5 text-gray-400 mt-1" />
                        <div>
                          <h3 className="font-semibold">Experience</h3>
                          <p className="text-gray-600">{profileData.experience}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Bio</h3>
                        <p className="text-gray-600">{profileData.bio}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills">
              <Card>
                <CardHeader>
                  <CardTitle>Skills & Expertise</CardTitle>
                  <CardDescription>Your technical and professional skills</CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="skills">Skills (comma-separated)</Label>
                        <Input
                          id="skills"
                          value={profileData.skills.join(", ")}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            skills: e.target.value.split(",").map(skill => skill.trim())
                          })}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1 rounded-full">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="experience">
              <Card>
                <CardHeader>
                  <CardTitle>Work Experience</CardTitle>
                  <CardDescription>Your professional journey</CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="experience">Experience Summary</Label>
                        <Textarea
                          id="experience"
                          value={profileData.experience}
                          onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
                          rows={4}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <Award className="h-5 w-5 text-gray-400 mt-1" />
                        <div>
                          <h3 className="font-semibold">Professional Experience</h3>
                          <p className="text-gray-600">{profileData.experience}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 