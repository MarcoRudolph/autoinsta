// app/dashboard/page.tsx
'use client';
import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/auth/supabaseClient.client';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import isEqual from 'lodash.isequal';

// Define a type for personality with childhoodExperiences having a proper index signature
// Example:
type Personality = {
  name: string;
  description: string;
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
  userId?: string;
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  
  // All hooks must be called before any return or conditional return
  // Initial state: flat structure
  const [personality, setPersonality] = useState<Personality>({
    name: '',
    description: '',
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
  const [dmSettings, setDmSettings] = useState({
    active: false,
    duration: { from: '', until: '' },
    productLinks: [] as string[],
  });
  const [commentSettings, setCommentSettings] = useState({
    active: false,
    duration: { from: '', until: '' },
    productLinks: [] as string[],
  });
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [personas, setPersonas] = useState<{id: string, name: string, active?: boolean}[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  // Unsaved changes dialog hooks
  const [lastLoadedPersona, setLastLoadedPersona] = useState<typeof personality>(personality);
  const [pendingPersonaId, setPendingPersonaId] = useState<string | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [currentPersonaId, setCurrentPersonaId] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const handleActivatePersona = async (id: string) => {
    // Get userId from session
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.user?.id) {
      alert('Kein Benutzer angemeldet. Bitte einloggen.');
      return;
    }
    const userId = data.session.user.id;
    try {
      const res = await fetch('/api/set-active-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId: id, userId }),
      });
      const result = await res.json();
      console.log('Set active persona result:', result);
      await fetchPersonas();
    } catch (err) {
      console.error('Error setting active persona:', err);
      alert('Fehler beim Aktivieren der Persona.');
    }
  };

  // Fetch personas from API
  const fetchPersonas = useCallback(async () => {
    const res = await fetch('/api/list-personas');
    if (res.ok) {
      const data = await res.json();
      setPersonas(data.personas || []);
      if ((data.personas || []).length === 1) {
        setSelectedPersonaId(data.personas[0].id);
      }
    }
  }, []);

  // Fetch personas on mount
  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  const handleGetAITemplate = useCallback(async () => {
    setLoadingAI(true);
    console.log('Sending request to /api/generate-persona...');
    try {
      const res = await fetch('/api/generate-persona', { method: 'POST' });
      console.log('Received response from /api/generate-persona:', res);
      if (!res.ok) throw new Error('Failed to generate persona');
      const data = await res.json();
      console.log('Parsed JSON from /api/generate-persona:', data);
      if (data && data.persona) {
        setPersonality(data.persona);
        console.log('Persona state updated with AI template.');
      } else {
        console.log('No persona found in response:', data);
      }
    } catch (err) {
      console.error('Fehler beim Generieren der KI-Persona:', err);
      alert('Fehler beim Generieren der KI-Persona.');
    } finally {
      setLoadingAI(false);
    }
  }, []);

  const handleFillWithTemplate = useCallback(async () => {
    try {
      const res = await fetch('/template.json');
      if (!res.ok) throw new Error('Failed to load template.json');
      const data = await res.json();
      // Accept both {personality: {...}} and flat persona
      if (data.personality) {
        setPersonality(data.personality);
      } else {
        setPersonality(data);
      }
      console.log('Persona state filled from template.json');
    } catch (err) {
      alert('Fehler beim Laden der Vorlage.');
      console.error(err);
    }
  }, []);

  const handleInstagramLogin = () => {
    window.location.href =
      'https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=1031545482523645&redirect_uri=https://www.rudolpho-chat.de/api/instagram/callback&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights';
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
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    getUserEmail();
  }, [supabase]);

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
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session?.user?.id) {
          alert('Kein Benutzer angemeldet. Bitte einloggen.');
          setSaving(false);
          return;
        }
        userId = data.session.user.id as string;
        console.log('Fetched userId from session:', userId);
      }
      if (currentPersonaId) {
        // Edit existing persona
        console.log('Editing persona:', currentPersonaId, personality);
        const res = await fetch('/api/edit-persona', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ personaId: currentPersonaId, userId, data: { ...personality, userId } }),
        });
        const responseJson = await res.json();
        console.log('Edit persona response:', responseJson);
        if (!res.ok) throw new Error('Failed to edit persona');
        setSaveMessage('Persona updated!');
      } else {
        // Create new persona
        const personaToSave = { ...personality, userId };
        console.log('Saving persona:', personaToSave);
        const res = await fetch('/api/save-persona', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(personaToSave),
        });
        const responseJson = await res.json();
        console.log('Save persona response:', responseJson);
        if (!res.ok) throw new Error('Failed to save persona');
        setSaveMessage('Persona saved!');
      }
      await fetchPersonas();
    } catch (err) {
      console.error('Error saving persona:', err);
      alert('Fehler beim Speichern der Persona.');
      // Do not set a green message on error
    } finally {
      setSaving(false);
    }
  }, [personality, fetchPersonas, supabase, currentPersonaId]);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session && mounted) {
        router.replace('/');
      }
      setCheckingSession(false);
    });
    return () => { mounted = false; };
  }, [router, supabase]);

  if (checkingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  // Make sure to install lodash.isequal: npm install lodash.isequal
  const handlePersonaDropdownChange = async (id: string) => {
    setSelectedPersonaId(id);
    setCurrentPersonaId(id);
    if (!isEqual(personality, lastLoadedPersona)) {
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
        const data: { persona?: { data?: typeof personality } } = await res.json();
        if (data && data.persona && data.persona.data) {
          setPersonality(data.persona.data);
          setLastLoadedPersona(data.persona.data);
          setSelectedPersonaId(id);
          setCurrentPersonaId(id);
        }
      }
    } catch {
      alert('Fehler beim Laden der Persona.');
    }
  };

  const handleDeletePersona = async () => {
    if (!selectedPersonaId) return;
    const persona = personas.find(p => p.id === selectedPersonaId);
    if (!persona) return;
    const confirmed = window.confirm(`Do you really want delete '${persona.name}'?`);
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/delete-persona`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedPersonaId }),
      });
      if (!res.ok) throw new Error('Failed to delete persona');
      await fetchPersonas();
      if (selectedPersonaId === currentPersonaId) {
        setPersonality({
          name: '',
          description: '',
          childhoodExperiences: {},
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
        });
        setCurrentPersonaId(null);
        setSelectedPersonaId('');
      }
    } catch {
      alert('Failed to delete persona.');
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
    // TODO: Implement settings page
    alert('Settings page coming soon!');
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
                <p className="text-xs text-gray-500">rudolpho-chat User</p>
              </div>
              
              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={handleSettings}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <div className="font-medium">Settings</div>
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
                    <div className="font-medium">Logout</div>
                    <div className="text-xs text-gray-500">Abmelden</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
        <h1 className="text-4xl font-extrabold tracking-wide">Dashboard</h1>
        <p className="text-sm mt-2 opacity-80">Automatisiere deine Instagram-Interaktionen</p>
        <button
          onClick={handleInstagramLogin}
          className={`mt-4 border font-semibold py-2 px-4 rounded-lg transition shadow-none ${instagramConnected ? 'bg-green-600 border-green-600 text-white' : 'bg-transparent text-white border-white hover:bg-white hover:text-indigo-700'}`}
        >
          {instagramConnected ? 'Instagram verbunden' : 'Instagram verbinden'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Craft Persona Section */}
        <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 text-white">
          <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-4 bg-gradient-to-r from-[#f3aacb] via-[#a3bffa] to-[#e6ebfc] bg-clip-text text-transparent drop-shadow-lg tracking-tight">
            Craft Persona
          </h2>
          
          {/* Basic Info */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Name"
              className="w-full p-2 border rounded mb-2 text-blue-900 bg-blue-50"
              value={personality.name}
              onChange={e => setPersonality(prev => ({ ...prev, name: e.target.value }))}
            />
            <textarea
              placeholder="Description"
              className="w-full p-2 border rounded h-20 text-blue-900 bg-blue-50"
              value={personality.description}
              onChange={e => setPersonality(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          {/* Childhood Experiences */}
          {Object.keys(personality.childhoodExperiences).map((section: string) => {
            const isPersonalDev = section === 'personalDevelopment';
            return (
              <div key={section} className="mb-6">
                <h3 className="font-medium mb-2 capitalize">
                  {isPersonalDev ? 'Personal development' : section.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h3>
                <ul className="mt-2 space-y-2">
                  {(personality.childhoodExperiences[section as keyof typeof personality.childhoodExperiences] || []).map((item, idx) => (
                    <li key={idx} className="bg-blue-100 text-blue-900 px-4 py-2 rounded shadow-sm">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {/* Character Traits */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Character Traits</h3>
            <div className="flex flex-wrap gap-2">
              {personality.characterTraits.map((trait: string, index: number) => (
                <span
                  key={index}
                  className="bg-gray-100 text-blue-900 px-3 py-1 rounded-full flex items-center"
                >
                  {trait}
                  <button
                    className="ml-2 text-red-500 text-sm"
                    onClick={() => {}}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Add trait"
                className="p-2 border rounded"
                onKeyPress={() => {}}
              />
            </div>
          </div>

          {/* Add more sections for other persona components */}
          <div className="flex justify-between items-end mt-6">
            <div className="flex gap-2">
              <button
                className="border border-blue-500 text-blue-500 font-semibold py-2 px-4 rounded-lg hover:bg-blue-500 hover:text-white transition shadow-none bg-transparent disabled:opacity-60"
                type="button"
                onClick={handleGetAITemplate}
                disabled={loadingAI}
              >
                {loadingAI ? 'Generating...' : 'Get AI template'}
              </button>
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
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button className="border border-white text-white font-semibold py-2 px-6 rounded-lg hover:bg-white hover:text-indigo-700 transition shadow-none bg-transparent">
                Clear all
              </button>
              <button className="border border-white text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-600 hover:text-white transition shadow-none bg-transparent" onClick={handleDeletePersona}>
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* DM & Comment Settings */}
        <div className="space-y-6">
          {/* Deine Personas Section as Card */}
          <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 text-white mb-8">
            <h2 className="text-2xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-[#f3aacb] via-[#a3bffa] to-[#e6ebfc] bg-clip-text text-transparent drop-shadow-lg tracking-tight">
              Deine Personas
            </h2>
            {Array.isArray(personas) && personas.length > 0 ? (
              <div className="flex items-center gap-4">
                <select
                  className="p-2 border rounded text-black min-w-[220px]" // wider dropdown
                  value={selectedPersonaId}
                  onChange={e => handlePersonaDropdownChange(e.target.value)}
                >
                  {personas.map((persona) => (
                    <option key={persona.id} value={persona.id}>
                      {persona.name}
                    </option>
                  ))}
                </select>
                {/* Only show Activate button if persona is not active */}
                {(() => {
                  const selected = personas.find(p => p.id === selectedPersonaId);
                  if (selected && !selected.active) {
                    return (
                      <button
                        className="border border-green-500 text-green-600 font-semibold py-2 px-4 rounded-lg hover:bg-green-500 hover:text-white transition shadow-none bg-transparent"
                        onClick={() => handleActivatePersona(selectedPersonaId)}
                      >
                        Activate persona
                      </button>
                    );
                  }
                  return null;
                })()}
              </div>
            ) : (
              <span className="text-gray-400">no personas yet</span>
            )}
          </div>
          <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-2xl md:text-4xl font-extrabold bg-gradient-to-r from-[#f3aacb] via-[#a3bffa] to-[#e6ebfc] bg-clip-text text-transparent drop-shadow-lg tracking-tight m-0">
                DM Settings
              </h2>
              <div className="flex-grow" />
              <span className="font-semibold text-sm md:text-base">Autoresponding to DMs</span>
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
                <span className="block font-semibold mb-1">Delay of answers</span>
                <div className="flex gap-4 items-center">
                  <label className="text-sm font-medium" htmlFor="dm-from">from</label>
                  <input
                    id="dm-from"
                    type="time"
                    className="p-2 border rounded text-black"
                    value={dmSettings.duration.from}
                    onChange={e => setDmSettings(prev => ({
                      ...prev,
                      duration: { ...prev.duration, from: e.target.value }
                    }))}
                  />
                  <label className="text-sm font-medium" htmlFor="dm-till">till</label>
                  <input
                    id="dm-till"
                    type="time"
                    className="p-2 border rounded text-black"
                    value={dmSettings.duration.until}
                    onChange={e => setDmSettings(prev => ({
                      ...prev,
                      duration: { ...prev.duration, until: e.target.value }
                    }))}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Product Links</h3>
                {dmSettings.productLinks.map((link: string, index: number) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="url"
                      placeholder="https://"
                      className="flex-1 p-2 border rounded"
                      value={link}
                      onChange={() => {}}
                    />
                    <button
                      className="text-red-500"
                      onClick={() => {}}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  className="text-blue-500 text-sm"
                  onClick={() => {}}
                >
                  + Add Link
                </button>
              </div>
            </div>
          </div>

          {/* Comment Settings (similar structure) */}
          <div className="bg-[#15192a]/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-2xl md:text-4xl font-extrabold bg-gradient-to-r from-[#f3aacb] via-[#a3bffa] to-[#e6ebfc] bg-clip-text text-transparent drop-shadow-lg tracking-tight m-0">
                Comment Settings
              </h2>
              <div className="flex-grow" />
              <span className="font-semibold text-sm md:text-base">Autoresponding to comments</span>
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
              <span className="block font-semibold mb-1">Delay of answers</span>
              <div className="flex gap-4 items-center">
                <label className="text-sm font-medium" htmlFor="comment-from">from</label>
                <input
                  id="comment-from"
                  type="time"
                  className="p-2 border rounded text-black"
                  value={commentSettings?.duration?.from || ''}
                  onChange={e => setCommentSettings(prev => ({
                    ...prev,
                    duration: { ...prev.duration, from: e.target.value }
                  }))}
                />
                <label className="text-sm font-medium" htmlFor="comment-till">till</label>
                <input
                  id="comment-till"
                  type="time"
                  className="p-2 border rounded text-black"
                  value={commentSettings?.duration?.until || ''}
                  onChange={e => setCommentSettings(prev => ({
                    ...prev,
                    duration: { ...prev.duration, until: e.target.value }
                  }))}
                />
              </div>
            </div>
            {/* Similar structure as DM Settings */}
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      {saveMessage && <span className="ml-4 text-sm text-green-400">{saveMessage}</span>}
      {/* Unsaved changes dialog */}
      <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <DialogContent className="bg-white text-black">
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              Changes to the current persona have not been saved. Do you still want to continue?
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
              Cancel
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
              Continue
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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