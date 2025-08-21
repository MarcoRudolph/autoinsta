// app/dashboard/page.tsx
'use client';
import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AddValueModal from '@/components/ui/AddValueModal';
import EditValueModal from '@/components/ui/EditValueModal';
import { useI18n } from '@/hooks/useI18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Footer from '@/components/Footer';

import isEqual from 'lodash.isequal';

// Define a type for personality with childhoodExperiences having a proper index signature
// Example:
type Personality = {
  name: string;
  description: string;
  systemPrompt?: string;
  childhoodExperiences: { [key: string]: string[] };
  emotionalTriggers: string[];
  characterTraits: string[];
  positiveTraits: {
    socialCommunicative: string[];
    professionalCognitive: string[];
    personalIntrinsic: string[];
  };
  negativeTraits: string[];
  areasOfInterest: string[];
  communicationStyle: {
    tone: string;
    wordChoice: string;
    responsePatterns: string;
    humor: {
      humorEnabled: boolean;
      humorTypes: string[];
      humorIntensity: string;
      humorExclusionTopics: string[];
    };
  };
  delayMin?: number;
  delayMax?: number;
  userId?: string;
};

// New type for the complete persona data structure
type PersonaData = {
  personality: Personality;
  productLinks: string[];
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // All hooks must be called before any return or conditional return
  // Initial state: flat structure
  const [personality, setPersonality] = useState<Personality>({
    name: '',
    description: '',
    systemPrompt: '',
    childhoodExperiences: {
      personalDevelopment: [],
      sexuality: [],
      generalExperiences: [],
      socialEnvironmentFriendships: [],
      educationLearning: [],
      familyRelationships: []
    },
    emotionalTriggers: [],
    characterTraits: [],
    positiveTraits: {
      socialCommunicative: [],
      professionalCognitive: [],
      personalIntrinsic: []
    },
    negativeTraits: [],
    areasOfInterest: [],
    communicationStyle: {
      tone: '',
      wordChoice: '',
      responsePatterns: '',
      humor: {
        humorEnabled: false,
        humorTypes: [],
        humorIntensity: '',
        humorExclusionTopics: []
      }
    },
    delayMin: 5,
    delayMax: 10
  });
  
  // Product links state - now part of persona data
  const [productLinks, setProductLinks] = useState<string[]>([]);
  
  // Locale state for internationalization
  const [currentLocale, setCurrentLocale] = useState('en');
  
  const { t, tCommon } = useI18n(currentLocale);
  
  const [dmSettings, setDmSettings] = useState({
    active: false,
    duration: { from: '09:00', until: '22:00' },
    productLinks: [] as string[],
  });
  const [commentSettings, setCommentSettings] = useState({
    active: false,
    duration: { from: '09:00', until: '22:00' },
    productLinks: [] as string[],
  });
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [personas, setPersonas] = useState<{id: string, name: string, active?: boolean}[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  // AI Template daily limit state
  const [aiTemplateCount, setAiTemplateCount] = useState(0);
  const [lastAiTemplateDate, setLastAiTemplateDate] = useState<string>('');
  
  // Subscription state
  const [isProUser, setIsProUser] = useState(false);
  // Unsaved changes dialog hooks
  const [lastLoadedPersona, setLastLoadedPersona] = useState<typeof personality>(personality);
  const [pendingPersonaId, setPendingPersonaId] = useState<string | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [currentPersonaId, setCurrentPersonaId] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const userDropdownRef = useRef<HTMLDivElement>(null);
  
  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [currentModalConfig, setCurrentModalConfig] = useState<{
    title: string;
    placeholder: string;
    onSave: (value: string) => void;
  } | null>(null);

  // EditValueModal states for product links
  const [editValueModalOpen, setEditValueModalOpen] = useState(false);
  const [editValueModalConfig, setEditValueModalConfig] = useState<{
    title: string;
    currentValue: string;
    placeholder: string;
    onSave: (oldValue: string, newValue: string) => void;
  } | null>(null);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [personaToDelete, setPersonaToDelete] = useState<{id: string, name: string} | null>(null);

  // Helper function to check if a persona is empty (has no meaningful content)
  const isPersonaEmpty = (persona: typeof personality): boolean => {
    return (
      !persona.name.trim() &&
      !persona.description.trim() &&
      Object.values(persona.childhoodExperiences).every(experiences => experiences.length === 0) &&
      persona.emotionalTriggers.length === 0 &&
      persona.characterTraits.length === 0 &&
      Object.values(persona.positiveTraits).every(traits => traits.length === 0) &&
      persona.negativeTraits.length === 0 &&
      persona.areasOfInterest.length === 0 &&
      !persona.communicationStyle.tone.trim() &&
      !persona.communicationStyle.wordChoice.trim() &&
      !persona.communicationStyle.responsePatterns.trim() &&
      !persona.communicationStyle.humor.humorIntensity.trim() &&
      persona.communicationStyle.humor.humorTypes.length === 0 &&
      persona.communicationStyle.humor.humorExclusionTopics.length === 0
    );
  };

  // Helper function to open add modal
  const openAddModal = (title: string, placeholder: string, onSave: (value: string) => void) => {
    setCurrentModalConfig({ title, placeholder, onSave });
    setAddModalOpen(true);
  };

  // Helper function to open edit value modal for product links
  const openEditValueModal = (title: string, placeholder: string, onSave: (oldValue: string, newValue: string) => void) => {
    setEditValueModalConfig({ title, currentValue: '', placeholder, onSave });
    setEditValueModalOpen(true);
  };





  // Check user subscription status
  const checkUserSubscription = useCallback(async () => {
    try {
      const res = await fetch('/api/subscription');
      if (res.ok) {
        const data = await res.json();
        console.log('Subscription data:', data);
        setIsProUser(data.isPro || false);
      } else {
        console.error('Failed to fetch subscription data:', res.status);
        setIsProUser(false);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsProUser(false);
    }
  }, []);

  const handleActivatePersona = async (id: string) => {
    console.log('handleActivatePersona called with id:', id);
    
    try {
      // Get userId from session
      const { createClient } = await import('@/lib/auth/supabaseClient.client');
      const supabase = createClient();
      
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session?.user?.id) {
        alert(t('dashboard.noUserLoggedIn'));
        return;
      }
      const userId = data.session.user.id;
      console.log('User ID:', userId);
      
      console.log('Sending request to set active persona...');
      const res = await fetch('/api/set-active-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId: id, userId }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const result = await res.json();
      console.log('Set active persona result:', result);
      
      console.log('Fetching updated personas...');
      await fetchPersonas();
      console.log('Personas updated');
      
    } catch (err) {
      console.error('Error setting active persona:', err);
      alert('Fehler beim Aktivieren der Persona.');
    }
  };

  // Fetch personas from API
  const fetchPersonas = useCallback(async () => {
    try {
      console.log('Fetching personas...');
      const res = await fetch('/api/list-personas');
      if (res.ok) {
        const data = await res.json();
        console.log('Raw personas data:', data);
        console.log('Raw personas data.personas:', data.personas);
        console.log('Raw personas data.personas details:', JSON.stringify(data.personas, null, 2));
        
        // Filter out any null or invalid personas
        const validPersonas = (data.personas || []).filter((persona: {id: string, name: string, active?: boolean}) => 
          persona && persona.id && persona.name && persona.id !== null && persona.name !== null
        );
        console.log('Valid personas:', validPersonas);
        console.log('Valid personas names:', validPersonas.map((p: {id: string, name: string, active?: boolean}) => ({ id: p.id, name: p.name })));
        console.log('Valid personas full details:', JSON.stringify(validPersonas, null, 2));
        setPersonas(validPersonas);
        
        // Only clear selected persona if we have no personas
        if (validPersonas.length === 0) {
          setSelectedPersonaId('');
          setCurrentPersonaId(null);
        }
      } else {
        console.error('Failed to fetch personas:', res.status, res.statusText);
        setPersonas([]);
        setSelectedPersonaId('');
        setCurrentPersonaId(null);
      }
    } catch (error) {
      console.error('Error fetching personas:', error);
      setPersonas([]);
      setSelectedPersonaId('');
      setCurrentPersonaId(null);
    }
  }, []);

  // Fetch personas on mount
  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  // Check subscription status on component mount
  useEffect(() => {
    checkUserSubscription();
  }, [checkUserSubscription]);

  // Check if user can generate AI template
  const canGenerateAITemplate = useCallback(() => {
    const today = new Date().toDateString();
    const dailyLimit = isProUser ? 10 : 2; // Pro users get 10, free users get 2
    return lastAiTemplateDate === today && aiTemplateCount < dailyLimit;
  }, [lastAiTemplateDate, aiTemplateCount, isProUser]);

  const handleGetAITemplate = useCallback(async () => {
    // Check daily limit first
    if (!canGenerateAITemplate()) {
      alert(t('dashboard.aiTemplateLimit'));
      return;
    }

    setLoadingAI(true);
    console.log('Sending request to /api/generate-persona...');
    try {
      const res = await fetch('/api/generate-persona', { method: 'POST' });
      console.log('Received response from /api/generate-persona:', res);
      if (!res.ok) throw new Error('Failed to generate persona');
      const data = await res.json();
      console.log('Parsed JSON from /api/generate-persona:', data);
      if (data && data.persona) {
        console.log('Mapping AI persona to dashboard structure...');
        
        // AI API now returns the exact same structure that gets saved
        const aiPersona = data.persona;
        console.log('AI Persona structure:', aiPersona);
        
        // The AI response is already in the correct Personality format
        // Just ensure all required fields are present with defaults
        const mappedPersonality = {
          name: aiPersona?.name || '',
          description: aiPersona?.description || '',
          systemPrompt: aiPersona?.systemPrompt || '',
          childhoodExperiences: aiPersona?.childhoodExperiences || {
            personalDevelopment: [],
            sexuality: [],
            generalExperiences: [],
            socialEnvironmentFriendships: [],
            educationLearning: [],
            familyRelationships: []
          },
          emotionalTriggers: aiPersona?.emotionalTriggers || [],
          characterTraits: aiPersona?.characterTraits || [],
          positiveTraits: aiPersona?.positiveTraits || {
            socialCommunicative: [],
            professionalCognitive: [],
            personalIntrinsic: []
          },
          negativeTraits: aiPersona?.negativeTraits || [],
          areasOfInterest: aiPersona?.areasOfInterest || [],
          communicationStyle: {
            tone: aiPersona?.communicationStyle?.tone || '',
            wordChoice: aiPersona?.communicationStyle?.wordChoice || '',
            responsePatterns: aiPersona?.communicationStyle?.responsePatterns || '',
            humor: aiPersona?.communicationStyle?.humor || {
              humorEnabled: false,
              humorTypes: [],
              humorIntensity: '',
              humorExclusionTopics: []
            }
          },
          delayMin: aiPersona?.delayMin || 5,
          delayMax: aiPersona?.delayMax || 10
        };
        
        console.log('Mapped personality:', mappedPersonality);
        console.log('Character Traits from AI:', mappedPersonality.characterTraits);
        console.log('Areas of Interest from AI:', mappedPersonality.areasOfInterest);
        console.log('Communication Style from AI:', mappedPersonality.communicationStyle);
        console.log('Humor from AI:', aiPersona?.communicationStyle?.humor);
        console.log('Mapped Humor:', mappedPersonality.communicationStyle.humor);
        console.log('Childhood Experiences from AI:', aiPersona?.childhoodExperiences);
        console.log('Mapped Childhood Experiences:', mappedPersonality.childhoodExperiences);
        console.log('Emotional Triggers from AI:', aiPersona?.emotionalTriggers);
        console.log('Mapped Emotional Triggers:', mappedPersonality.emotionalTriggers);
        
        setPersonality(mappedPersonality);
        console.log('Persona state updated with AI template.');
        
        // Update daily limit counter
        const today = new Date().toDateString();
        const newCount = aiTemplateCount + 1;
        setAiTemplateCount(newCount);
        localStorage.setItem('aiTemplateLimit', JSON.stringify({ count: newCount, date: today }));
      } else {
        console.log('No persona found in response:', data);
      }
    } catch (err) {
      console.error('Fehler beim Generieren der KI-Persona:', err);
      alert('Fehler beim Generieren der KI-Persona.');
    } finally {
      setLoadingAI(false);
    }
  }, [aiTemplateCount, canGenerateAITemplate, t]);

  const handleFillWithTemplate = useCallback(async () => {
    try {
      const res = await fetch('/template.json');
      if (!res.ok) throw new Error('Failed to load template.json');
      const data = await res.json();
      // Accept both {personality: {...}} and flat persona
      if (data.personality) {
        setPersonality({
          name: data.personality?.name || '',
          description: data.personality?.description || '',
          systemPrompt: data.personality?.systemPrompt || '',
          childhoodExperiences: data.personality?.childhoodExperiences || {
            personalDevelopment: [],
            sexuality: [],
            generalExperiences: [],
            socialEnvironmentFriendships: [],
            educationLearning: [],
            familyRelationships: []
          },
          emotionalTriggers: data.personality?.emotionalTriggers || [],
          characterTraits: data.personality?.characterTraits || [],
          positiveTraits: data.personality?.positiveTraits || {
            socialCommunicative: [],
            professionalCognitive: [],
            personalIntrinsic: []
          },
          negativeTraits: data.personality?.negativeTraits || [],
          areasOfInterest: data.personality?.areasOfInterest || [],
          communicationStyle: {
            tone: data.personality?.communicationStyle?.tone || '',
            wordChoice: data.personality?.communicationStyle?.wordChoice || '',
            responsePatterns: data.personality?.communicationStyle?.responsePatterns || '',
            humor: {
              humorEnabled: data.personality?.communicationStyle?.humor?.humorEnabled || false,
              humorTypes: data.personality?.communicationStyle?.humor?.humorTypes || [],
              humorIntensity: data.personality?.communicationStyle?.humor?.humorIntensity || '',
              humorExclusionTopics: data.personality?.communicationStyle?.humor?.humorExclusionTopics || []
            }
          },
          delayMin: data.personality?.delayMin || 5,
          delayMax: data.personality?.delayMax || 10
        });
      } else {
        setPersonality({
          name: data?.name || '',
          description: data?.description || '',
          systemPrompt: data?.systemPrompt || '',
          childhoodExperiences: data?.childhoodExperiences || {
            personalDevelopment: [],
            sexuality: [],
            generalExperiences: [],
            socialEnvironmentFriendships: [],
            educationLearning: [],
            familyRelationships: []
          },
          emotionalTriggers: data?.emotionalTriggers || [],
          characterTraits: data?.characterTraits || [],
          positiveTraits: data?.positiveTraits || {
            socialCommunicative: [],
            professionalCognitive: [],
            personalIntrinsic: []
          },
          negativeTraits: data?.negativeTraits || [],
          areasOfInterest: data?.areasOfInterest || [],
          communicationStyle: {
            tone: data?.communicationStyle?.tone || '',
            wordChoice: data?.communicationStyle?.wordChoice || '',
            responsePatterns: data?.communicationStyle?.responsePatterns || '',
            humor: {
              humorEnabled: data?.communicationStyle?.humor?.humorEnabled || false,
              humorTypes: data?.communicationStyle?.humor?.humorTypes || [],
              humorIntensity: data?.communicationStyle?.humor?.humorIntensity || '',
              humorExclusionTopics: data?.communicationStyle?.humor?.humorExclusionTopics || []
            }
          },
          delayMin: data?.delayMin || 5,
          delayMax: data?.delayMax || 10
        });
      }
      console.log('Persona state filled from template.json');
    } catch (err) {
      alert('Fehler beim Laden der Vorlage.');
      console.error(err);
    }
  }, []);

  const handleInstagramLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/instagram/callback` : 'https://www.rudolpho-chat.de/api/instagram/callback';
    
    if (!clientId) {
      console.error('Instagram client ID not configured');
      alert('Instagram integration not configured');
      return;
    }
    
    window.location.href =
      `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights`;
  };



  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }

    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen]);

  // Get user email on component mount
  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const { createClient } = await import('@/lib/auth/supabaseClient.client');
        const supabase = createClient();
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setUserEmail(user.email);
        }
      } catch (error) {
        console.error('Error getting user email:', error);
      }
    };
    getUserEmail();
  }, []);

  // Check and initialize AI template daily limit
  useEffect(() => {
    const checkDailyLimit = () => {
      const today = new Date().toDateString();
      const stored = localStorage.getItem('aiTemplateLimit');
      
      if (stored) {
        const { count, date } = JSON.parse(stored);
        if (date === today) {
          setAiTemplateCount(count);
          setLastAiTemplateDate(date);
        } else {
          // Reset for new day
          setAiTemplateCount(0);
          setLastAiTemplateDate(today);
          localStorage.setItem('aiTemplateLimit', JSON.stringify({ count: 0, date: today }));
        }
      } else {
        // First time user
        setAiTemplateCount(0);
        setLastAiTemplateDate(today);
        localStorage.setItem('aiTemplateLimit', JSON.stringify({ count: 0, date: today }));
      }
    };

    checkDailyLimit();
  }, []);

  // Get remaining attempts for today
  const getRemainingAttempts = () => {
    const today = new Date().toDateString();
    const dailyLimit = isProUser ? 10 : 2;
    if (lastAiTemplateDate !== today) return dailyLimit;
    return Math.max(0, dailyLimit - aiTemplateCount);
  };

  useEffect(() => {
    const param = searchParams.get('instagramConnected');
    if (param === 'true') {
      setInstagramConnected(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('instagramConnected', 'true');
        const url = new URL(window.location.href);
        url.searchParams.delete('instagramConnected');
        window.history.replaceState({}, '', url.toString());
      }
    } else if (param === 'false') {
      setInstagramConnected(false);
    } else if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('instagramConnected');
      if (stored === 'true') setInstagramConnected(true);
    }
  }, [searchParams]);

  const handleSavePersona = useCallback(async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      let userId: string = personality.userId ?? '';
      if (!userId) {
        // Get userId from Supabase session
        const { createClient } = await import('@/lib/auth/supabaseClient.client');
        const supabase = createClient();
        
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session?.user?.id) {
          alert(t('dashboard.noUserLoggedIn'));
          setSaving(false);
          return;
        }
        userId = data.session.user.id as string;
        console.log('Fetched userId from session:', userId);
      }
      
      // Create the persona data structure
      const personaData: PersonaData = {
        personality: { ...personality, userId },
        productLinks: productLinks
      };
      console.log('Saving persona data:', JSON.stringify(personaData, null, 2));
      console.log('Personality name being saved:', personality.name);
      console.log('Full personality object being saved:', JSON.stringify(personality, null, 2));
      
      if (currentPersonaId) {
        // Edit existing persona
        console.log('Editing persona:', currentPersonaId, personaData);
        const res = await fetch('/api/edit-persona', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ personaId: currentPersonaId, userId, data: personaData }),
        });
        const responseJson = await res.json();
        console.log('Edit persona response:', responseJson);
        if (!res.ok) throw new Error('Failed to edit persona');
        setSaveMessage(String(t('dashboard.personaUpdated') || 'AI-Chatbot updated!'));
      } else {
        // Create new persona
        const personaData: PersonaData = {
          personality: { ...personality, userId },
          productLinks: productLinks
        };
        console.log('Saving persona:', personaData);
        console.log('Name in personaData.personality.name:', personaData.personality.name);
        const res = await fetch('/api/save-persona', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, data: personaData }),
        });
        const responseJson = await res.json();
        console.log('Save persona response:', responseJson);
        if (!res.ok) throw new Error('Failed to save persona');
        setSaveMessage(String(t('dashboard.personaSaved') || 'AI-Chatbot saved!'));
      }
      
      // Store current selection before fetching personas
      const currentSelection = selectedPersonaId;
      await fetchPersonas();
      
      // Restore the selection after fetching
      if (currentSelection) {
        setSelectedPersonaId(currentSelection);
      }
    } catch (err) {
      console.error('Error saving persona:', err);
      alert('dashboard.saveError');
      // Do not set a green message on error
    } finally {
      setSaving(false);
    }
  }, [personality, productLinks, fetchPersonas, currentPersonaId, t, selectedPersonaId]);

  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      try {
        const { createClient } = await import('@/lib/auth/supabaseClient.client');
        const supabase = createClient();
        
        const { data } = await supabase.auth.getSession();
        if (!data.session && mounted) {
          router.replace('/');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    };
    
    checkSession();
    return () => { mounted = false; };
  }, [router]);

  if (checkingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  // Make sure to install lodash.isequal: npm install lodash.isequal
  const handlePersonaDropdownChange = async (id: string) => {
    // Add null check for the selected ID
    if (!id || id === 'null' || id === 'undefined') {
      console.warn('Invalid persona ID selected:', id);
      alert(t('dashboard.invalidPersona'));
      return;
    }
    
    setSelectedPersonaId(String(id));
    setCurrentPersonaId(String(id));
    // Only show unsaved changes dialog if current persona has meaningful content
    if (!isEqual(personality, lastLoadedPersona) && !isPersonaEmpty(personality)) {
      setPendingPersonaId(id);
      setShowUnsavedDialog(true);
    } else {
      await loadPersonaById(id);
    }
  };

  const loadPersonaById = async (id: string) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/get-persona?id=${id}`);
      if (res.ok) {
        const data: { persona?: PersonaData } = await res.json();
        if (data && data.persona && data.persona !== null) {
          console.log('Loading persona:', data.persona);
          
          // Handle both old and new persona structures for backward compatibility
          if (data.persona.personality) {
            // New structure with personality and productLinks
            setPersonality(data.persona.personality);
            setProductLinks(data.persona.productLinks || []);
            setLastLoadedPersona(data.persona.personality);
          } else {
            // Old structure - treat the entire persona as personality data
            setPersonality(data.persona as unknown as Personality);
            setProductLinks([]);
            setLastLoadedPersona(data.persona as unknown as Personality);
          }
          
          setSelectedPersonaId(String(id));
          setCurrentPersonaId(String(id));
        } else {
          console.warn('No valid persona data received:', data);
          alert(t('dashboard.noValidPersonaData'));
        }
      } else {
        console.error('Failed to fetch persona:', res.status, res.statusText);
        alert(t('dashboard.errorLoadingPersona'));
      }
    } catch (error) {
      console.error('Error loading persona:', error);
      alert(t('dashboard.errorLoadingPersona'));
    }
  };

  const handleDeletePersona = () => {
    console.log('Delete button clicked!');
    console.log('selectedPersonaId:', selectedPersonaId, 'type:', typeof selectedPersonaId);
    console.log('personas:', personas);
    console.log('Persona IDs:', personas.map(p => ({ id: p.id, type: typeof p.id, name: p.name })));
    console.log('Full personas array:', JSON.stringify(personas, null, 2));
    
    if (!selectedPersonaId) {
      console.log('No selectedPersonaId, returning');
      return;
    }
    
    const persona = personas.find(p => {
      const match1 = p.id === selectedPersonaId;
      const match2 = p.id === String(selectedPersonaId);
      const match3 = String(p.id) === selectedPersonaId;
      console.log(`Comparing persona ${p.id} (${typeof p.id}) with selectedPersonaId ${selectedPersonaId} (${typeof selectedPersonaId}): match1=${match1}, match2=${match2}, match3=${match3}`);
      return match1 || match2 || match3;
    });
    console.log('Found persona:', persona);
    
    if (!persona) {
      console.log('No persona found, returning');
      return;
    }
    
    console.log('Setting persona to delete:', { id: selectedPersonaId, name: persona.name });
    console.log('Opening delete dialog');
    
    // Set the persona to delete and open the confirmation dialog
    setPersonaToDelete({ id: selectedPersonaId, name: persona.name });
    setDeleteDialogOpen(true);
  };

  const confirmDeletePersona = async () => {
    console.log('confirmDeletePersona called');
    console.log('personaToDelete:', personaToDelete);
    
    if (!personaToDelete) {
      console.log('No personaToDelete, returning');
      return;
    }
    
    try {
      console.log('Making delete API call to /api/delete-persona');
      console.log('Request body:', { id: personaToDelete.id });
      
      const res = await fetch(`/api/delete-persona`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: personaToDelete.id }),
      });
      
      console.log('Delete API response status:', res.status);
      console.log('Delete API response ok:', res.ok);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Delete API error response:', errorText);
        throw new Error(`Failed to delete persona: ${res.status} ${errorText}`);
      }
      
      // Refresh the personas list
      await fetchPersonas();
      
      // If the deleted persona was the current one, reset the form
      if (personaToDelete.id === currentPersonaId) {
        setPersonality({
          name: '',
          description: '',
          systemPrompt: '',
          childhoodExperiences: {
            personalDevelopment: [],
            sexuality: [],
            generalExperiences: [],
            socialEnvironmentFriendships: [],
            educationLearning: [],
            familyRelationships: []
          },
          emotionalTriggers: [],
          characterTraits: [],
          positiveTraits: {
            socialCommunicative: [],
            professionalCognitive: [],
            personalIntrinsic: [],
          },
          negativeTraits: [],
          areasOfInterest: [],
          communicationStyle: {
            tone: '',
            wordChoice: '',
            responsePatterns: '',
            humor: {
              humorEnabled: false,
              humorTypes: [],
              humorIntensity: '',
              humorExclusionTopics: [],
            },
          },
          delayMin: 5,
          delayMax: 10
        });
        setProductLinks([]);
        setCurrentPersonaId(null);
        setSelectedPersonaId('');
      }
      
      // Close the dialog and reset the persona to delete
      setDeleteDialogOpen(false);
      setPersonaToDelete(null);
      
    } catch (error) {
      console.error('Delete error:', error);
      alert(t('dashboard.deleteError'));
      setDeleteDialogOpen(false);
      setPersonaToDelete(null);
    }
  };

  // User dropdown functions
  const handleUserDropdownToggle = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      // Clear localStorage
      localStorage.clear();
      
      // Sign out from Supabase
      const { createClient } = await import('@/lib/auth/supabaseClient.client');
      const supabase = createClient();
      
      await supabase.auth.signOut();
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if there's an error
      router.push('/');
    }
  };

  const handleSettings = () => {
    router.push('/settings');
    setUserDropdownOpen(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: 'linear-gradient(135deg, #1b1f2b, #2b2e47, #313c5c)' }}>
      <div className="flex flex-col items-center text-white rounded-2xl shadow-lg py-6 px-10 mb-8 relative" style={{ background: 'linear-gradient(135deg, #1b1f2b, #2a2f4d, #3f4d70, #654a74)' }}>
        {/* User Dropdown */}
        <div className="absolute top-6 right-8" ref={userDropdownRef}>
          <button
            onClick={handleUserDropdownToggle}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0v.25a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75v-.25z" />
            </svg>
          </button>
          
          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">{userEmail}</p>
                <p className="text-xs text-gray-500">{String(t('dashboard.userType') || 'rudolpho-chat User')}</p>
              </div>
              
              {/* Menu Items */}
              <div className="py-1">
                {/* Language Switcher */}
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="text-xs text-gray-500 mb-2">Language / Sprache</div>
                  <LanguageSwitcher onLocaleChange={setCurrentLocale} />
                </div>
                
                <button
                  onClick={handleSettings}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.57 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <div className="font-medium">{t('dashboard.settings')}</div>
                    <div className="text-xs text-gray-500">Einstellungen</div>
                  </div>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  <div>
                    <div className="font-medium">{t('dashboard.logout')}</div>
                    <div className="text-xs text-gray-500">Abmelden</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
        <h1 className="text-4xl font-extrabold tracking-wide">{String(t('dashboard.title') || 'Dashboard')}</h1>
        <p className="text-sm mt-2 opacity-80">{String(t('dashboard.automateInstagram') || 'Automate your Instagram interactions')}</p>
        <button
          onClick={handleInstagramLogin}
          className={`mt-4 border font-semibold py-2 px-4 rounded-lg transition shadow-none ${instagramConnected ? 'bg-green-600 border-green-600 text-white' : 'bg-transparent text-white border-white hover:bg-white hover:text-indigo-700'}`}
        >
          {instagramConnected ? t('dashboard.instagramConnected') : t('dashboard.connectInstagram')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Craft Persona Section */}
        <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl md:text-4xl bg-gradient-to-r from-[#f3aacb] via-[#a3bffa] to-[#e6ebfc] bg-clip-text text-transparent drop-shadow-lg tracking-tight" style={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: '800',
              letterSpacing: '-0.04em',
              lineHeight: '1.2em',
              color: '#ffffff'
            }}>
              {t('dashboard.craftPersona')}
            </h2>
            {/* Show New Persona button only when an existing persona is displayed */}
            {currentPersonaId && (
              <button
                onClick={() => {
                  setPersonality({
                    name: '',
                    description: '',
                    systemPrompt: '',
                    childhoodExperiences: {
                      personalDevelopment: [],
                      sexuality: [],
                      generalExperiences: [],
                      socialEnvironmentFriendships: [],
                      educationLearning: [],
                      familyRelationships: []
                    },
                    emotionalTriggers: [],
                    characterTraits: [],
                    positiveTraits: {
                      socialCommunicative: [],
                      professionalCognitive: [],
                      personalIntrinsic: []
                    },
                    negativeTraits: [],
                    areasOfInterest: [],
                    communicationStyle: {
                      tone: '',
                      wordChoice: '',
                      responsePatterns: '',
                      humor: {
                        humorEnabled: false,
                        humorTypes: [],
                        humorIntensity: '',
                        humorExclusionTopics: []
                      }
                    },
                    delayMin: 5,
                    delayMax: 10
                  });
                  setCurrentPersonaId(null);
                  setSelectedPersonaId('');
                  setProductLinks([]);
                }}
                className="border border-white text-white font-semibold py-2 px-4 rounded-lg hover:bg-white hover:text-indigo-700 transition shadow-none bg-transparent"
              >
                {t('dashboard.newPersona')}
              </button>
            )}
          </div>
          
          {/* Scrollable form container */}
          <div className="max-h-[70vh] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4a5568 #2d3748' }}>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder={t('dashboard.personality.placeholder.name')}
                  className="w-full p-2 border rounded mb-2 text-blue-900 bg-blue-50"
                  value={personality.name || ''}
                  onChange={e => setPersonality(prev => ({ ...prev, name: e.target.value }))}
                />
                <textarea
                  placeholder={t('dashboard.personality.placeholder.description')}
                  className="w-full p-2 border rounded h-20 text-blue-900 bg-blue-50"
                  value={personality.description || ''}
                  onChange={e => setPersonality(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Childhood Experiences */}
              {Object.keys(personality.childhoodExperiences || {}).map((section: string) => {
                
                const addItem = (newItem: string) => {
                  if (newItem && newItem.trim()) {
                    setPersonality(prev => ({
                      ...prev,
                      childhoodExperiences: {
                        ...prev.childhoodExperiences,
                        [section]: [...(prev.childhoodExperiences[section as keyof typeof prev.childhoodExperiences] || []), newItem.trim()]
                      }
                    }));
                  }
                };

                const removeItem = (index: number) => {
                  setPersonality(prev => ({
                    ...prev,
                    childhoodExperiences: {
                      ...prev.childhoodExperiences,
                      [section]: (prev.childhoodExperiences[section as keyof typeof prev.childhoodExperiences] || []).filter((_, idx) => idx !== index)
                    }
                  }));
                };

                return (
                  <div key={section} className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium capitalize">
                        {t(`dashboard.personality.${section}`)}
                      </h3>
                      <button
                        onClick={() => {
                          const sectionTitle = t(`dashboard.personality.${section}`);
                          openAddModal(
                            sectionTitle,
                            t('dashboard.personality.addNew'),
                            addItem
                          );
                        }}
                        className="text-blue-500 hover:text-blue-700 text-lg font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-blue-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    
                    <ul className="mt-2 space-y-2">
                      {(personality.childhoodExperiences[section as keyof typeof personality.childhoodExperiences] || []).map((item, idx) => (
                        <li key={idx} className="bg-blue-100 text-blue-900 px-4 py-2 rounded shadow-sm flex items-center justify-between">
                          <span>{item}</span>
                          <button
                            onClick={() => removeItem(idx)}
                            className="text-red-500 hover:text-red-700 text-sm ml-2"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

              {/* Character Traits */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">Character Traits</h3>
                  <button
                    onClick={() => {
                      openAddModal(
                        'Character Traits',
                        'Neuen Charakterzug hinzufügen',
                        (newTrait: string) => {
                          if (newTrait && newTrait.trim()) {
                            setPersonality(prev => ({
                              ...prev,
                              characterTraits: [...prev.characterTraits, newTrait.trim()]
                            }));
                          }
                        }
                      );
                    }}
                    className="text-blue-500 hover:text-blue-700 text-lg font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-blue-100 transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(personality.characterTraits || []).map((trait: string, index: number) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-blue-900 px-3 py-1 rounded-full flex items-center"
                    >
                      {trait}
                      <button
                        className="ml-2 text-red-500 text-sm"
                        onClick={() => {
                          setPersonality(prev => ({
                            ...prev,
                            characterTraits: prev.characterTraits.filter((_, idx) => idx !== index)
                          }));
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Positive Traits */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Positive Traits</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-500">Personal & Intrinsic</h4>
                      <button
                        onClick={() => {
                          openAddModal(
                            'Personal & Intrinsic',
                            'Neuen persönlichen & intrinsischen Zug hinzufügen',
                            (newTrait: string) => {
                              if (newTrait && newTrait.trim()) {
                                setPersonality(prev => ({
                                  ...prev,
                                  positiveTraits: {
                                    ...prev.positiveTraits,
                                    personalIntrinsic: [...prev.positiveTraits.personalIntrinsic, newTrait.trim()]
                                  }
                                }));
                              }
                            }
                          );
                        }}
                        className="text-green-500 hover:text-green-700 text-sm font-bold w-5 h-5 flex items-center justify-center rounded-full hover:bg-green-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(personality.positiveTraits?.personalIntrinsic || []).map((trait: string, index: number) => (
                        <span key={index} className="bg-green-100 text-green-900 px-3 py-1 rounded-full text-sm flex items-center">
                          {trait}
                          <button
                            onClick={() => {
                              setPersonality(prev => ({
                                ...prev,
                                positiveTraits: {
                                  ...prev.positiveTraits,
                                  personalIntrinsic: prev.positiveTraits.personalIntrinsic.filter((_, idx) => idx !== index)
                                }
                              }));
                            }}
                            className="ml-2 text-red-500 hover:text-red-700 text-xs"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-500">Social & Communicative</h4>
                      <button
                        onClick={() => {
                          openAddModal(
                            'Social & Communicative',
                            'Neuen sozialen & kommunikativen Zug hinzufügen',
                            (newTrait: string) => {
                              if (newTrait && newTrait.trim()) {
                                setPersonality(prev => ({
                                  ...prev,
                                  positiveTraits: {
                                    ...prev.positiveTraits,
                                    socialCommunicative: [...prev.positiveTraits.socialCommunicative, newTrait.trim()]
                                  }
                                }));
                              }
                            }
                          );
                        }}
                        className="text-blue-500 hover:text-blue-700 text-sm font-bold w-5 h-5 flex items-center justify-center rounded-full hover:bg-blue-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(personality.positiveTraits?.socialCommunicative || []).map((trait: string, index: number) => (
                        <span key={index} className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm flex items-center">
                          {trait}
                          <button
                            onClick={() => {
                              setPersonality(prev => ({
                                ...prev,
                                positiveTraits: {
                                  ...prev.positiveTraits,
                                  socialCommunicative: prev.positiveTraits.socialCommunicative.filter((_, idx) => idx !== index)
                                }
                              }));
                            }}
                            className="ml-2 text-red-500 hover:text-red-700 text-xs"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-500">{t('dashboard.personality.professionalCognitive')}</h4>
                      <button
                        onClick={() => {
                          openAddModal(
                            t('dashboard.personality.professionalCognitive'),
                            t('dashboard.personality.addNewTrait'),
                            (newTrait: string) => {
                              if (newTrait && newTrait.trim()) {
                                setPersonality(prev => ({
                                  ...prev,
                                  positiveTraits: {
                                    ...prev.positiveTraits,
                                    professionalCognitive: [...prev.positiveTraits.professionalCognitive, newTrait.trim()]
                                  }
                                }));
                              }
                            }
                          );
                        }}
                        className="text-purple-500 hover:text-purple-700 text-sm font-bold w-5 h-5 flex items-center justify-center rounded-full hover:bg-purple-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(personality.positiveTraits?.professionalCognitive || []).map((trait: string, index: number) => (
                        <span key={index} className="bg-purple-100 text-purple-900 px-3 py-1 rounded-full text-sm flex items-center">
                          {trait}
                          <button
                            onClick={() => {
                              setPersonality(prev => ({
                                ...prev,
                                positiveTraits: {
                                  ...prev.positiveTraits,
                                  professionalCognitive: prev.positiveTraits.professionalCognitive.filter((_, idx) => idx !== index)
                                }
                              }));
                            }}
                            className="ml-2 text-red-500 hover:text-red-700 text-xs"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Negative Traits */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">{t('dashboard.personality.negativeTraits')}</h3>
                  <button
                    onClick={() => {
                      const newTrait = prompt(t('dashboard.personality.addNewTrait'));
                      if (newTrait && newTrait.trim()) {
                        setPersonality(prev => ({
                          ...prev,
                          negativeTraits: [...prev.negativeTraits, newTrait.trim()]
                        }));
                      }
                    }}
                    className="text-red-500 hover:text-red-700 text-lg font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-100 transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(personality.negativeTraits || []).map((trait: string, index: number) => (
                    <span key={index} className="bg-red-100 text-red-900 px-3 py-1 rounded-full text-sm flex items-center">
                      {trait}
                      <button
                        onClick={() => {
                          setPersonality(prev => ({
                            ...prev,
                            negativeTraits: prev.negativeTraits.filter((_, idx) => idx !== index)
                          }));
                        }}
                        className="ml-2 text-red-500 hover:text-red-700 text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Areas of Interest */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">{t('dashboard.personality.areasOfInterest')}</h3>
                  <button
                    onClick={() => {
                      const newInterest = prompt(t('dashboard.personality.addNewInterest'));
                      if (newInterest && newInterest.trim()) {
                        setPersonality(prev => ({
                          ...prev,
                          areasOfInterest: [...prev.areasOfInterest, newInterest.trim()]
                        }));
                      }
                    }}
                    className="text-yellow-500 hover:text-yellow-700 text-lg font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-yellow-100 transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(personality.areasOfInterest || []).map((interest: string, index: number) => (
                    <span key={index} className="bg-yellow-100 text-yellow-900 px-3 py-1 rounded-full text-sm flex items-center">
                      {interest}
                      <button
                        onClick={() => {
                          setPersonality(prev => ({
                            ...prev,
                            areasOfInterest: prev.areasOfInterest.filter((_, idx) => idx !== index)
                          }));
                        }}
                        className="ml-2 text-red-500 hover:text-red-700 text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Emotional Triggers */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">{t('dashboard.personality.emotionalTriggers')}</h3>
                  <button
                    onClick={() => {
                      const newTrigger = prompt(t('dashboard.personality.addNewTrigger'));
                      if (newTrigger && newTrigger.trim()) {
                        setPersonality(prev => ({
                          ...prev,
                          emotionalTriggers: [...prev.emotionalTriggers, newTrigger.trim()]
                        }));
                      }
                    }}
                    className="text-orange-500 hover:text-orange-700 text-lg font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-orange-100 transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(personality.emotionalTriggers || []).map((trigger: string, index: number) => (
                    <span key={index} className="bg-orange-100 text-orange-900 px-3 py-1 rounded-full text-sm flex items-center">
                      {trigger}
                      <button
                        onClick={() => {
                          setPersonality(prev => ({
                            ...prev,
                            emotionalTriggers: prev.emotionalTriggers.filter((_, idx) => idx !== index)
                          }));
                        }}
                        className="ml-2 text-red-500 hover:text-red-700 text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Communication Style */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Communication Style</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Tone</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded text-blue-900 bg-blue-50"
                      value={personality.communicationStyle?.tone || ''}
                      onChange={e => setPersonality(prev => ({ 
                        ...prev, 
                        communicationStyle: { ...prev.communicationStyle, tone: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Word Choice</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded text-blue-900 bg-blue-50"
                      value={personality.communicationStyle?.wordChoice || ''}
                      onChange={e => setPersonality(prev => ({ 
                        ...prev, 
                        communicationStyle: { ...prev.communicationStyle, wordChoice: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Response Patterns</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded text-blue-900 bg-blue-50"
                      value={personality.communicationStyle?.responsePatterns || ''}
                      onChange={e => setPersonality(prev => ({ 
                        ...prev, 
                        communicationStyle: { ...prev.communicationStyle, responsePatterns: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Humor</label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={personality.communicationStyle?.humor?.humorEnabled || false}
                          onChange={e => setPersonality(prev => ({ 
                            ...prev, 
                            communicationStyle: { 
                              ...prev.communicationStyle, 
                              humor: { ...prev.communicationStyle.humor, humorEnabled: e.target.checked }
                            }
                          }))}
                          className="accent-blue-500"
                        />
                        <span className="text-sm">Humor Enabled</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <label className="block text-xs text-gray-500">Humor Types</label>
                          <button
                            onClick={() => {
                              const newType = prompt(t('dashboard.personality.addNewHumorType'));
                              if (newType && newType.trim()) {
                                setPersonality(prev => ({
                                  ...prev,
                                  communicationStyle: {
                                    ...prev.communicationStyle,
                                    humor: {
                                      ...prev.communicationStyle.humor,
                                      humorTypes: [...prev.communicationStyle.humor.humorTypes, newType.trim()]
                                    }
                                  }
                                }));
                              }
                            }}
                            className="text-pink-500 hover:text-pink-700 text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full hover:bg-pink-100 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(personality.communicationStyle?.humor?.humorTypes || []).map((type: string, index: number) => (
                            <span key={index} className="bg-pink-100 text-pink-900 px-2 py-1 rounded text-xs flex items-center">
                              {type}
                              <button
                                onClick={() => {
                                  setPersonality(prev => ({
                                    ...prev,
                                    communicationStyle: {
                                      ...prev.communicationStyle,
                                      humor: {
                                        ...prev.communicationStyle.humor,
                                        humorTypes: prev.communicationStyle.humor.humorTypes.filter((_, idx) => idx !== index)
                                      }
                                    }
                                  }));
                                }}
                                className="ml-1 text-red-500 hover:text-red-700 text-xs"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Humor Intensity</label>
                        <input
                          type="text"
                          className="w-full p-2 border rounded text-blue-900 bg-blue-50 text-sm"
                          value={personality.communicationStyle?.humor?.humorIntensity || ''}
                          onChange={e => setPersonality(prev => ({ 
                            ...prev, 
                            communicationStyle: { 
                              ...prev.communicationStyle, 
                              humor: { ...prev.communicationStyle.humor, humorIntensity: e.target.value }
                            }
                          }))}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <label className="block text-xs text-gray-500">Humor Exclusion Topics</label>
                          <button
                            onClick={() => {
                              const newTopic = prompt(t('dashboard.personality.addNewExclusionTopic'));
                              if (newTopic && newTopic.trim()) {
                                setPersonality(prev => ({
                                  ...prev,
                                  communicationStyle: {
                                    ...prev.communicationStyle,
                                    humor: {
                                      ...prev.communicationStyle.humor,
                                      humorExclusionTopics: [...prev.communicationStyle.humor.humorExclusionTopics, newTopic.trim()]
                                    }
                                  }
                                }));
                              }
                            }}
                            className="text-gray-500 hover:text-gray-700 text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(personality.communicationStyle?.humor?.humorExclusionTopics || []).map((topic: string, index: number) => (
                            <span key={index} className="bg-gray-100 text-gray-900 px-2 py-1 rounded text-xs flex items-center">
                              {topic}
                              <button
                                onClick={() => {
                                  setPersonality(prev => ({
                                    ...prev,
                                    communicationStyle: {
                                      ...prev.communicationStyle,
                                      humor: {
                                        ...prev.communicationStyle.humor,
                                        humorExclusionTopics: prev.communicationStyle.humor.humorExclusionTopics.filter((_, idx) => idx !== index)
                                      }
                                    }
                                  }));
                                }}
                                className="ml-1 text-red-500 hover:text-red-700 text-xs"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add more sections for other persona components */}
              <div className="flex justify-between items-end mt-6">
                <div className="flex gap-2">
                  <div className="flex flex-col gap-1">
                    <button
                      className="border border-blue-500 text-blue-500 font-semibold py-2 px-4 rounded-lg hover:bg-blue-500 hover:text-white transition shadow-none bg-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                      type="button"
                      onClick={handleGetAITemplate}
                      disabled={loadingAI || !canGenerateAITemplate()}
                    >
                      {loadingAI ? 'Generating...' : 'Get AI template'}
                    </button>
                    <span className="text-xs text-gray-400">
                      {getRemainingAttempts()} von {isProUser ? 10 : 2} Versuchen heute übrig
                      {isProUser && <span className="text-green-400 ml-1">(Pro)</span>}
                    </span>
                  </div>
                  <button
                    className="border border-gray-500 text-gray-500 font-semibold py-2 px-4 rounded-lg hover:bg-gray-500 hover:text-white transition shadow-none bg-transparent disabled:opacity-60"
                    type="button"
                    onClick={handleFillWithTemplate}
                  >
                    Fill with template.json
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    className="border border-white text-white font-semibold py-2 px-6 rounded-lg hover:bg-white hover:text-indigo-700 transition shadow-none bg-transparent"
                    onClick={handleSavePersona}
                    disabled={saving}
                  >
                    {saving ? tCommon('loading') : t('dashboard.savePersona')}
                  </button>
                  <button 
                    className="border border-white text-white font-semibold py-2 px-6 rounded-lg hover:bg-white hover:text-indigo-700 transition shadow-none bg-transparent"
                    onClick={() => {
                      // Keep the current persona name and description, only clear the values
                      const currentName = personality.name;
                      const currentDescription = personality.description;
                      setPersonality({
                        name: currentName,
                        description: currentDescription,
                        systemPrompt: '',
                        childhoodExperiences: {
                          personalDevelopment: [],
                          sexuality: [],
                          generalExperiences: [],
                          socialEnvironmentFriendships: [],
                          educationLearning: [],
                          familyRelationships: []
                        },
                        emotionalTriggers: [],
                        characterTraits: [],
                        positiveTraits: {
                          socialCommunicative: [],
                          professionalCognitive: [],
                          personalIntrinsic: []
                        },
                        negativeTraits: [],
                        areasOfInterest: [],
                        communicationStyle: {
                          tone: '',
                          wordChoice: '',
                          responsePatterns: '',
                          humor: {
                            humorEnabled: false,
                            humorTypes: [],
                            humorIntensity: '',
                            humorExclusionTopics: []
                          }
                        }
                      });
                      // Don't clear currentPersonaId and selectedPersonaId to keep the persona context
                    }}
                  >
                    Clear Values
                  </button>
                  <button 
                    className={`border border-red-500 text-red-500 font-semibold py-2 px-6 rounded-lg hover:bg-red-600 hover:text-white transition shadow-none bg-transparent ${
                      !selectedPersonaId ? 'opacity-50 cursor-not-allowed' : ''
                    }`} 
                    onClick={handleDeletePersona}
                    disabled={!selectedPersonaId}
                  >
                    {tCommon('delete')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DM & Comment Settings */}
        <div className="space-y-6">
          {/* Deine Personas Section as Card */}
          <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 text-white mb-8">
            <h2 className="text-2xl md:text-4xl mb-4 bg-gradient-to-r from-[#f3aacb] via-[#a3bffa] to-[#e6ebfc] bg-clip-text text-transparent drop-shadow-lg tracking-tight" style={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: '800',
              letterSpacing: '-0.04em',
              lineHeight: '1.2em',
              color: '#ffffff'
            }}>
              {t('dashboard.yourPersonas')}
            </h2>
            {Array.isArray(personas) && personas.length > 0 ? (
              <div className="space-y-2">
                {/* Live Chatbot Indicator */}
                {(() => {
                  const activePersona = personas.find(p => p.active);
                  if (activePersona) {
                    return (
                      <div className="flex items-center gap-2">
                        <span 
                          className="text-sm font-medium text-green-500"
                          style={{
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: '600'
                          }}
                        >
                          {t('dashboard.liveChatbot')}:
                        </span>
                        <span className="text-sm text-white font-medium">
                          {activePersona.name}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                <div className="flex items-center gap-4">
                <select
                  className="p-2 border rounded text-black min-w-[220px]" // wider dropdown
                  value={selectedPersonaId}
                  onChange={e => handlePersonaDropdownChange(e.target.value)}
                >
                  <option value="">{t('dashboard.selectPersona')}</option>
                  {personas.filter(persona => persona && persona.id && persona.name).map((persona) => (
                    <option key={persona.id} value={persona.id}>
                      {persona.name} {persona.active ? ' (Live)' : ''}
                    </option>
                  ))}
                </select>
                
                {/* Active Switch - Always Show */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-400">Active</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={selectedPersonaId ? personas.find(p => p.id === selectedPersonaId || p.id === String(selectedPersonaId) || String(p.id) === selectedPersonaId)?.active || false : false}
                                          className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f3aacb] border border-gray-300 ${
                        selectedPersonaId ? (personas.find(p => p.id === selectedPersonaId || p.id === String(selectedPersonaId) || String(p.id) === selectedPersonaId)?.active ? 'bg-green-500' : 'bg-gray-300') : 'bg-gray-300'
                      }`}
                  >
                                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                        selectedPersonaId ? (personas.find(p => p.id === selectedPersonaId || p.id === String(selectedPersonaId) || String(p.id) === selectedPersonaId)?.active ? 'translate-x-6' : 'translate-x-1') : 'translate-x-1'
                      }`} />
                  </button>
                </div>
                
                {/* Active/Inactive Switch */}
                {(() => {
                  console.log('Debug - selectedPersonaId:', selectedPersonaId);
                  console.log('Debug - personas:', personas);
                  console.log('Debug - personas length:', personas.length);
                  
                  if (selectedPersonaId) {
                    const selected = personas.find(p => p.id === selectedPersonaId || p.id === String(selectedPersonaId) || String(p.id) === selectedPersonaId);
                    console.log('Debug - selected persona:', selected);
                    if (selected) {
                      return (
                        <div className="flex items-center gap-2">
                          <span 
                            className={`text-sm font-medium ${
                              selected.active ? 'text-green-500' : 'text-gray-400'
                            }`}
                            style={{
                              fontFamily: '"Inter", sans-serif',
                              fontWeight: '500'
                            }}
                          >
                            {selected.active ? t('dashboard.active') : t('dashboard.inactive')}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={selected.active}
                            onClick={() => handleActivatePersona(selected.id)}
                            className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f3aacb] border border-gray-300
                              ${selected.active ? 'bg-green-500' : 'bg-gray-300'}`}
                          >
                            <span
                              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200
                                ${selected.active ? 'translate-x-6' : 'translate-x-1'}`}
                            />
                          </button>
                        </div>
                      );
                    }
                  }
                  return null;
                })()}
                </div>
              </div>
            ) : (
              <span className="text-gray-400">{t('dashboard.noPersonasYet')}</span>
            )}
          </div>

          {/* System Prompt Section as Card */}
          <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 text-white">
            <h2 className="text-2xl md:text-4xl mb-4 bg-gradient-to-r from-[#f3aacb] via-[#a3bffa] to-[#e6ebfc] bg-clip-text text-transparent drop-shadow-lg tracking-tight" style={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: '800',
              letterSpacing: '-0.04em',
              lineHeight: '1.2em',
              color: '#ffffff'
            }}>
              {currentLocale === 'de' ? 'System-Prompt' : 'System Prompt'}
            </h2>
            <p className="text-sm mb-4 opacity-80">
              {currentLocale === 'de' ? 'Benutzerdefinierte Anweisungen zur Steuerung des Verhaltens und der Antworten der KI in Gesprächen.' : 'Custom instructions to guide the AI\'s behavior and responses in conversations.'}
            </p>
            <textarea
              placeholder={currentLocale === 'de' ? 'Geben Sie einen benutzerdefinierten System-Prompt ein, um das Verhalten und die Antworten der KI zu steuern...' : 'Enter a custom system prompt to guide the AI\'s behavior and responses...'}
              className="w-full p-3 border rounded text-blue-900 bg-blue-50 min-h-[120px] resize-y"
              value={personality.systemPrompt || ''}
              onChange={e => setPersonality(prev => ({ ...prev, systemPrompt: e.target.value }))}
            />
          </div>

          <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-2xl md:text-4xl bg-gradient-to-r from-[#f3aacb] via-[#a3bffa] to-[#e6ebfc] bg-clip-text text-transparent drop-shadow-lg tracking-tight m-0" style={{
                fontFamily: '"Inter", sans-serif',
                fontWeight: '800',
                letterSpacing: '-0.04em',
                lineHeight: '1.2em',
                color: '#ffffff'
              }}>
                {t('dashboard.dmSettings')}
              </h2>
              <div className="flex-grow" />
              <span className="font-semibold text-sm md:text-base">{t('dashboard.autorespondingToDMs')}</span>
              <button
                id="dm-active"
                type="button"
                role="switch"
                aria-checked={dmSettings.active}
                onClick={() => setDmSettings(prev => ({ ...prev, active: !prev.active }))}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f3aacb] border border-gray-300
                  ${dmSettings.active ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200
                    ${dmSettings.active ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>
            <div className="space-y-4">
              {/* Delay of answers caption and duration fields */}
              <div className="mb-2">
                <span className="block font-semibold mb-1">{t('dashboard.delayOfResponse')}</span>
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      placeholder="5"
                      className="w-16 p-1 border rounded text-black text-sm"
                      value={personality.delayMin || ''}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        setPersonality(prev => ({
                          ...prev,
                          delayMin: value
                        }));
                      }}
                      onBlur={() => {
                        // Validate and save on blur
                        const min = personality.delayMin || 0;
                        const max = personality.delayMax || 10;
                        if (min >= 0 && min <= 1000 && max >= 0 && max <= 1000 && min <= max) {
                          handleSavePersona();
                        }
                      }}
                    />
                    <span className="text-sm text-white">-</span>
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      placeholder="10"
                      className="w-16 p-1 border rounded text-black text-sm"
                      value={personality.delayMax || ''}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        setPersonality(prev => ({
                          ...prev,
                          delayMax: value
                        }));
                      }}
                      onBlur={() => {
                        // Validate and save on blur
                        const min = personality.delayMin || 0;
                        const max = personality.delayMax || 10;
                        if (min >= 0 && min <= 1000 && max >= 0 && max <= 1000 && min <= max) {
                          handleSavePersona();
                        }
                      }}
                    />
                    <span className="text-sm text-white">minutes</span>
                  </div>
                </div>
                {(personality.delayMin !== undefined || personality.delayMax !== undefined) && (
                  <div className="mt-1">
                    {(() => {
                      const min = personality.delayMin || 0;
                      const max = personality.delayMax || 10;
                      if (min < 0 || min > 1000 || max < 0 || max > 1000) {
                        return <span className="text-red-400 text-xs">Values must be between 0-1000</span>;
                      } else if (min > max) {
                        return <span className="text-red-400 text-xs">Minimum must be less than or equal to maximum</span>;
                      }
                      return null;
                    })()}
                  </div>
                )}
              </div>
              
              {/* Remove the Product Links section from here - it will be moved to its own card */}
            </div>
          </div>

          {/* Comment Settings (similar structure) */}
          <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-2xl md:text-4xl bg-gradient-to-r from-[#f3aacb] via-[#a3bffa] to-[#e6ebfc] bg-clip-text text-transparent drop-shadow-lg tracking-tight m-0" style={{
                fontFamily: '"Inter", sans-serif',
                fontWeight: '800',
                letterSpacing: '-0.04em',
                lineHeight: '1.2em',
                color: '#ffffff'
              }}>
                {t('dashboard.commentSettings')}
              </h2>
              <div className="flex-grow" />
              <span className="font-semibold text-sm md:text-base">{t('dashboard.autorespondingToComments')}</span>
              <button
                id="comment-active"
                type="button"
                role="switch"
                aria-checked={commentSettings?.active}
                onClick={() => setCommentSettings(prev => ({ ...prev, active: !prev.active }))}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f3aacb] border border-gray-300
                  ${commentSettings?.active ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200
                    ${commentSettings?.active ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>
            {/* Delay of answers caption and duration fields for comments */}
            <div className="mb-2">
              <span className="block font-semibold mb-1">{t('dashboard.delayOfResponse')}</span>
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    placeholder="5"
                    className="w-16 p-1 border rounded text-black text-sm"
                    value={personality.delayMin || ''}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setPersonality(prev => ({
                        ...prev,
                        delayMin: value
                      }));
                    }}
                    onBlur={() => {
                      // Validate and save on blur
                      const min = personality.delayMin || 0;
                      const max = personality.delayMax || 10;
                      if (min >= 0 && min <= 1000 && max >= 0 && max <= 1000 && min <= max) {
                        handleSavePersona();
                      }
                    }}
                  />
                  <span className="text-sm text-white">-</span>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    placeholder="10"
                    className="w-16 p-1 border rounded text-black text-sm"
                    value={personality.delayMax || ''}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setPersonality(prev => ({
                        ...prev,
                        delayMax: value
                      }));
                    }}
                    onBlur={() => {
                      // Validate and save on blur
                      const min = personality.delayMin || 0;
                      const max = personality.delayMax || 10;
                      if (min >= 0 && min <= 1000 && max >= 0 && max <= 1000 && min <= max) {
                        handleSavePersona();
                      }
                    }}
                  />
                  <span className="text-sm text-white">minutes</span>
                </div>
              </div>
              {(personality.delayMin !== undefined || personality.delayMax !== undefined) && (
                <div className="mt-1">
                  {(() => {
                    const min = personality.delayMin || 0;
                    const max = personality.delayMax || 10;
                    if (min < 0 || min > 1000 || max < 0 || max > 1000) {
                      return <span className="text-red-400 text-xs">Values must be between 0-1000</span>;
                    } else if (min > max) {
                      return <span className="text-red-400 text-xs">Minimum must be less than or equal to maximum</span>;
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* New Product Links Card */}
          <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 text-white">
            <h2 className="text-2xl md:text-4xl mb-2 bg-gradient-to-r from-[#f3aacb] via-[#a3bffa] to-[#e6ebfc] bg-clip-text text-transparent drop-shadow-lg tracking-tight" style={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: '800',
              letterSpacing: '-0.04em',
              lineHeight: '1.2em',
              color: '#ffffff'
            }}>
              {personality.name ? t('dashboard.productLinks.titleWithName', { name: personality.name }) : t('dashboard.productLinks.title')}
            </h2>
            <p className="text-sm mb-4 opacity-80">
              {t('dashboard.productLinks.subtitle')}
            </p>
            
            <div className="space-y-3">
              {productLinks.map((link: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://"
                    className="flex-1 p-2 border rounded text-black"
                    value={link}
                    onChange={(e) => {
                      const newLinks = [...productLinks];
                      newLinks[index] = e.target.value;
                      setProductLinks(newLinks);
                    }}
                  />
                  <button
                    className="text-red-500 hover:text-red-700 px-3 py-2 border border-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
                    onClick={() => {
                      const newLinks = productLinks.filter((_, i) => i !== index);
                      setProductLinks(newLinks);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                className="text-blue-500 hover:text-blue-700 border border-blue-500 px-4 py-2 rounded hover:bg-blue-500 hover:text-white transition-colors"
                onClick={() => {
                  openEditValueModal(
                    t('dashboard.productLinks.modalTitle'),
                    t('dashboard.productLinks.placeholder'),
                    (oldValue: string, newValue: string) => {
                      if (newValue.trim()) {
                        setProductLinks([...productLinks, newValue.trim()]);
                      }
                    }
                  );
                }}
              >
                + {t('dashboard.productLinks.addButton')}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      {saveMessage && <span className="ml-4 text-sm text-green-400">{saveMessage}</span>}
      {/* Unsaved changes dialog */}
      <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <DialogContent className="bg-white text-black">
          <DialogHeader>
            <DialogTitle>{t('dashboard.unsavedChanges')}</DialogTitle>
            <DialogDescription>
              {t('dashboard.unsavedChangesDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => {
                setShowUnsavedDialog(false);
                setPendingPersonaId(null);
              }}
            >
              {tCommon('cancel')}
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={async () => {
                setShowUnsavedDialog(false);
                if (pendingPersonaId) {
                  await loadPersonaById(pendingPersonaId);
                  setPendingPersonaId(null);
                }
              }}
            >
              {t('dashboard.continue')}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Value Modal */}
      {currentModalConfig && (
        <AddValueModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSave={currentModalConfig.onSave}
          title={currentModalConfig.title}
          placeholder={currentModalConfig.placeholder}
        />
      )}

      {/* Edit Value Modal for Product Links */}
      {editValueModalConfig && (
        <EditValueModal
          isOpen={editValueModalOpen}
          onClose={() => setEditValueModalOpen(false)}
          onSave={editValueModalConfig.onSave}
          title={editValueModalConfig.title}
          currentValue={editValueModalConfig.currentValue}
          placeholder={editValueModalConfig.placeholder}
          subtitle={t('dashboard.productLinks.modalSubtitle')}
          buttonText={tCommon('save')}
          cancelText={tCommon('cancel')}
          editText={t('dashboard.productLinks.modalTitle')}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white text-black">
          <DialogHeader>
            <DialogTitle>{t('dashboard.deleteConfirmTitle')}</DialogTitle>
            <DialogDescription>
              {personaToDelete && t('dashboard.deleteConfirmMessage', { name: personaToDelete.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => {
                setDeleteDialogOpen(false);
                setPersonaToDelete(null);
              }}
            >
              {tCommon('cancel')}
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={confirmDeletePersona}
            >
              {t('dashboard.deleteConfirm')}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}