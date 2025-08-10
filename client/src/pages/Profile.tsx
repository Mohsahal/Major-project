import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Briefcase, MapPin, GraduationCap, Award } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
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

  const handleSave = () => {
    // TODO: Implement save functionality with backend
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.name?.charAt(0) || 'U'}&background=7c3aed&color=fff&size=512&font-size=0.4&bold=true`} />
                  <AvatarFallback className="text-4xl">{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left">
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
                </div>
                <Button 
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                >
                  {isEditing ? "Save Changes" : "Edit Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Profile Content */}
          <Tabs defaultValue="about" className="space-y-6">
            <TabsList>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
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
                        <span
                          key={index}
                          className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm"
                        >
                          {skill}
                        </span>
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