import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  User, Mail, Briefcase, MapPin, GraduationCap, Award, Phone, Globe,
  Github, Linkedin, Twitter, CalendarDays, FileText, Trophy, Star, Bell,
  Shield, Lock, KeyRound, Camera, Upload, Settings, Sparkles, Plus, Trash2, LayoutDashboard
} from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    title: "Software Engineer",
    location: "New York, USA",
    phone: "",
    website: "",
    socials: {
      github: "",
      linkedin: "",
      twitter: ""
    },
    bio: "Passionate about building innovative solutions and learning new technologies.",
    education: "Bachelor's in Computer Science",
    skills: ["React", "TypeScript", "Node.js", "Python"],
    experience: "5 years of experience in software development"
  });
  const [newSkill, setNewSkill] = useState("");
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    pushNotifications: false,
    interviewReminders: true,
    productUpdates: true,
    twoFactorAuth: false
  });

  const profileCompletion = useMemo(() => {
    const checks = [
      !!profileData.name,
      !!profileData.email,
      !!profileData.title,
      !!profileData.location,
      !!profileData.bio,
      !!profileData.education,
      profileData.skills.length > 0,
      !!profileData.experience
    ];
    const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
    return Math.max(10, Math.min(score, 100));
  }, [profileData]);

  const handleSave = () => {
    // TODO: Implement save functionality with backend
    setIsEditing(false);
  };

  const addSkill = () => {
    const value = newSkill.trim();
    if (!value) return;
    if (profileData.skills.includes(value)) return;
    setProfileData({ ...profileData, skills: [...profileData.skills, value] });
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setProfileData({ ...profileData, skills: profileData.skills.filter(s => s !== skill) });
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
      
      <div className="w-full px-3 sm:px-6 lg:px-10 py-6 sm:py-8">
        <div className="w-full">
          {/* Profile Header */}
          <Card className="mb-6 sm:mb-8 overflow-hidden">
            <div className="h-24 sm:h-32 bg-gray-100" />
            <CardContent className="pt-0">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-12">
                <div className="relative">
                  <Avatar className="h-24 w-24 sm:h-28 sm:w-28 ring-4 ring-white">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${(user?.name || 'User')}&color=black&size=512&font-size=0.4&bold=true`} />
                    <AvatarFallback className="text-3xl">{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                  <Button size="icon" variant="secondary" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-md">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold">{profileData.name || "Your Name"}</h1>
                  <p className="text-gray-600">{profileData.title}</p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start mt-3 text-gray-600">
                    <span className="flex items-center"><MapPin className="h-4 w-4 mr-2" />{profileData.location}</span>
                    <span className="flex items-center"><Mail className="h-4 w-4 mr-2" />{profileData.email}</span>
                    {profileData.phone && (
                      <span className="flex items-center"><Phone className="h-4 w-4 mr-2" />{profileData.phone}</span>
                    )}
                    </div>
                  <div className="flex gap-3 justify-center md:justify-start mt-3">
                    {profileData.socials.github && (
                      <a href={profileData.socials.github} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-gray-900"><Github className="h-5 w-5" /></a>
                    )}
                    {profileData.socials.linkedin && (
                      <a href={profileData.socials.linkedin} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-gray-900"><Linkedin className="h-5 w-5" /></a>
                    )}
                    {profileData.socials.twitter && (
                      <a href={profileData.socials.twitter} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-gray-900"><Twitter className="h-5 w-5" /></a>
                    )}
                    {profileData.website && (
                      <a href={profileData.website} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-gray-900"><Globe className="h-5 w-5" /></a>
                    )}
                    </div>
                  </div>
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <Link to="/resume">
                      <Upload className="h-4 w-4 mr-2" /> Manage Resume
                    </Link>
                  </Button>
                <Button 
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                >
                    {isEditing ? "Save" : "Edit"}
                </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 mt-6">
                <Card className="border-dashed">
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600 mb-2">Profile Completion</div>
                    <div className="flex items-center gap-3">
                      <Progress value={profileCompletion} className="w-full" />
                      <div className="text-sm font-semibold w-10 text-right">{profileCompletion}%</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600">Resumes</div>
                    <div className="text-2xl font-bold">3</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600">Mock Sessions</div>
                    <div className="text-2xl font-bold">8</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Profile Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="flex flex-wrap gap-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="resume">Resume</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>About Me</CardTitle>
                  <CardDescription>Your professional summary and background</CardDescription>
                </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{profileData.bio}</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <GraduationCap className="h-5 w-5 text-gray-400 mt-1" />
                        <div>
                          <div className="text-sm text-gray-500">Education</div>
                          <div className="font-medium">{profileData.education}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Briefcase className="h-5 w-5 text-gray-400 mt-1" />
                        <div>
                          <div className="text-sm text-gray-500">Experience</div>
                          <div className="font-medium">{profileData.experience}</div>
                        </div>
                        </div>
                      </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                    <CardDescription>Your milestones</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1"><Trophy className="h-3 w-3" /> Top Performer</Badge>
                    <Badge variant="secondary" className="flex items-center gap-1"><Star className="h-3 w-3" /> 100% Profile</Badge>
                    <Badge variant="secondary" className="flex items-center gap-1"><FileText className="h-3 w-3" /> Resume Pro</Badge>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                  <CardDescription>Your technical and professional skills</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">{skill}</span>
                    ))}
                      </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                  <CardDescription>Jump to common actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Button variant="outline" asChild><Link to="/resume"><FileText className="h-4 w-4 mr-2" /> Build Resume</Link></Button>
                    <Button variant="outline" asChild><Link to="/my-resumes"><Award className="h-4 w-4 mr-2" /> My Resumes</Link></Button>
                    <Button variant="outline" asChild><Link to="/interview"><Sparkles className="h-4 w-4 mr-2" /> Start Mock Interview</Link></Button>
                    <Button variant="outline" asChild><Link to="/view-all-jobs"><Briefcase className="h-4 w-4 mr-2" /> View Jobs</Link></Button>
                    </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Edit */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" value={profileData.title} onChange={(e) => setProfileData({ ...profileData, title: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" value={profileData.location} onChange={(e) => setProfileData({ ...profileData, location: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" placeholder="https://" value={profileData.website} onChange={(e) => setProfileData({ ...profileData, website: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="github">GitHub</Label>
                      <Input id="github" placeholder="https://github.com/username" value={profileData.socials.github} onChange={(e) => setProfileData({ ...profileData, socials: { ...profileData.socials, github: e.target.value } })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input id="linkedin" placeholder="https://linkedin.com/in/username" value={profileData.socials.linkedin} onChange={(e) => setProfileData({ ...profileData, socials: { ...profileData.socials, linkedin: e.target.value } })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input id="twitter" placeholder="https://twitter.com/username" value={profileData.socials.twitter} onChange={(e) => setProfileData({ ...profileData, socials: { ...profileData.socials, twitter: e.target.value } })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" rows={4} value={profileData.bio} onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="education">Education</Label>
                      <Input id="education" value={profileData.education} onChange={(e) => setProfileData({ ...profileData, education: e.target.value })} />
                    </div>
                      <div className="space-y-2">
                      <Label htmlFor="experience">Experience Summary</Label>
                      <Input id="experience" value={profileData.experience} onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })} />
                      </div>
                    </div>
                  <div className="space-y-3">
                    <Label>Skills</Label>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                          {skill}
                          <button aria-label={`Remove ${skill}`} className="text-gray-700/70 hover:text-gray-800" onClick={() => removeSkill(skill)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Add a skill" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' ? addSkill() : undefined} />
                      <Button type="button" onClick={addSkill}><Plus className="h-4 w-4 mr-1" /> Add</Button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSave}><Settings className="h-4 w-4 mr-2" /> Save Changes</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resume */}
            <TabsContent value="resume">
              <Card>
                <CardHeader>
                  <CardTitle>Resume Management</CardTitle>
                  <CardDescription>Build, manage, and share your resumes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <Button asChild><Link to="/resume"><FileText className="h-4 w-4 mr-2" /> Open Builder</Link></Button>
                    <Button variant="outline" asChild><Link to="/my-resumes"><Award className="h-4 w-4 mr-2" /> My Resumes</Link></Button>
                    <Button variant="secondary" asChild><Link to="/shared-resume"><CalendarDays className="h-4 w-4 mr-2" /> Shared Resumes</Link></Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest actions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-gray-500 mt-1" />
                    <div>
                      <div className="font-medium">Completed a mock interview</div>
                      <div className="text-sm text-gray-500">Today • Behavioral Questions set</div>
                      </div>
                    </div>
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-gray-500 mt-1" />
                        <div>
                      <div className="font-medium">Updated resume "Frontend Engineer"</div>
                      <div className="text-sm text-gray-500">Yesterday • 3 sections edited</div>
                        </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-gray-500 mt-1" />
                    <div>
                      <div className="font-medium">Viewed 12 recommended jobs</div>
                      <div className="text-sm text-gray-500">This week</div>
                      </div>
                    </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Control your notification preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><Bell className="h-4 w-4" /> Email notifications</div>
                      <Switch checked={prefs.emailNotifications} onCheckedChange={(v) => setPrefs({ ...prefs, emailNotifications: v })} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><Bell className="h-4 w-4" /> Push notifications</div>
                      <Switch checked={prefs.pushNotifications} onCheckedChange={(v) => setPrefs({ ...prefs, pushNotifications: v })} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><CalendarDays className="h-4 w-4" /> Interview reminders</div>
                      <Switch checked={prefs.interviewReminders} onCheckedChange={(v) => setPrefs({ ...prefs, interviewReminders: v })} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><Sparkles className="h-4 w-4" /> Product updates</div>
                      <Switch checked={prefs.productUpdates} onCheckedChange={(v) => setPrefs({ ...prefs, productUpdates: v })} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Keep your account secure</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><Shield className="h-4 w-4" /> Two-factor authentication</div>
                      <Switch checked={prefs.twoFactorAuth} onCheckedChange={(v) => setPrefs({ ...prefs, twoFactorAuth: v })} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Button variant="outline"><Lock className="h-4 w-4 mr-2" /> Change password</Button>
                      <Button variant="outline"><KeyRound className="h-4 w-4 mr-2" /> View login history</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Connected Accounts</CardTitle>
                    <CardDescription>Integrate your professional profiles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <Button variant="outline" className="justify-start"><Github className="h-4 w-4 mr-2" /> Connect GitHub</Button>
                      <Button variant="outline" className="justify-start"><Linkedin className="h-4 w-4 mr-2" /> Connect LinkedIn</Button>
                      <Button variant="outline" className="justify-start"><Twitter className="h-4 w-4 mr-2" /> Connect Twitter</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 