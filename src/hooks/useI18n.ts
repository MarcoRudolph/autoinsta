import { useMemo } from 'react';

const messages = {
  en: {
    common: {
      save: "Save",
      cancel: "Cancel",
      add: "Add",
      edit: "Edit",
      delete: "Delete",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      confirm: "Confirm",
      close: "Close"
    },
    dashboard: {
      title: "Dashboard",
      welcome: "Welcome to your dashboard",
      newPersona: "New AI-Chatbot",
      savePersona: "Save AI-Chatbot",
      personaSaved: "AI-Chatbot saved!",
      personaUpdated: "AI-Chatbot updated!",
      saveError: "Error saving AI-Chatbot",
      unsavedChanges: "Unsaved Changes",
      unsavedChangesDescription: "Changes to the current AI-Chatbot have not been saved. Do you still want to continue?",
      continue: "Continue",
      personaDeleted: "AI-Chatbot deleted successfully",
      deleteConfirm: "Delete",
      deleteConfirmTitle: "Delete AI-Chatbot",
      deleteConfirmMessage: "Do you really want to delete the AI-Chatbot '{name}'? This action cannot be undone.",
      deleteError: "Failed to delete AI-Chatbot",
      noUserLoggedIn: "No user logged in. Please log in.",
      invalidPersona: "Please select a valid AI-Chatbot.",
      noValidPersonaData: "No valid AI-Chatbot data found.",
      errorLoadingPersona: "Error loading AI-Chatbot.",
      personaEmpty: "AI-Chatbot is empty",
      aiTemplateLimit: "AI Template daily limit reached",
      aiTemplateLimitDescription: "You have reached the daily limit for AI template generation. Please try again tomorrow.",
      instagramConnected: "Instagram Connected",
      instagramDisconnected: "Instagram Disconnected",
      connectInstagram: "Connect Instagram",
      disconnectInstagram: "Disconnect Instagram",
      settings: "Settings",
      dmSettings: "DM Settings",
      commentSettings: "Comment Settings",
      autorespondingToDMs: "Autoresponding to DMs",
      autorespondingToComments: "Autoresponding to comments",
      delayOfResponse: "Delay of response",
      from: "from",
      till: "till",
      selectPersona: "-- Select AI-Chatbot --",
      yourPersonas: "Your AI-Chatbots",
      activatePersona: "Activate AI-Chatbot",
      noPersonasYet: "no AI-Chatbots yet",
      active: "Active",
      inactive: "Inactive",
      liveChatbot: "Live Chatbot",
      logout: "Logout",
      userProfile: "User Profile",
      craftPersona: "Create AI-Chatbot",
      automateInstagram: "Automate your Instagram interactions",
      userType: "rudolpho-chat User",
      productLinks: {
        title: "Product Links",
        titleWithName: "Product Links of {name}",
        subtitle: "Sometimes, during a conversation, the chatbot might share a product link — for example, an image of an item you can buy. This could happen if you ask for it directly, or if the topic naturally inspires a suggestion. Click \"Add Link\" to add new product URLs.",
        addButton: "Add Link",
        placeholder: "Enter product URL",
        modalTitle: "Adding product link...",
        modalSubtitle: "This can be any site the chatbot should recommend"
      },
      personality: {
        name: "Name",
        description: "Description",
        childhoodExperiences: "Childhood Experiences",
        personalDevelopment: "Personal Development",
        sexuality: "Sexuality",
        generalExperiences: "General Experiences",
        socialEnvironmentFriendships: "Social Environment & Friendships",
        educationLearning: "Education & Learning",
        familyRelationships: "Family Relationships",
        emotionalTriggers: "Emotional Triggers",
        characterTraits: "Character Traits",
        positiveTraits: "Positive Traits",
        socialCommunicative: "Social & Communicative",
        professionalCognitive: "Professional & Cognitive",
        personalIntrinsic: "Personal & Intrinsic",
        negativeTraits: "Negative Traits",
        areasOfInterest: "Areas of Interest",
        communicationStyle: "Communication Style",
        tone: "Tone",
        wordChoice: "Word Choice",
        responsePatterns: "Response Patterns",
        humor: "Humor",
        humorEnabled: "Humor Enabled",
        humorTypes: "Humor Types",
        humorIntensity: "Humor Intensity",
        humorExclusionTopics: "Humor Exclusion Topics",
        addNew: "Add New",
        addNewTrait: "Add New Trait",
        addNewInterest: "Add New Interest",
        addNewTrigger: "Add New Trigger",
        addNewHumorType: "Add New Humor Type",
        addNewExclusionTopic: "Add New Exclusion Topic",
        placeholder: {
          name: "Enter name",
          description: "Enter description",
          trait: "Enter trait",
          interest: "Enter interest",
          trigger: "Enter trigger",
          humorType: "Enter humor type",
          exclusionTopic: "Enter exclusion topic"
        }
      }
    }
  },
  de: {
    common: {
      save: "Speichern",
      cancel: "Abbrechen",
      add: "Hinzufügen",
      edit: "Bearbeiten",
      delete: "Löschen",
      loading: "Lädt...",
      error: "Fehler",
      success: "Erfolg",
      confirm: "Bestätigen",
      close: "Schließen"
    },
    dashboard: {
      title: "Dashboard",
      welcome: "Willkommen in deinem Dashboard",
      newPersona: "Neuer AI-Chatbot",
      savePersona: "AI-Chatbot speichern",
      personaSaved: "AI-Chatbot gespeichert!",
      personaUpdated: "AI-Chatbot aktualisiert!",
      saveError: "Fehler beim Speichern des AI-Chatbots",
      unsavedChanges: "Ungespeicherte Änderungen",
      unsavedChangesDescription: "Änderungen an dem aktuellen AI-Chatbot wurden nicht gespeichert. Möchtest du trotzdem fortfahren?",
      continue: "Fortfahren",
      personaDeleted: "AI-Chatbot erfolgreich gelöscht",
      deleteConfirm: "Löschen",
      deleteConfirmTitle: "AI-Chatbot löschen",
      deleteConfirmMessage: "Möchtest du wirklich den AI-Chatbot '{name}' löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
      deleteError: "Fehler beim Löschen des AI-Chatbots",
      noUserLoggedIn: "Kein Benutzer angemeldet. Bitte einloggen.",
      invalidPersona: "Bitte wählen Sie einen gültigen AI-Chatbot aus.",
      noValidPersonaData: "Keine gültigen AI-Chatbot-Daten gefunden.",
      errorLoadingPersona: "Fehler beim Laden des AI-Chatbots.",
      personaEmpty: "AI-Chatbot ist leer",
      aiTemplateLimit: "AI Template Tageslimit erreicht",
      aiTemplateLimitDescription: "Sie haben das Tageslimit für die AI-Template-Generierung erreicht. Bitte versuchen Sie es morgen erneut.",
      instagramConnected: "Instagram verbunden",
      instagramDisconnected: "Instagram getrennt",
      connectInstagram: "Instagram verbinden",
      disconnectInstagram: "Instagram trennen",
      settings: "Einstellungen",
      dmSettings: "DM-Einstellungen",
      commentSettings: "Kommentar-Einstellungen",
      autorespondingToDMs: "Automatische DM-Antworten",
      autorespondingToComments: "Automatische Kommentar-Antworten",
      delayOfResponse: "Antwortverzögerung",
      from: "von",
      till: "bis",
      selectPersona: "-- AI-Chatbot auswählen --",
      yourPersonas: "Deine AI-Chatbots",
      activatePersona: "AI-Chatbot aktivieren",
      noPersonasYet: "noch keine AI-Chatbots",
      active: "Aktiv",
      inactive: "Inaktiv",
      liveChatbot: "Live Chatbot",
      logout: "Abmelden",
      userProfile: "Benutzerprofil",
      craftPersona: "AI-Chatbot erstellen",
      automateInstagram: "Automatisiere deine Instagram-Interaktionen",
      userType: "rudolpho-chat Benutzer",
      productLinks: {
        title: "Produkt-Links",
        titleWithName: "Produkt-Links von {name}",
        subtitle: "Manchmal kann der Chatbot während eines Gesprächs einen Produktlink teilen — zum Beispiel ein Bild eines Artikels, den du kaufen kannst. Das kann passieren, wenn du es direkt fragst oder wenn das Thema natürlich eine Empfehlung inspiriert. Klicke auf \"Link hinzufügen\", um neue Produkt-URLs hinzuzufügen.",
        addButton: "Link hinzufügen",
        placeholder: "Produkt-URL eingeben",
        modalTitle: "Produktlink hinzufügen...",
        modalSubtitle: "Dies kann jede Website sein, die der Chatbot empfehlen soll"
      },
      personality: {
        name: "Name",
        description: "Beschreibung",
        childhoodExperiences: "Kindheitserfahrungen",
        personalDevelopment: "Persönliche Entwicklung",
        sexuality: "Sexualität",
        generalExperiences: "Allgemeine Erfahrungen",
        socialEnvironmentFriendships: "Soziales Umfeld & Freundschaften",
        educationLearning: "Bildung & Lernen",
        familyRelationships: "Familienbeziehungen",
        emotionalTriggers: "Emotionale Auslöser",
        characterTraits: "Charaktereigenschaften",
        positiveTraits: "Positive Eigenschaften",
        socialCommunicative: "Sozial & Kommunikativ",
        professionalCognitive: "Beruflich & Kognitiv",
        personalIntrinsic: "Persönlich & Intrinsisch",
        negativeTraits: "Negative Eigenschaften",
        areasOfInterest: "Interessensgebiete",
        communicationStyle: "Kommunikationsstil",
        tone: "Tonfall",
        wordChoice: "Wortwahl",
        responsePatterns: "Antwortmuster",
        humor: "Humor",
        humorEnabled: "Humor aktiviert",
        humorTypes: "Humorarten",
        humorIntensity: "Humorintensität",
        humorExclusionTopics: "Humor-Ausschlussthemen",
        addNew: "Neu hinzufügen",
        addNewTrait: "Neue Eigenschaft hinzufügen",
        addNewInterest: "Neues Interesse hinzufügen",
        addNewTrigger: "Neuen Auslöser hinzufügen",
        addNewHumorType: "Neuen Humortyp hinzufügen",
        addNewExclusionTopic: "Neues Ausschlussthema hinzufügen",
        placeholder: {
          name: "Name eingeben",
          description: "Beschreibung eingeben",
          trait: "Eigenschaft eingeben",
          interest: "Interesse eingeben",
          trigger: "Auslöser eingeben",
          humorType: "Humorart eingeben",
          exclusionTopic: "Ausschlussthema eingeben"
        }
      }
    }
  }
};

export function useI18n(locale: string = 'en') {
  return useMemo(() => {
    const currentMessages = messages[locale as keyof typeof messages] || messages.en;
    
    const t = (key: string, params?: Record<string, string>) => {
      const keys = key.split('.');
      let value: unknown = currentMessages;
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          console.warn(`Translation key not found: ${key}`);
          return key; // Return key if translation not found
        }
      }
      
      if (typeof value === 'string' && params) {
        return Object.entries(params).reduce((str, [key, val]) => {
          return str.replace(new RegExp(`{${key}}`, 'g'), val);
        }, value);
      }
      
      return typeof value === 'string' ? value : key;
    };

    const tCommon = (key: string) => {
      return t(`common.${key}`);
    };
    
    return { t, tCommon, locale };
  }, [locale]);
}
