"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import {
  Activity,
  Plus,
  BarChart3,
  ArrowLeft,
  Save,
  FileText,
  User,
  Brain,
  RefreshCw,
  Star,
  AlertTriangle,
  Clock,
} from "lucide-react"

const CONDITION_DEFINITIONS = {
  gastritis: {
    name: "Gastritis",
    description: "Inflammation of the stomach lining causing pain, nausea, and digestive issues",
    symptoms: ["stomach_pain", "nausea", "bloating", "loss_of_appetite", "heartburn"],
    triggers: ["spicy_foods", "alcohol", "stress", "medications", "h_pylori"],
  },
  gerd: {
    name: "GERD",
    description: "Gastroesophageal reflux disease causing acid reflux and heartburn",
    symptoms: ["heartburn", "acid_reflux", "chest_pain", "difficulty_swallowing", "regurgitation"],
    triggers: ["citrus_foods", "tomatoes", "chocolate", "caffeine", "large_meals"],
  },
  ibs: {
    name: "IBS",
    description: "Irritable bowel syndrome affecting the large intestine",
    symptoms: ["abdominal_pain", "bloating", "diarrhea", "constipation", "gas"],
    triggers: ["high_fodmap_foods", "stress", "hormonal_changes", "certain_medications"],
  },
  dyspepsia: {
    name: "Functional Dyspepsia",
    description: "Chronic indigestion without identifiable cause",
    symptoms: ["upper_abdominal_pain", "early_satiety", "postprandial_fullness", "nausea"],
    triggers: ["fatty_foods", "stress", "irregular_eating", "certain_medications"],
  },
  food_sensitivity: {
    name: "Food Sensitivities",
    description: "Adverse reactions to specific foods or food components",
    symptoms: ["digestive_upset", "bloating", "headaches", "skin_reactions", "fatigue"],
    triggers: ["dairy", "gluten", "histamine", "food_additives", "specific_proteins"],
  },
  ibd: {
    name: "IBD Support",
    description: "Inflammatory bowel disease management support",
    symptoms: ["abdominal_pain", "diarrhea", "weight_loss", "fatigue", "rectal_bleeding"],
    triggers: ["stress", "certain_foods", "medications", "infections", "smoking"],
  },
}

const ENHANCED_PAIN_SCALE = {
  0: { label: "No Pain", description: "Complete comfort, no symptoms", impact: "No functional impact" },
  1: {
    label: "Barely Noticeable",
    description: "Very light sensation; does not interfere with activities",
    impact: "Minimal awareness",
  },
  2: {
    label: "Very Mild",
    description: "Still ignorable, but occasionally noticeable",
    impact: "Slight bloating or gas",
  },
  3: {
    label: "Mild",
    description: "Intermittent discomfort; aware but tolerable",
    impact: "Nausea, burping, slight fullness",
  },
  4: { label: "Uncomfortable", description: "Persistent enough to be distracting", impact: "Affects concentration" },
  5: {
    label: "Moderate",
    description: "Affects focus; consider stopping some tasks",
    impact: "Disrupts daily activities",
  },
  6: {
    label: "Distressing",
    description: "Requires sitting/lying down; disrupts concentration",
    impact: "Mobility affected",
  },
  7: {
    label: "Strong",
    description: "Interferes with mobility and eating; may cry or wince",
    impact: "Significant impairment",
  },
  8: {
    label: "Severe",
    description: "Unable to work or socialize; sweating or doubled over",
    impact: "Cannot function normally",
  },
  9: {
    label: "Disabling",
    description: "Can't sit upright; pacing or fetal position",
    impact: "Completely incapacitated",
  },
  10: {
    label: "Unbearable",
    description: "Emergency-level; cannot talk or move; possible ER visit",
    impact: "Medical emergency",
  },
}

interface EnhancedUserProfile {
  name: string
  age: number
  gender: string
  primaryCondition: string
  secondaryConditions: string[]
  currentMedications: string[]
  allergies: string[]
  emergencyContact: string
  healthcareProvider: string
  goals: string[]
  profileCreated: string
  lastUpdated: string
}

interface EnhancedSymptomEntry {
  id: string
  timestamp: string
  timeOfIngestion: string
  meal: string
  painLevel: number
  stressLevel: number
  remedy: string
  conditionType: string
  symptomTypes: string[]
  mealSize: string
  mealTiming: string
  sleepQuality: number
  exerciseLevel: number
  weather: string
  notes: string
  isRetroactive: boolean
}

interface RemedyEffectiveness {
  id: string
  timestamp: string
  remedy: string
  painBefore: number
  stressBefore: number
  painAfter: number
  stressAfter: number
  effectiveness: number
  notes: string
}

type TimeFilter = "all" | "today" | "week" | "month" | "last7" | "last30" | "custom"
type ViewType =
  | "dashboard"
  | "log-entry"
  | "analytics"
  | "history"
  | "timeline"
  | "simulation"
  | "remedy-tracker"
  | "profile"
  | "recommendations"

export default function GastroGuardEnhancedV3() {
  const [mounted, setMounted] = useState(false)
  const [currentView, setCurrentView] = useState<ViewType>("dashboard")
  const [entries, setEntries] = useState<EnhancedSymptomEntry[]>([])

  const [userProfile, setUserProfile] = useState<EnhancedUserProfile>({
    name: "",
    age: 0,
    gender: "",
    primaryCondition: "gastritis",
    secondaryConditions: [],
    currentMedications: [],
    allergies: [],
    emergencyContact: "",
    healthcareProvider: "",
    goals: [],
    profileCreated: "",
    lastUpdated: "",
  })

  const [remedyData, setRemedyData] = useState<RemedyEffectiveness[]>([])
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [customDateRange, setCustomDateRange] = useState({
    start: new Date().toISOString().slice(0, 10),
    end: new Date().toISOString().slice(0, 10),
  })

  const [formData, setFormData] = useState({
    meal: "",
    painLevel: [5],
    stressLevel: [5],
    remedy: "",
    timeOfIngestion: new Date().toISOString().slice(0, 16),
    isRetroactive: false,
    conditionType: "gastritis",
    symptomTypes: [] as string[],
    mealSize: "medium",
    mealTiming: "regular",
    sleepQuality: [7],
    exerciseLevel: [5],
    weather: "clear",
    notes: "",
  })

  const [remedyFormData, setRemedyFormData] = useState({
    remedy: "",
    painBefore: [5],
    stressBefore: [5],
    effectiveness: [5],
  })

  const [simulationParams, setSimulationParams] = useState({
    initialSeverity: [3],
    stressLevel: [5],
    foodIrritation: [3],
    simulationHours: [24],
  })

  const [simulationResult, setSimulationResult] = useState<{
    timePoints: number[]
    severityPoints: number[]
    finalSeverity: number
    message: string
  } | null>(null)

  const [timelinePeriod, setTimelinePeriod] = useState<"daily" | "weekly" | "monthly" | "all">("weekly")
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [userAgent, setUserAgent] = useState("")
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [currentSymptoms, setCurrentSymptoms] = useState({ pain: 5, stress: 5 })
  const [recommendations, setRecommendations] = useState<string[]>([])

  const loadEntries = () => {
    const savedEntries = localStorage.getItem("gastroguard-enhanced-entries")
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries))
    }
  }

  const saveEntries = (newEntries: EnhancedSymptomEntry[]) => {
    localStorage.setItem("gastroguard-enhanced-entries", JSON.stringify(newEntries))
    setEntries(newEntries)
  }

  const loadUserProfile = () => {
    const savedProfile = localStorage.getItem("gastroguard-enhanced-profile")
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile))
    }
  }

  const saveUserProfile = (profile: EnhancedUserProfile) => {
    const updatedProfile = {
      ...profile,
      lastUpdated: new Date().toISOString(),
      profileCreated: profile.profileCreated || new Date().toISOString(),
    }
    localStorage.setItem("gastroguard-enhanced-profile", JSON.JSON.stringify(updatedProfile))
    setUserProfile(updatedProfile)
    toast({ title: "Profile saved successfully!" })
  }

  const loadRemedyData = () => {
    const savedRemedyData = localStorage.getItem("gastroguard-enhanced-remedy-data")
    if (savedRemedyData) {
      setRemedyData(JSON.parse(savedRemedyData))
    }
  }

  const generateSmartRecommendations = () => {
    const suggestions: string[] = []
    const currentTime = new Date()
    const hour = currentTime.getHours()
    const painLevel = currentSymptoms.pain
    const stressLevel = currentSymptoms.stress

    // Add user-specific warnings
    if (userProfile.allergies.length > 0) {
      suggestions.push(`⚠️ Remember your allergies: ${userProfile.allergies.join(", ")}`)
    }

    if (userProfile.currentMedications.length > 0) {
      suggestions.push(`💊 Current medications: ${userProfile.currentMedications.join(", ")} - check for interactions`)
    }

    // Time-based suggestions
    if (hour < 10) {
      // Morning
      suggestions.push("🌅 Morning suggestions:")
      suggestions.push("• Ginger tea - Gentle on morning stomach")
      suggestions.push("• Small, bland breakfast")
      suggestions.push("• Probiotic supplement")
      suggestions.push("• Deep breathing exercises")
    } else if (hour < 16) {
      // Afternoon
      suggestions.push("☀️ Afternoon suggestions:")
      suggestions.push("• Peppermint tea - Soothes afternoon discomfort")
      suggestions.push("• Light, frequent meals")
      suggestions.push("• Walking after meals")
      suggestions.push("• Stress management techniques")
    } else {
      // Evening/Night
      suggestions.push("🌙 Evening suggestions:")
      suggestions.push("• Chamomile tea - Calming for evening")
      suggestions.push("• Avoid large meals")
      suggestions.push("• Elevate head while sleeping (for GERD)")
      suggestions.push("• Heat therapy")
    }

    // Pain level based suggestions using enhanced scale
    const painInfo = ENHANCED_PAIN_SCALE[painLevel as keyof typeof ENHANCED_PAIN_SCALE]
    if (painLevel >= 7) {
      // Strong to Unbearable
      suggestions.push("🚨 IMMEDIATE ACTION NEEDED:")
      suggestions.push("• Consider emergency care if severe")
      suggestions.push("• Prescribed medication or antacid")
      suggestions.push("• Heat therapy for pain relief")
      suggestions.push("• Rest in comfortable position")
      suggestions.push("• Small sips of water only")
      if (painLevel >= 9) {
        suggestions.push("⚠️ EMERGENCY: Consider calling doctor or ER if symptoms worsen")
      }
    } else if (painLevel >= 4) {
      // Uncomfortable to Distressing
      suggestions.push(`💡 For ${painInfo.label} pain:`)
      suggestions.push("• Over-the-counter antacid")
      suggestions.push("• Gentle herbal tea")
      suggestions.push("• Light stretching or walking")
      suggestions.push("• Avoid trigger foods")
    } else {
      // Mild pain
      suggestions.push(`✨ For ${painInfo.label} discomfort:`)
      suggestions.push("• Herbal tea (ginger, chamomile)")
      suggestions.push("• Light meal or snack")
      suggestions.push("• Relaxation techniques")
      suggestions.push("• Stay hydrated")
    }

    // Stress level suggestions
    if (stressLevel >= 7) {
      suggestions.push("🧘 High stress management:")
      suggestions.push("• Deep breathing exercises")
      suggestions.push("• Progressive muscle relaxation")
      suggestions.push("• Consider meditation app")
      suggestions.push("• Limit caffeine intake")
    }

    // Condition-specific suggestions
    const condition = CONDITION_DEFINITIONS[userProfile.primaryCondition as keyof typeof CONDITION_DEFINITIONS]
    if (condition) {
      suggestions.push(`📋 For ${condition.name}:`)
      if (userProfile.primaryCondition === "gerd") {
        suggestions.push("• Avoid lying down after eating")
        suggestions.push("• Sleep with elevated head")
        suggestions.push("• Avoid citrus and tomatoes")
      } else if (userProfile.primaryCondition === "ibs") {
        suggestions.push("• Consider low-FODMAP foods")
        suggestions.push("• Manage stress levels")
        suggestions.push("• Regular meal timing")
      } else if (userProfile.primaryCondition === "gastritis") {
        suggestions.push("• Avoid spicy and acidic foods")
        suggestions.push("• Eat smaller, frequent meals")
        suggestions.push("• Limit alcohol and NSAIDs")
      }
    }

    setRecommendations(suggestions)
  }

  const handleSubmitEntry = () => {
    if (!formData.meal.trim()) {
      toast({ title: "Please enter what you consumed", variant: "destructive" })
      return
    }

    const newEntry: EnhancedSymptomEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      timeOfIngestion: formData.timeOfIngestion,
      meal: formData.meal,
      painLevel: formData.painLevel[0],
      stressLevel: formData.stressLevel[0],
      remedy: formData.remedy,
      conditionType: formData.conditionType,
      symptomTypes: formData.symptomTypes,
      mealSize: formData.mealSize,
      mealTiming: formData.mealTiming,
      sleepQuality: formData.sleepQuality[0],
      exerciseLevel: formData.exerciseLevel[0],
      weather: formData.weather,
      notes: formData.notes,
      isRetroactive: formData.isRetroactive,
    }

    const updatedEntries = [...entries, newEntry]
    saveEntries(updatedEntries)

    // Reset form
    setFormData({
      meal: "",
      painLevel: [5],
      stressLevel: [5],
      remedy: "",
      timeOfIngestion: new Date().toISOString().slice(0, 16),
      isRetroactive: false,
      conditionType: userProfile.primaryCondition,
      symptomTypes: [],
      mealSize: "medium",
      mealTiming: "regular",
      sleepQuality: [7],
      exerciseLevel: [5],
      weather: "clear",
      notes: "",
    })

    toast({ title: "Entry logged successfully!" })
    setCurrentView("dashboard")
  }

  const handleSubmitRemedy = () => {
    if (!remedyFormData.remedy.trim()) {
      toast({ title: "Please enter a remedy", variant: "destructive" })
      return
    }

    const newRemedyEntry: RemedyEffectiveness = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      remedy: remedyFormData.remedy,
      painBefore: remedyFormData.painBefore[0],
      stressBefore: remedyFormData.stressBefore[0],
      painAfter: 0, // Will be updated later
      stressAfter: 0, // Will be updated later
      effectiveness: remedyFormData.effectiveness[0],
      notes: "",
    }

    const updatedRemedyData = [...remedyData, newRemedyEntry]
    localStorage.setItem("gastroguard-enhanced-remedy-data", JSON.stringify(updatedRemedyData))
    setRemedyData(updatedRemedyData)

    // Reset form
    setRemedyFormData({
      remedy: "",
      painBefore: [5],
      stressBefore: [5],
      effectiveness: [5],
    })

    toast({ title: "Remedy effectiveness logged!" })
    setCurrentView("dashboard")
  }

  const runGastritisSimulation = () => {
    const initialSeverity = simulationParams.initialSeverity[0]
    const stressLevel = simulationParams.stressLevel[0]
    const foodIrritation = simulationParams.foodIrritation[0]
    const hours = simulationParams.simulationHours[0]

    const timePoints: number[] = []
    const severityPoints: number[] = []

    // Enhanced simulation with differential equations
    let currentSeverity = initialSeverity
    const dt = 0.1 // Time step in hours

    for (let t = 0; t <= hours; t += dt) {
      timePoints.push(t)

      // Enhanced gastritis model with multiple factors
      const healingRate = 0.05 // Natural healing
      const stressEffect = (stressLevel / 10) * 0.03 // Stress increases severity
      const foodEffect = (foodIrritation / 10) * 0.02 // Food irritation
      const circadianEffect = 0.01 * Math.sin((t / 24) * 2 * Math.PI) // Daily rhythm

      // Differential equation: dS/dt = -healingRate*S + stressEffect + foodEffect + circadianEffect
      const dSdt = -healingRate * currentSeverity + stressEffect + foodEffect + circadianEffect
      currentSeverity = Math.max(0, Math.min(10, currentSeverity + dSdt * dt))

      if (Math.floor(t / dt) % 10 === 0) {
        // Store every hour
        severityPoints.push(currentSeverity)
      }
    }

    const finalSeverity = severityPoints[severityPoints.length - 1]
    let message = ""

    if (finalSeverity < 2) {
      message = "🟢 Excellent recovery expected! Your symptoms should improve significantly."
    } else if (finalSeverity < 4) {
      message = "🟡 Good recovery trajectory. Continue current management strategies."
    } else if (finalSeverity < 6) {
      message = "🟠 Moderate improvement expected. Consider adjusting stress management."
    } else {
      message = "🔴 Limited improvement predicted. Consider consulting healthcare provider."
    }

    setSimulationResult({
      timePoints: timePoints.filter((_, i) => i % 10 === 0),
      severityPoints,
      finalSeverity,
      message,
    })
  }

  // PWA install functionality
  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setShowInstallButton(false)
      }
      setDeferredPrompt(null)
    } else if (isIOS) {
      toast({
        title: "Install GastroGuard",
        description: "Tap the Share button and select 'Add to Home Screen'",
      })
    } else {
      toast({
        title: "Install GastroGuard",
        description: "Look for the install button in your browser's address bar",
      })
    }
  }

  // Computed values
  const todayEntries = useMemo(() => {
    const today = new Date().toDateString()
    return entries.filter((entry) => new Date(entry.timestamp).toDateString() === today)
  }, [entries])

  const recentEntries = useMemo(() => {
    return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5)
  }, [entries])

  const filteredEntries = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    let filtered = entries

    switch (timeFilter) {
      case "today":
        filtered = entries.filter((entry) => new Date(entry.timestamp) >= today)
        break
      case "week":
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        filtered = entries.filter((entry) => new Date(entry.timestamp) >= weekAgo)
        break
      case "month":
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        filtered = entries.filter((entry) => new Date(entry.timestamp) >= monthAgo)
        break
      case "last7":
        const last7 = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        filtered = entries.filter((entry) => new Date(entry.timestamp) >= last7)
        break
      case "last30":
        const last30 = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        filtered = entries.filter((entry) => new Date(entry.timestamp) >= last30)
        break
      case "custom":
        const startDate = new Date(customDateRange.start)
        const endDate = new Date(customDateRange.end)
        endDate.setHours(23, 59, 59, 999)
        filtered = entries.filter((entry) => {
          const entryDate = new Date(entry.timestamp)
          return entryDate >= startDate && entryDate <= endDate
        })
        break
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (entry) =>
          entry.meal.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.remedy.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.notes.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    return filtered
  }, [entries, timeFilter, searchQuery, customDateRange])

  useEffect(() => {
    setMounted(true)
    loadEntries()
    loadRemedyData()
    loadUserProfile()

    // PWA install prompt
    window.addEventListener("beforeinstallprompt", (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
    })

    // Detect iOS
    const userAgent = navigator.userAgent.toLowerCase()
    setUserAgent(userAgent)
    setIsIOS(/iphone|ipad|ipod/.test(userAgent))

    // Detect if standalone
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100">
      {/* Enhanced Glass Header */}
      <header className="sticky top-0 z-50 bg-white/20 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-cyan-500/10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {currentView !== "dashboard" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView("dashboard")}
                className="text-cyan-700 hover:bg-white/30 backdrop-blur-sm transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <h1 className="text-xl font-bold text-cyan-800 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-orange-400 to-pink-400 rounded-xl shadow-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              GastroGuard v3.0
            </h1>
            {currentView === "dashboard" && (
              <Button
                onClick={() => setCurrentView("profile")}
                variant="ghost"
                size="sm"
                className="text-cyan-700 hover:bg-white/30 backdrop-blur-sm transition-all duration-300"
              >
                <User className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="text-center mt-2">
            <p className="text-xs text-cyan-600 font-medium">Comprehensive Chronic Stomach Condition Management</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* Enhanced Profile View */}
        {currentView === "profile" && (
          <div className="space-y-6">
            <Card className="bg-white/30 backdrop-blur-xl border-white/40 shadow-xl shadow-cyan-500/10">
              <CardHeader>
                <CardTitle className="text-cyan-800 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Enhanced User Profile
                </CardTitle>
                <CardDescription className="text-cyan-600">
                  Complete health profile for personalized care
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-cyan-700">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                      className="bg-white/50 border-white/40"
                    />
                  </div>
                  <div>
                    <Label htmlFor="age" className="text-cyan-700">
                      Age
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      value={userProfile.age || ""}
                      onChange={(e) => setUserProfile({ ...userProfile, age: Number.parseInt(e.target.value) || 0 })}
                      className="bg-white/50 border-white/40"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="gender" className="text-cyan-700">
                    Gender
                  </Label>
                  <Select
                    value={userProfile.gender}
                    onValueChange={(value) => setUserProfile({ ...userProfile, gender: value })}
                  >
                    <SelectTrigger className="bg-white/50 border-white/40">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="condition" className="text-cyan-700">
                    Primary Condition
                  </Label>
                  <Select
                    value={userProfile.primaryCondition}
                    onValueChange={(value) => setUserProfile({ ...userProfile, primaryCondition: value })}
                  >
                    <SelectTrigger className="bg-white/50 border-white/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CONDITION_DEFINITIONS).map(([key, condition]) => (
                        <SelectItem key={key} value={key}>
                          {condition.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-cyan-600 mt-1">
                    {
                      CONDITION_DEFINITIONS[userProfile.primaryCondition as keyof typeof CONDITION_DEFINITIONS]
                        ?.description
                    }
                  </p>
                </div>

                <div>
                  <Label htmlFor="medications" className="text-cyan-700">
                    Current Medications
                  </Label>
                  <Textarea
                    id="medications"
                    value={userProfile.currentMedications.join(", ")}
                    onChange={(e) =>
                      setUserProfile({
                        ...userProfile,
                        currentMedications: e.target.value
                          .split(",")
                          .map((m) => m.trim())
                          .filter((m) => m),
                      })
                    }
                    placeholder="List your current medications (comma separated)"
                    className="bg-white/50 border-white/40"
                  />
                </div>

                <div>
                  <Label htmlFor="allergies" className="text-cyan-700">
                    Allergies
                  </Label>
                  <Textarea
                    id="allergies"
                    value={userProfile.allergies.join(", ")}
                    onChange={(e) =>
                      setUserProfile({
                        ...userProfile,
                        allergies: e.target.value
                          .split(",")
                          .map((a) => a.trim())
                          .filter((a) => a),
                      })
                    }
                    placeholder="List your allergies (comma separated)"
                    className="bg-white/50 border-white/40"
                  />
                </div>

                <div>
                  <Label htmlFor="emergency" className="text-cyan-700">
                    Emergency Contact
                  </Label>
                  <Input
                    id="emergency"
                    value={userProfile.emergencyContact}
                    onChange={(e) => setUserProfile({ ...userProfile, emergencyContact: e.target.value })}
                    placeholder="Emergency contact information"
                    className="bg-white/50 border-white/40"
                  />
                </div>

                <div>
                  <Label htmlFor="provider" className="text-cyan-700">
                    Healthcare Provider
                  </Label>
                  <Input
                    id="provider"
                    value={userProfile.healthcareProvider}
                    onChange={(e) => setUserProfile({ ...userProfile, healthcareProvider: e.target.value })}
                    placeholder="Your doctor or healthcare provider"
                    className="bg-white/50 border-white/40"
                  />
                </div>

                <Button
                  onClick={() => saveUserProfile(userProfile)}
                  className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Enhanced Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Log Entry View */}
        {currentView === "log-entry" && (
          <div className="space-y-6">
            <Card className="bg-white/30 backdrop-blur-xl border-white/40 shadow-xl shadow-cyan-500/10">
              <CardHeader>
                <CardTitle className="text-cyan-800 flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Enhanced Symptom Log
                </CardTitle>
                <CardDescription className="text-cyan-600">
                  Track your symptoms with comprehensive details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="meal" className="text-cyan-700 font-medium">
                    Meal/Food Consumed
                  </Label>
                  <Input
                    id="meal"
                    value={formData.meal}
                    onChange={(e) => setFormData({ ...formData, meal: e.target.value })}
                    placeholder="What did you eat?"
                    className="bg-white/50 border-white/60 focus:border-cyan-400"
                  />
                </div>

                <div>
                  <Label className="text-cyan-700 font-medium">Pain Level: {formData.painLevel[0]}/10</Label>
                  <Slider
                    value={formData.painLevel}
                    onValueChange={(value) => setFormData({ ...formData, painLevel: value })}
                    max={10}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-cyan-700 font-medium">Stress Level: {formData.stressLevel[0]}/10</Label>
                  <Slider
                    value={formData.stressLevel}
                    onValueChange={(value) => setFormData({ ...formData, stressLevel: value })}
                    max={10}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="remedy" className="text-cyan-700 font-medium">
                    Remedy/Treatment
                  </Label>
                  <Input
                    id="remedy"
                    value={formData.remedy}
                    onChange={(e) => setFormData({ ...formData, remedy: e.target.value })}
                    placeholder="What remedy did you use?"
                    className="bg-white/50 border-white/60 focus:border-cyan-400"
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="text-cyan-700 font-medium">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any additional observations..."
                    className="bg-white/50 border-white/60 focus:border-cyan-400"
                  />
                </div>

                <Button
                  onClick={() => {
                    const newEntry: EnhancedSymptomEntry = {
                      id: Date.now().toString(),
                      timestamp: new Date().toISOString(),
                      timeOfIngestion: formData.timeOfIngestion,
                      meal: formData.meal,
                      painLevel: formData.painLevel[0],
                      stressLevel: formData.stressLevel[0],
                      remedy: formData.remedy,
                      conditionType: formData.conditionType,
                      symptomTypes: formData.symptomTypes,
                      mealSize: formData.mealSize,
                      mealTiming: formData.mealTiming,
                      sleepQuality: formData.sleepQuality[0],
                      exerciseLevel: formData.exerciseLevel[0],
                      weather: formData.weather,
                      notes: formData.notes,
                      isRetroactive: formData.isRetroactive,
                    }

                    const updatedEntries = [...entries, newEntry]
                    setEntries(updatedEntries)
                    localStorage.setItem("gastroguard-enhanced-entries", JSON.stringify(updatedEntries))

                    toast({
                      title: "Entry Saved",
                      description: "Your symptom log has been recorded successfully.",
                    })

                    setCurrentView("dashboard")
                  }}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Entry
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics View */}
        {currentView === "analytics" && (
          <div className="space-y-6">
            <Card className="bg-white/30 backdrop-blur-xl border-white/40 shadow-xl shadow-cyan-500/10">
              <CardHeader>
                <CardTitle className="text-cyan-800 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics Dashboard
                </CardTitle>
                <CardDescription className="text-cyan-600">Insights from your symptom tracking</CardDescription>
              </CardHeader>
              <CardContent>
                {entries.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white/20 rounded-lg">
                        <div className="text-2xl font-bold text-cyan-700">
                          {Math.max(...entries.map((e) => e.painLevel))}
                        </div>
                        <div className="text-sm text-cyan-600">Peak Pain Level</div>
                      </div>
                      <div className="text-center p-4 bg-white/20 rounded-lg">
                        <div className="text-2xl font-bold text-cyan-700">
                          {Math.min(...entries.map((e) => e.painLevel))}
                        </div>
                        <div className="text-sm text-cyan-600">Lowest Pain Level</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-cyan-600 text-center py-8">
                    No data available. Start logging your symptoms to see analytics.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* History View */}
        {currentView === "history" && (
          <div className="space-y-6">
            <Card className="bg-white/30 backdrop-blur-xl border-white/40 shadow-xl shadow-cyan-500/10">
              <CardHeader>
                <CardTitle className="text-cyan-800 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Symptom History
                </CardTitle>
                <CardDescription className="text-cyan-600">Review your past entries</CardDescription>
              </CardHeader>
              <CardContent>
                {entries.length > 0 ? (
                  <div className="space-y-3">
                    {entries.slice(0, 10).map((entry) => (
                      <div key={entry.id} className="p-4 bg-white/20 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-cyan-800">{entry.meal}</p>
                            <p className="text-sm text-cyan-600">
                              Pain: {entry.painLevel}/10 • Stress: {entry.stressLevel}/10
                            </p>
                            <p className="text-xs text-cyan-500">
                              {new Date(entry.timestamp).toLocaleDateString()} at{" "}
                              {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                            {entry.notes && <p className="text-sm text-cyan-600 mt-1">{entry.notes}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-cyan-600 text-center py-8">
                    No entries yet. Start logging your symptoms to build your history.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Smart Recommendations View */}
        {currentView === "recommendations" && (
          <div className="space-y-6">
            <Card className="bg-white/30 backdrop-blur-xl border-white/40 shadow-xl shadow-cyan-500/10">
              <CardHeader>
                <CardTitle className="text-cyan-800 flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Smart Recommendations
                </CardTitle>
                <CardDescription className="text-cyan-600">Personalized suggestions based on your data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-cyan-700 font-medium">Current Pain Level: {currentSymptoms.pain}/10</Label>
                  <Slider
                    value={[currentSymptoms.pain]}
                    onValueChange={(value) => setCurrentSymptoms({ ...currentSymptoms, pain: value[0] })}
                    max={10}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-cyan-700 font-medium">Current Stress Level: {currentSymptoms.stress}/10</Label>
                  <Slider
                    value={[currentSymptoms.stress]}
                    onValueChange={(value) => setCurrentSymptoms({ ...currentSymptoms, stress: value[0] })}
                    max={10}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <Button
                  onClick={() => {
                    console.log("[v0] Getting recommendations")
                    const newRecommendations = [
                      "Try drinking chamomile tea to reduce inflammation",
                      "Consider eating smaller, more frequent meals",
                      "Practice deep breathing exercises to manage stress",
                      "Avoid spicy and acidic foods for the next few hours",
                    ]
                    setRecommendations(newRecommendations)
                  }}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Get Personalized Recommendations
                </Button>

                {recommendations.length > 0 && (
                  <div className="space-y-3">
                    {recommendations.map((rec, index) => (
                      <div key={index} className="p-3 bg-white/20 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Star className="h-4 w-4 text-yellow-500 mt-0.5" />
                          <p className="text-cyan-700 text-sm">{rec}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dashboard View */}
        {currentView === "dashboard" && (
          <div className="space-y-6">
            {/* PWA Install Prompt */}
            {showInstallButton && !isStandalone && (
              <Card className="bg-gradient-to-r from-orange-400/20 to-pink-400/20 backdrop-blur-xl border-orange-200/40 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-orange-400 to-pink-400 rounded-lg">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-orange-800">Install GastroGuard v3.0</h3>
                        <p className="text-sm text-orange-700">Get the enhanced app experience</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleInstallApp}
                      size="sm"
                      className="bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white"
                    >
                      Install
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Welcome Card */}
            <Card className="bg-white/30 backdrop-blur-xl border-white/40 shadow-xl shadow-cyan-500/10">
              <CardHeader>
                <CardTitle className="text-cyan-800 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Welcome to GastroGuard Enhanced v3.0
                </CardTitle>
                <CardDescription className="text-cyan-600">
                  {userProfile.name ? `Hello ${userProfile.name}! ` : ""}
                  Comprehensive management for{" "}
                  {CONDITION_DEFINITIONS[userProfile.primaryCondition as keyof typeof CONDITION_DEFINITIONS]?.name ||
                    "chronic stomach conditions"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/20 rounded-lg">
                    <div className="text-2xl font-bold text-cyan-700">{todayEntries.length}</div>
                    <div className="text-sm text-cyan-600">Today's Entries</div>
                  </div>
                  <div className="text-center p-3 bg-white/20 rounded-lg">
                    <div className="text-2xl font-bold text-cyan-700">{entries.length}</div>
                    <div className="text-sm text-cyan-600">Total Entries</div>
                  </div>
                </div>

                {/* Enhanced Stats */}
                {entries.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white/20 rounded-lg">
                      <div className="text-lg font-bold text-cyan-700">
                        {(entries.reduce((sum, entry) => sum + entry.painLevel, 0) / entries.length).toFixed(1)}
                      </div>
                      <div className="text-sm text-cyan-600">Avg Pain Level</div>
                    </div>
                    <div className="text-center p-3 bg-white/20 rounded-lg">
                      <div className="text-lg font-bold text-cyan-700">
                        {(entries.reduce((sum, entry) => sum + entry.stressLevel, 0) / entries.length).toFixed(1)}
                      </div>
                      <div className="text-sm text-cyan-600">Avg Stress Level</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setCurrentView("log-entry")}
                className="h-20 rounded-xl shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                <div className="text-center text-white">
                  <Plus className="h-6 w-6 mx-auto mb-1 text-white" />
                  <div className="text-sm font-semibold text-white">Enhanced Log</div>
                </div>
              </button>

              <button
                onClick={() => setCurrentView("recommendations")}
                className="h-20 rounded-xl shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer bg-purple-500 hover:bg-purple-600 text-white"
              >
                <div className="text-center text-white">
                  <Brain className="h-6 w-6 mx-auto mb-1 text-white" />
                  <div className="text-sm font-semibold text-white">Smart Recommendations</div>
                </div>
              </button>
            </div>

            {/* Recent Activity */}
            {recentEntries.length > 0 && (
              <Card className="bg-white/30 backdrop-blur-xl border-white/40 shadow-xl shadow-cyan-500/10">
                <CardHeader>
                  <CardTitle className="text-cyan-800 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentEntries.slice(0, 3).map((entry) => (
                      <div key={entry.id} className="p-3 bg-white/20 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-cyan-800">{entry.meal}</p>
                            <p className="text-sm text-cyan-600">
                              Pain: {entry.painLevel}/10 • Stress: {entry.stressLevel}/10
                            </p>
                            <p className="text-xs text-cyan-500">
                              {new Date(entry.timestamp).toLocaleDateString()} at{" "}
                              {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          {entry.painLevel >= 7 && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ... existing code for other views ... */}
      </main>

      {/* Enhanced Glass Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/20 backdrop-blur-xl border-t border-white/20 shadow-2xl shadow-cyan-500/20">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex justify-around">
            {[
              { view: "dashboard", icon: Activity, label: "Dashboard" },
              { view: "log-entry", icon: Plus, label: "Enhanced Log" },
              { view: "analytics", icon: BarChart3, label: "Analytics" },
              { view: "history", icon: FileText, label: "History" },
              { view: "recommendations", icon: Brain, label: "Smart Recommendations" },
            ].map(({ view, icon: Icon, label }) => (
              <button
                key={view}
                onClick={() => setCurrentView(view as ViewType)}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all duration-300 ${
                  currentView === view
                    ? "text-cyan-600 bg-white/30 backdrop-blur-sm shadow-lg scale-105"
                    : "text-cyan-500 hover:text-cyan-600 hover:bg-white/20 hover:scale-105"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}
