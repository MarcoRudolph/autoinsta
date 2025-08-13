// src/components/auth/AuthenticatedDashboard.tsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/auth/supabaseClient.client';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AddValueModal from '@/components/ui/AddValueModal';
import isEqual from 'lodash.isequal';

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

const AuthenticatedDashboard = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  
  const [personality, setPersonality] = useState<Personality>({ name: '', description: '', childhoodExperiences: { personalDevelopment: [], sexuality: [], generalExperiences: [], socialEnvironmentFriendships: [], educationLearning: [], familyRelationships: [] }, emotionalTriggers: [], characterTraits: [], positiveTraits: { socialCommunicative: [], professionalCognitive: [], personalIntrinsic: [] }, negativeTraits: [], areasOfInterest: [], communicationStyle: { tone: '', wordChoice: '', responsePatterns: '', humor: { humorEnabled: false, humorTypes: [], humorIntensity: '', humorExclusionTopics: [] } } });
  const [dmSettings, setDmSettings] = useState({ active: false, duration: { from: '', until: '' }, productLinks: [] as string[], });
  const [commentSettings, setCommentSettings] = useState({ active: false, duration: { from: '', until: '' }, productLinks: [] as string[], });
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [personas, setPersonas] = useState<{id: string, name: string, active?: boolean}[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [aiTemplateCount, setAiTemplateCount] = useState(0);
  const [lastAiTemplateDate, setLastAiTemplateDate] = useState<string>('');
  const [lastLoadedPersona, setLastLoadedPersona] = useState<typeof personality>(personality);
  const [pendingPersonaId, setPendingPersonaId] = useState<string | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [currentPersonaId, setCurrentPersonaId] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const userDropdownRef = useRef<HTMLDivElement>(null);
  
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [currentModalConfig, setCurrentModalConfig] = useState<{ title: string; placeholder: string; onSave: (value: string) => void; } | null>(null);

  const isPersonaEmpty = (persona: typeof personality): boolean => { return ( !persona.name.trim() && !persona.description.trim() && Object.values(persona.childhoodExperiences).every(experiences => experiences.length === 0) && persona.emotionalTriggers.length === 0 && persona.characterTraits.length === 0 && Object.values(persona.positiveTraits).every(traits => traits.length === 0) && persona.negativeTraits.length === 0 && persona.areasOfInterest.length === 0 && !persona.communicationStyle.tone.trim() && !persona.communicationStyle.wordChoice.trim() && !persona.communicationStyle.responsePatterns.trim() && !persona.communicationStyle.humor.humorIntensity.trim() && persona.communicationStyle.humor.humorTypes.length === 0 && persona.communicationStyle.humor.humorExclusionTopics.length === 0 ); };
  const openAddModal = (title: string, placeholder: string, onSave: (value: string) => void) => { setCurrentModalConfig({ title, placeholder, onSave }); setAddModalOpen(true); };
  const handleActivatePersona = async (id: string) => { const { data, error } = await supabase.auth.getSession(); if (error || !data.session?.user?.id) { alert('Kein Benutzer angemeldet. Bitte einloggen.'); return; } const userId = data.session.user.id; try { const res = await fetch('/api/set-active-persona', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ personaId: id, userId }), }); await res.json(); await fetchPersonas(); } catch (err) { console.error('Error setting active persona:', err); alert('Fehler beim Aktivieren der Persona.'); } };
  const fetchPersonas = useCallback(async () => { try { const res = await fetch('/api/list-personas'); if (res.ok) { const data = await res.json(); const validPersonas = (data.personas || []).filter((persona: {id: string, name: string, active?: boolean}) => persona && persona.id && persona.name && persona.id !== null && persona.name !== null ); setPersonas(validPersonas); if (validPersonas.length === 1) { setSelectedPersonaId(validPersonas[0].id); } else if (validPersonas.length === 0) { setSelectedPersonaId(''); setCurrentPersonaId(null); } } else { console.error('Failed to fetch personas:', res.status, res.statusText); setPersonas([]); setSelectedPersonaId(''); setCurrentPersonaId(null); } } catch (error) { console.error('Error fetching personas:', error); setPersonas([]); setSelectedPersonaId(''); setCurrentPersonaId(null); } }, []);
  useEffect(() => { fetchPersonas(); }, [fetchPersonas]);
  const canGenerateAITemplate = useCallback(() => { const today = new Date().toDateString(); return lastAiTemplateDate === today && aiTemplateCount < 2; }, [lastAiTemplateDate, aiTemplateCount]);
  const handleGetAITemplate = useCallback(async () => { if (!canGenerateAITemplate()) { alert('Du hast heute bereits 2 AI-Templates generiert. Das Limit wird täglich um Mitternacht zurückgesetzt.'); return; } setLoadingAI(true); try { const res = await fetch('/api/generate-persona', { method: 'POST' }); if (!res.ok) throw new Error('Failed to generate persona'); const data = await res.json(); if (data && data.persona) { setPersonality(data.persona); const today = new Date().toDateString(); const newCount = aiTemplateCount + 1; setAiTemplateCount(newCount); localStorage.setItem('aiTemplateLimit', JSON.stringify({ count: newCount, date: today })); } } catch (err) { console.error('Fehler beim Generieren der KI-Persona:', err); alert('Fehler beim Generieren der KI-Persona.'); } finally { setLoadingAI(false); } }, [aiTemplateCount, canGenerateAITemplate]);
  const handleFillWithTemplate = useCallback(async () => { try { const res = await fetch('/template.json'); if (!res.ok) throw new Error('Failed to load template.json'); const data = await res.json(); if (data.personality) { setPersonality(data.personality); } else { setPersonality(data); } } catch (err) { alert('Fehler beim Laden der Vorlage.'); console.error(err); } }, []);
  const handleInstagramLogin = () => { window.location.href = 'https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=1031545482523645&redirect_uri=https://www.rudolpho-chat.de/api/instagram/callback&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights'; };
  useEffect(() => { function handleClickOutside(event: MouseEvent) { if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) { setUserDropdownOpen(false); } } if (userDropdownOpen) { document.addEventListener('mousedown', handleClickOutside); } return () => { document.removeEventListener('mousedown', handleClickOutside); }; }, [userDropdownOpen]);
  useEffect(() => { const getUserEmail = async () => { const { data: { user } } = await supabase.auth.getUser(); if (user?.email) { setUserEmail(user.email); } }; getUserEmail(); }, [supabase]);
  useEffect(() => { const checkDailyLimit = () => { const today = new Date().toDateString(); const stored = localStorage.getItem('aiTemplateLimit'); if (stored) { const { count, date } = JSON.parse(stored); if (date === today) { setAiTemplateCount(count); setLastAiTemplateDate(date); } else { setAiTemplateCount(0); setLastAiTemplateDate(today); localStorage.setItem('aiTemplateLimit', JSON.stringify({ count: 0, date: today })); } } else { setAiTemplateCount(0); setLastAiTemplateDate(today); localStorage.setItem('aiTemplateLimit', JSON.stringify({ count: 0, date: today })); } }; checkDailyLimit(); }, []);
  const getRemainingAttempts = () => { const today = new Date().toDateString(); if (lastAiTemplateDate !== today) return 2; return Math.max(0, 2 - aiTemplateCount); };
  useEffect(() => { const param = searchParams.get('instagramConnected'); if (param === 'true') { setInstagramConnected(true); if (typeof window !== 'undefined') { localStorage.setItem('instagramConnected', 'true'); const url = new URL(window.location.href); url.searchParams.delete('instagramConnected'); window.history.replaceState({}, '', url.toString()); } } else if (param === 'false') { setInstagramConnected(false); } else if (typeof window !== 'undefined') { const stored = localStorage.getItem('instagramConnected'); if (stored === 'true') setInstagramConnected(true); } }, [searchParams]);
  const handleSavePersona = useCallback(async () => { setSaving(true); setSaveMessage(null); try { let userId: string = personality.userId ?? ''; if (!userId) { const { data, error } = await supabase.auth.getSession(); if (error || !data.session?.user?.id) { alert('Kein Benutzer angemeldet. Bitte einloggen.'); setSaving(false); return; } userId = data.session.user.id as string; } if (currentPersonaId) { const res = await fetch('/api/edit-persona', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ personaId: currentPersonaId, userId, data: { ...personality, userId } }), }); if (!res.ok) throw new Error('Failed to edit persona'); setSaveMessage('Persona updated!'); } else { const personaToSave = { ...personality, userId }; const res = await fetch('/api/save-persona', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(personaToSave), }); if (!res.ok) throw new Error('Failed to save persona'); setSaveMessage('Persona saved!'); } await fetchPersonas(); } catch (err) { console.error('Error saving persona:', err); alert('Fehler beim Speichern der Persona.'); } finally { setSaving(false); } }, [personality, fetchPersonas, supabase, currentPersonaId]);
  useEffect(() => { let mounted = true; supabase.auth.getSession().then(({ data }) => { if (!data.session && mounted) { router.replace('/'); } setCheckingSession(false); }); return () => { mounted = false; }; }, [router, supabase]);
  if (checkingSession) { return ( <div className="flex items-center justify-center min-h-screen"> <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" /> </div> ); }
  const handlePersonaDropdownChange = async (id: string) => { if (!id || id === 'null' || id === 'undefined') { console.warn('Invalid persona ID selected:', id); alert('Bitte wählen Sie eine gültige Persona aus.'); return; } setSelectedPersonaId(id); setCurrentPersonaId(id); if (!isEqual(personality, lastLoadedPersona) && !isPersonaEmpty(personality)) { setPendingPersonaId(id); setShowUnsavedDialog(true); } else { await loadPersonaById(id); } };
  const loadPersonaById = async (id: string) => { if (!id) return; try { const res = await fetch(`/api/get-persona?id=${id}`); if (res.ok) { const data: { persona?: typeof personality } = await res.json(); if (data && data.persona && data.persona !== null) { setPersonality(data.persona); setLastLoadedPersona(data.persona); setSelectedPersonaId(id); setCurrentPersonaId(id); } else { console.warn('No valid persona data received:', data); alert('Keine gültigen Persona-Daten gefunden.'); } } else { console.error('Failed to fetch persona:', res.status, res.statusText); alert('Fehler beim Laden der Persona.'); } } catch (error) { console.error('Error loading persona:', error); alert('Fehler beim Laden der Persona.'); } };
  const handleDeletePersona = async () => { if (!selectedPersonaId) return; const persona = personas.find(p => p.id === selectedPersonaId); if (!persona) return; const confirmed = window.confirm(`Do you really want delete '${persona.name}'?`); if (!confirmed) return; try { const res = await fetch(`/api/delete-persona`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedPersonaId }), }); if (!res.ok) throw new Error('Failed to delete persona'); await fetchPersonas(); if (selectedPersonaId === currentPersonaId) { setPersonality({ name: '', description: '', childhoodExperiences: {}, emotionalTriggers: [], characterTraits: [], positiveTraits: { socialCommunicative: [], professionalCognitive: [], personalIntrinsic: [], }, negativeTraits: [], areasOfInterest: [], communicationStyle: { tone: '', wordChoice: '', responsePatterns: '', humor: { humorEnabled: false, humorTypes: [], humorIntensity: '', humorExclusionTopics: [], }, }, }); setCurrentPersonaId(null); setSelectedPersonaId(''); } } catch { alert('Failed to delete persona.'); } };
  const handleUserDropdownToggle = () => { setUserDropdownOpen(!userDropdownOpen); };
  const handleLogout = async () => { try { localStorage.clear(); await supabase.auth.signOut(); router.push('/'); } catch (error) { console.error('Logout error:', error); router.push('/'); } };
  const handleSettings = () => { router.push('/settings'); setUserDropdownOpen(false); };

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
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">{userEmail}</p>
                <p className="text-xs text-gray-500">rudolpho-chat User</p>
              </div>
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
        {/* ... (The rest of the JSX from DashboardContent) */}
      </div>
      {/* Action Buttons and Modals */}
    </div>
  );
};

export default AuthenticatedDashboard;
