"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import {
  Activity,
  ArrowLeft,
  Save,
  Brain,
  Clock,
  Calendar,
  Heart,
  Home,
  PenTool,
  BarChart,
  History,
} from "lucide-react"

interface LogEntry {
  id: string
  date: string
  time: string
  painLevel: number
  stressLevel: number
  symptoms: string[]
  triggers: string[]
  remedies: string[]
  notes: string
  mealSize?: string
  timeSinceEating?: number
  sleepQuality?: number
  exerciseLevel?: number
  weatherCondition?: string
  ingestionTime?: string
}

interface UserProfile {
  name: string
  age: number
  height: string
  weight: string
  gender: string
  conditions: string[]
  medications: string[]
  allergies: string[]
  dietaryRestrictions: string[]
  triggers: string[]
  effectiveRemedies: string[]
}

export default function GastroGuardApp() {
  const [mounted, setMounted] = useState(false)
  const [currentView, setCurrentView] = useState("dashboard")
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    age: 0,
    height: "",
    weight: "",
    gender: "",
    conditions: [],
    medications: [],
    allergies: [],
    dietaryRestrictions: [],
    triggers: [],
    effectiveRemedies: [],
  })

  const todayEntries = useMemo(() => {
    const today = new Date().toDateString()
    return entries.filter((entry) => new Date(entry.date).toDateString() === today)
  }, [entries])

  const recentEntries = useMemo(() => {
    return entries.slice(-5).reverse()
  }, [entries])

  // Current symptom tracking state
  const [currentPainLevel, setCurrentPainLevel] = useState(0)
  const [currentStressLevel, setCurrentStressLevel] = useState(0)
  const [currentSymptoms, setCurrentSymptoms] = useState<string[]>([])

  // Enhanced logging state
  const [painLevel, setPainLevel] = useState(0)
  const [stressLevel, setStressLevel] = useState(0)
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([])
  const [selectedRemedies, setSelectedRemedies] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [mealSize, setMealSize] = useState("")
  const [timeSinceEating, setTimeSinceEating] = useState(0)
  const [sleepQuality, setSleepQuality] = useState(5)
  const [exerciseLevel, setExerciseLevel] = useState(0)
  const [weatherCondition, setWeatherCondition] = useState("")
  const [ingestionTime, setIngestionTime] = useState("")

  const symptoms = [
    "Stomach Pain",
    "Nausea",
    "Bloating",
    "Heartburn",
    "Acid Reflux",
    "Indigestion",
    "Cramping",
    "Gas",
    "Diarrhea",
    "Constipation",
    "Loss of Appetite",
    "Vomiting",
    "Belching",
    "Fullness",
  ]

  const triggers = [
    "Spicy Food",
    "Fatty Food",
    "Acidic Food",
    "Dairy",
    "Gluten",
    "Alcohol",
    "Caffeine",
    "Stress",
    "Lack of Sleep",
    "Medication",
    "Large Meal",
    "Eating Late",
    "Smoking",
    "NSAIDs",
  ]

  const remedies = [
    "Antacid",
    "PPI",
    "H2 Blocker",
    "Probiotics",
    "Ginger Tea",
    "Chamomile Tea",
    "Rest",
    "Light Walk",
    "Heat Pad",
    "Deep Breathing",
    "Small Meals",
    "Bland Diet",
    "Hydration",
    "Meditation",
  ]

  const conditions = ["Gastritis", "GERD", "IBS", "Dyspepsia", "Food Sensitivities", "IBD"]

  const weatherOptions = ["Sunny", "Cloudy", "Rainy", "Stormy", "Hot", "Cold", "Humid", "Dry"]

  const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say", "AMAB", "AFAB"]

  useEffect(() => {
    setMounted(true)
    // Load data from localStorage
    const savedEntries = localStorage.getItem("gastroguard-entries")
    const savedProfile = localStorage.getItem("gastroguard-profile")

    if (savedEntries) {
      setEntries(JSON.parse(savedEntries))
    }
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile))
    }
  }, [])

  const saveEntry = () => {
    const newEntry: LogEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString(),
      painLevel,
      stressLevel,
      symptoms: selectedSymptoms,
      triggers: selectedTriggers,
      remedies: selectedRemedies,
      notes,
      mealSize,
      timeSinceEating,
      sleepQuality,
      exerciseLevel,
      weatherCondition,
      ingestionTime,
    }

    const updatedEntries = [...entries, newEntry]
    setEntries(updatedEntries)
    localStorage.setItem("gastroguard-entries", JSON.stringify(updatedEntries))

    // Reset form
    setPainLevel(0)
    setStressLevel(0)
    setSelectedSymptoms([])
    setSelectedTriggers([])
    setSelectedRemedies([])
    setNotes("")
    setMealSize("")
    setTimeSinceEating(0)
    setSleepQuality(5)
    setExerciseLevel(0)
    setWeatherCondition("")
    setIngestionTime("")

    toast({
      title: "Entry Saved",
      description: "Your symptom log has been recorded successfully.",
    })

    setCurrentView("dashboard")
  }

  const saveProfile = () => {
    localStorage.setItem("gastroguard-profile", JSON.stringify(userProfile))
    toast({
      title: "Profile Updated",
      description: "Your profile has been saved successfully.",
    })
  }

  const getPersonalizedRecommendations = () => {
    console.log("[v0] Getting personalized recommendations")

    if (!userProfile.name) {
      return ["Please complete your profile first to get personalized recommendations."]
    }

    const recommendations = []

    // Pain level based recommendations
    if (currentPainLevel >= 7) {
      recommendations.push("Consider taking your prescribed PPI or antacid")
      recommendations.push("Try gentle breathing exercises to manage severe pain")
      recommendations.push("Avoid solid foods until pain subsides")
    } else if (currentPainLevel >= 4) {
      recommendations.push("Consider a light, bland meal if you haven't eaten")
      recommendations.push("Try chamomile or ginger tea for relief")
    }

    // Stress level recommendations
    if (currentStressLevel >= 6) {
      recommendations.push("Practice stress reduction techniques like meditation")
      recommendations.push("Consider a short walk or gentle exercise")
    }

    // Condition-specific recommendations
    if (userProfile.conditions.includes("GERD")) {
      recommendations.push("Avoid lying down for 2-3 hours after eating")
      recommendations.push("Keep your head elevated while sleeping")
    }

    if (userProfile.conditions.includes("IBS")) {
      recommendations.push("Consider following a low-FODMAP diet")
      recommendations.push("Track fiber intake and adjust accordingly")
    }

    // Medication safety check
    if (userProfile.allergies.length > 0) {
      recommendations.push(`⚠️ Remember your allergies: ${userProfile.allergies.join(", ")}`)
    }

    return recommendations.length > 0
      ? recommendations
      : ["Stay hydrated throughout the day", "Eat smaller, more frequent meals", "Keep a consistent sleep schedule"]
  }

  const getPainDescription = (level: number) => {
    const descriptions = [
      "No pain",
      "Very mild discomfort",
      "Mild pain, barely noticeable",
      "Moderate pain, noticeable but manageable",
      "Moderate pain, interferes with some activities",
      "Moderately severe pain, interferes with most activities",
      "Severe pain, difficult to ignore",
      "Very severe pain, dominates your senses",
      "Intense pain, unable to do most activities",
      "Excruciating pain, unable to function",
      "Unbearable pain, seek immediate medical attention",
    ]
    return descriptions[level] || "Unknown"
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {currentView !== "dashboard" && (
              <button
                onClick={() => setCurrentView("dashboard")}
                className="p-2 rounded-full bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:bg-white/90 transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                GastroGuard
              </h1>
              <p className="text-sm text-gray-600">Enhanced v3.0</p>
            </div>
          </div>
        </div>

        {/* Dashboard View */}
        {currentView === "dashboard" && (
          <div className="space-y-6">
            {/* Welcome Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Welcome back{userProfile.name ? `, ${userProfile.name}` : ""}!
                </CardTitle>
                <CardDescription>Track your symptoms and get personalized recommendations</CardDescription>
              </CardHeader>
            </Card>

            {/* Current Status */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Current Pain Level: {currentPainLevel}/10</Label>
                  <p className="text-xs text-gray-600 mb-2">{getPainDescription(currentPainLevel)}</p>
                  <Slider
                    value={[currentPainLevel]}
                    onValueChange={(value) => setCurrentPainLevel(value[0])}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Current Stress Level: {currentStressLevel}/10</Label>
                  <Slider
                    value={[currentStressLevel]}
                    onValueChange={(value) => setCurrentStressLevel(value[0])}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setCurrentView("enhanced-log")}
                className="p-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
              >
                <PenTool className="w-6 h-6 text-white" />
                <span className="font-semibold text-white">Enhanced Log</span>
              </button>

              <button
                onClick={() => setCurrentView("smart-recommendations")}
                className="p-6 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
              >
                <Brain className="w-6 h-6 text-white" />
                <span className="font-semibold text-white">Smart Recommendations</span>
              </button>
            </div>

            {/* Today's Summary */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-500" />
                  Today's Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{todayEntries.length}</div>
                    <div className="text-sm text-gray-600">Entries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">
                      {todayEntries.length > 0
                        ? Math.round(
                            todayEntries.reduce((sum, entry) => sum + entry.painLevel, 0) / todayEntries.length,
                          )
                        : 0}
                    </div>
                    <div className="text-sm text-gray-600">Avg Pain</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">
                      {todayEntries.length > 0
                        ? Math.round(
                            todayEntries.reduce((sum, entry) => sum + entry.stressLevel, 0) / todayEntries.length,
                          )
                        : 0}
                    </div>
                    <div className="text-sm text-gray-600">Avg Stress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {todayEntries.reduce((sum, entry) => sum + entry.remedies.length, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Remedies Used</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Entries */}
            {recentEntries.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-500" />
                    Recent Entries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentEntries.map((entry) => (
                      <div key={entry.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium">
                            {entry.date} at {entry.time}
                          </span>
                          <div className="flex gap-2">
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                              Pain: {entry.painLevel}/10
                            </span>
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                              Stress: {entry.stressLevel}/10
                            </span>
                          </div>
                        </div>
                        {entry.symptoms.length > 0 && (
                          <p className="text-sm text-gray-600">Symptoms: {entry.symptoms.join(", ")}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Enhanced Log View */}
        {currentView === "enhanced-log" && (
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-blue-500" />
                  Enhanced Symptom Log
                </CardTitle>
                <CardDescription>
                  Comprehensive tracking with detailed pain scale and contextual factors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pain Level with Enhanced Scale */}
                <div>
                  <Label className="text-sm font-medium">Pain Level: {painLevel}/10</Label>
                  <p className="text-xs text-gray-600 mb-2">{getPainDescription(painLevel)}</p>
                  <Slider
                    value={[painLevel]}
                    onValueChange={(value) => setPainLevel(value[0])}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Stress Level */}
                <div>
                  <Label className="text-sm font-medium">Stress Level: {stressLevel}/10</Label>
                  <Slider
                    value={[stressLevel]}
                    onValueChange={(value) => setStressLevel(value[0])}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Meal Context */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Meal Size</Label>
                    <Select value={mealSize} onValueChange={setMealSize}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select meal size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                        <SelectItem value="snack">Snack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Hours Since Eating: {timeSinceEating}</Label>
                    <Slider
                      value={[timeSinceEating]}
                      onValueChange={(value) => setTimeSinceEating(value[0])}
                      max={12}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Time of Ingestion */}
                <div>
                  <Label className="text-sm font-medium">Time of Food/Trigger Ingestion</Label>
                  <Input
                    type="time"
                    value={ingestionTime}
                    onChange={(e) => setIngestionTime(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Lifestyle Factors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Sleep Quality (1-10): {sleepQuality}</Label>
                    <Slider
                      value={[sleepQuality]}
                      onValueChange={(value) => setSleepQuality(value[0])}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Exercise Level (0-10): {exerciseLevel}</Label>
                    <Slider
                      value={[exerciseLevel]}
                      onValueChange={(value) => setExerciseLevel(value[0])}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Weather Condition */}
                <div>
                  <Label className="text-sm font-medium">Weather Condition</Label>
                  <Select value={weatherCondition} onValueChange={setWeatherCondition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select weather" />
                    </SelectTrigger>
                    <SelectContent>
                      {weatherOptions.map((weather) => (
                        <SelectItem key={weather} value={weather.toLowerCase()}>
                          {weather}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Symptoms */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Symptoms</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {symptoms.map((symptom) => (
                      <button
                        key={symptom}
                        onClick={() => {
                          if (selectedSymptoms.includes(symptom)) {
                            setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom))
                          } else {
                            setSelectedSymptoms([...selectedSymptoms, symptom])
                          }
                        }}
                        className={`p-2 text-xs rounded-lg border transition-all ${
                          selectedSymptoms.includes(symptom)
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Triggers */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Potential Triggers</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {triggers.map((trigger) => (
                      <button
                        key={trigger}
                        onClick={() => {
                          if (selectedTriggers.includes(trigger)) {
                            setSelectedTriggers(selectedTriggers.filter((t) => t !== trigger))
                          } else {
                            setSelectedTriggers([...selectedTriggers, trigger])
                          }
                        }}
                        className={`p-2 text-xs rounded-lg border transition-all ${
                          selectedTriggers.includes(trigger)
                            ? "bg-red-500 text-white border-red-500"
                            : "bg-white text-gray-700 border-gray-200 hover:border-red-300"
                        }`}
                      >
                        {trigger}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Remedies */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Remedies Tried</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {remedies.map((remedy) => (
                      <button
                        key={remedy}
                        onClick={() => {
                          if (selectedRemedies.includes(remedy)) {
                            setSelectedRemedies(selectedRemedies.filter((r) => r !== remedy))
                          } else {
                            setSelectedRemedies([...selectedRemedies, remedy])
                          }
                        }}
                        className={`p-2 text-xs rounded-lg border transition-all ${
                          selectedRemedies.includes(remedy)
                            ? "bg-green-500 text-white border-green-500"
                            : "bg-white text-gray-700 border-gray-200 hover:border-green-300"
                        }`}
                      >
                        {remedy}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label className="text-sm font-medium">Additional Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional details about your symptoms, what you ate, activities, etc."
                    className="w-full"
                  />
                </div>

                <button
                  onClick={saveEntry}
                  className="w-full p-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Entry
                </button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Other views would continue here... */}
        {/* For brevity, I'll add placeholder views */}
        {currentView === "analytics" && (
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Analytics view coming soon...</p>
            </CardContent>
          </Card>
        )}

        {currentView === "history" && (
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle>History</CardTitle>
            </CardHeader>
            <CardContent>
              <p>History view coming soon...</p>
            </CardContent>
          </Card>
        )}

        {/* Smart Recommendations View */}
        {currentView === "smart-recommendations" && (
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                Smart Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getPersonalizedRecommendations().map((recommendation, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {currentView === "profile" && (
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  Personal Profile
                </CardTitle>
                <CardDescription>
                  Complete your profile for personalized recommendations and better tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <Input
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                      placeholder="Enter your name"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Age</Label>
                    <Input
                      type="number"
                      value={userProfile.age || ""}
                      onChange={(e) => setUserProfile({ ...userProfile, age: Number.parseInt(e.target.value) || 0 })}
                      placeholder="Enter your age"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Height</Label>
                    <Input
                      value={userProfile.height}
                      onChange={(e) => setUserProfile({ ...userProfile, height: e.target.value })}
                      placeholder="e.g., 5'8 or 173cm"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Weight</Label>
                    <Input
                      value={userProfile.weight}
                      onChange={(e) => setUserProfile({ ...userProfile, weight: e.target.value })}
                      placeholder="e.g., 150 lbs or 68 kg"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Gender</Label>
                    <Select
                      value={userProfile.gender}
                      onValueChange={(value) => setUserProfile({ ...userProfile, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {genderOptions.map((gender) => (
                          <SelectItem key={gender} value={gender.toLowerCase()}>
                            {gender}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Medical Conditions */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Medical Conditions</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {conditions.map((condition) => (
                      <button
                        key={condition}
                        onClick={() => {
                          if (userProfile.conditions.includes(condition)) {
                            setUserProfile({
                              ...userProfile,
                              conditions: userProfile.conditions.filter((c) => c !== condition),
                            })
                          } else {
                            setUserProfile({
                              ...userProfile,
                              conditions: [...userProfile.conditions, condition],
                            })
                          }
                        }}
                        className={`p-2 text-xs rounded-lg border transition-all ${
                          userProfile.conditions.includes(condition)
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        {condition}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Medications */}
                <div>
                  <Label className="text-sm font-medium">Current Medications</Label>
                  <Textarea
                    value={userProfile.medications.join(", ")}
                    onChange={(e) =>
                      setUserProfile({
                        ...userProfile,
                        medications: e.target.value
                          .split(",")
                          .map((med) => med.trim())
                          .filter((med) => med),
                      })
                    }
                    placeholder="List your current medications (separated by commas)"
                    className="w-full"
                  />
                </div>

                {/* Allergies */}
                <div>
                  <Label className="text-sm font-medium">Allergies</Label>
                  <Textarea
                    value={userProfile.allergies.join(", ")}
                    onChange={(e) =>
                      setUserProfile({
                        ...userProfile,
                        allergies: e.target.value
                          .split(",")
                          .map((allergy) => allergy.trim())
                          .filter((allergy) => allergy),
                      })
                    }
                    placeholder="List your allergies (separated by commas)"
                    className="w-full"
                  />
                </div>

                {/* Dietary Restrictions */}
                <div>
                  <Label className="text-sm font-medium">Dietary Restrictions</Label>
                  <Textarea
                    value={userProfile.dietaryRestrictions.join(", ")}
                    onChange={(e) =>
                      setUserProfile({
                        ...userProfile,
                        dietaryRestrictions: e.target.value
                          .split(",")
                          .map((restriction) => restriction.trim())
                          .filter((restriction) => restriction),
                      })
                    }
                    placeholder="List your dietary restrictions (separated by commas)"
                    className="w-full"
                  />
                </div>

                {/* Known Triggers */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Known Triggers</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {triggers.map((trigger) => (
                      <button
                        key={trigger}
                        onClick={() => {
                          if (userProfile.triggers.includes(trigger)) {
                            setUserProfile({
                              ...userProfile,
                              triggers: userProfile.triggers.filter((t) => t !== trigger),
                            })
                          } else {
                            setUserProfile({
                              ...userProfile,
                              triggers: [...userProfile.triggers, trigger],
                            })
                          }
                        }}
                        className={`p-2 text-xs rounded-lg border transition-all ${
                          userProfile.triggers.includes(trigger)
                            ? "bg-red-500 text-white border-red-500"
                            : "bg-white text-gray-700 border-gray-200 hover:border-red-300"
                        }`}
                      >
                        {trigger}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Effective Remedies */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Effective Remedies</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {remedies.map((remedy) => (
                      <button
                        key={remedy}
                        onClick={() => {
                          if (userProfile.effectiveRemedies.includes(remedy)) {
                            setUserProfile({
                              ...userProfile,
                              effectiveRemedies: userProfile.effectiveRemedies.filter((r) => r !== remedy),
                            })
                          } else {
                            setUserProfile({
                              ...userProfile,
                              effectiveRemedies: [...userProfile.effectiveRemedies, remedy],
                            })
                          }
                        }}
                        className={`p-2 text-xs rounded-lg border transition-all ${
                          userProfile.effectiveRemedies.includes(remedy)
                            ? "bg-green-500 text-white border-green-500"
                            : "bg-white text-gray-700 border-gray-200 hover:border-green-300"
                        }`}
                      >
                        {remedy}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={saveProfile}
                  className="w-full p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Profile
                </button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {[
            { id: "dashboard", icon: Home, label: "Dashboard" },
            { id: "enhanced-log", icon: PenTool, label: "Enhanced Log" },
            { id: "analytics", icon: BarChart, label: "Analytics" },
            { id: "history", icon: History, label: "History" },
            { id: "profile", icon: Activity, label: "Profile" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 ${
                currentView === tab.id
                  ? "text-cyan-600 bg-cyan-50"
                  : "text-gray-600 hover:text-cyan-600 hover:bg-gray-50"
              }`}
            >
              {tab.icon && <tab.icon className="w-5 h-5" />}
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
