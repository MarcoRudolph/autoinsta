// app/dashboard/page.tsx
'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/auth/supabaseClient.client';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
// import { useRef } from 'react'; // Remove unused
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

export default function Dashboard() {
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

  const router = useRouter();
  const supabase = createClient();

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

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: 'linear-gradient(135deg, #1b1f2b, #2b2e47, #313c5c)' }}>
      <div className="flex flex-col items-center text-white rounded-2xl shadow-lg py-6 px-10 mb-8" style={{ background: 'linear-gradient(135deg, #1b1f2b, #2a2f4d, #3f4d70, #654a74)' }}>
        <h1 className="text-4xl font-extrabold tracking-wide">🤖 AutoChat Dashboard</h1>
        <p className="text-sm mt-2 opacity-80">Automatisiere deine Instagram-Interaktionen</p>
        <button className="mt-4 border border-white text-white font-semibold py-2 px-4 rounded-lg hover:bg-white hover:text-indigo-700 transition shadow-none bg-transparent">
          Instagram verbinden
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