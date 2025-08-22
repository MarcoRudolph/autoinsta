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
        modalSubtitle: "This can be any site the chatbot should recommend",
        actionTypes: {
          userShouldBuy: "User should buy",
          userShouldFollow: "User should follow",
          userShouldSubscribe: "User should subscribe"
        },
        sendingBehavior: {
          proactive: "Send proactively",
          situational: "Send in appropriate situation"
        }
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
      },
      terms: {
        title: "Terms of Use",
        lastUpdated: "Last updated",
        introduction: {
          title: "1. Introduction",
          content: "Welcome to rudolpho-chat! These Terms of Use govern the use of our AI-powered automation service for Instagram interactions. By using our service, you agree to these terms."
        },
        serviceDescription: {
          title: "2. Description of Our Service",
          functionality: {
            title: "2.1 How It Works",
            content: "rudolpho-chat is an AI-powered platform that allows you to create automated responses to Instagram direct messages and comments. Our service works as follows:"
          },
          metaInteraction: {
            title: "2.2 Interaction with Meta Platforms",
            content: "Our service interacts with Instagram (a Meta platform) through official APIs:"
          }
        },
        metaRelationship: {
          title: "3. Relationship to Meta Platforms, Inc.",
          independence: {
            title: "3.1 Independence from Meta",
            content: "Important Notice: rudolpho-chat is a completely independent service and is neither offered, sponsored, nor operated by Meta Platforms, Inc. We are an independent company with our own business models and technologies."
          },
          disclaimer: {
            title: "3.2 Disclaimer Regarding Meta",
            content: "Meta Platforms, Inc. is not responsible for:",
            conclusion: "We act as an independent service provider and are solely responsible for all aspects of our service."
          }
        },
        usageTerms: {
          title: "4. Terms of Use",
          allowed: {
            title: "4.1 Permitted Use",
            content: "You may only use our service for lawful purposes:"
          },
          prohibited: {
            title: "4.2 Prohibited Use",
            content: "The following uses are not permitted:"
          }
        },
        accounts: {
          title: "5. Accounts and Subscriptions",
          free: {
            title: "5.1 Free Use",
            content: "We offer a free plan with limited features:"
          },
          pro: {
            title: "5.2 Pro Subscription",
            content: "Our Pro plan offers extended features:",
            price: "Price: €10 per month, cancelable at any time"
          }
        },
        privacy: {
          title: "6. Privacy and Security",
          content: "The protection of your data is our top priority. All details about data processing can be found in our",
          privacyLink: "Privacy Policy",
          security: "We implement comprehensive security measures to protect your data and ensure compliance with all applicable data protection regulations."
        },
        liability: {
          title: "7. Liability and Warranty",
          content: "Our service is provided 'as is'. We make no warranty for uninterrupted availability or error-free functionality.",
          limitation: "Our liability is limited to the amount you paid for our service in the last 12 months."
        },
        changes: {
          title: "8. Changes to Terms of Use",
          content: "We reserve the right to change these Terms of Use as needed. Significant changes will be notified to you by email. Continued use of our service after changes constitutes acceptance of the new terms."
        },
        termination: {
          title: "9. Termination",
          content: "You can cancel your account at any time. Upon cancellation, all your data will be deleted within 30 days, unless legal retention periods apply.",
          rights: "We reserve the right to block or delete accounts that violate these Terms of Use.",
          dataDeletion: {
            title: "Data Deletion",
            content: "You can also delete your data before cancellation. A detailed guide can be found on our",
            link: "Data Deletion Page"
          }
        },
        contact: {
          title: "10. Contact",
          content: "For questions about these Terms of Use, you can reach us at:",
          email: "Email",
          address: "Address",
          phone: "Phone"
        },
        legal: {
          title: "11. Legal Basis",
          content: "These Terms of Use are subject to German law. Jurisdiction is, to the extent legally permissible, the seat of our company."
        },
        note: "Note: These Terms of Use may be updated as needed. Significant changes will be notified to you by email."
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
        modalSubtitle: "Dies kann jede Website sein, die der Chatbot empfehlen soll",
        actionTypes: {
          userShouldBuy: "Benutzer soll kaufen",
          userShouldFollow: "Benutzer soll folgen",
          userShouldSubscribe: "Benutzer soll abonnieren"
        },
        sendingBehavior: {
          proactive: "Proaktiv schicken",
          situational: "In passender Situation schicken"
        }
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
        },
        terms: {
          title: "Nutzungsbedingungen",
          lastUpdated: "Letzte Aktualisierung",
          introduction: {
            title: "1. Einleitung",
            content: "Willkommen bei rudolpho-chat! Diese Nutzungsbedingungen regeln die Nutzung unseres KI-gestützten Automatisierungsdienstes für Instagram-Interaktionen. Durch die Nutzung unseres Services stimmen Sie diesen Bedingungen zu."
          },
          serviceDescription: {
            title: "2. Beschreibung unseres Dienstes",
            functionality: {
              title: "2.1 Funktionsweise",
              content: "rudolpho-chat ist eine KI-gestützte Plattform, die es Ihnen ermöglicht, automatisierte Antworten auf Instagram-Direktnachrichten und Kommentare zu erstellen. Unser Service funktioniert folgendermaßen:"
            },
            metaInteraction: {
              title: "2.2 Interaktion mit Meta-Plattformen",
              content: "Unser Service interagiert mit Instagram (einer Meta-Plattform) über offizielle APIs:"
            }
          },
          metaRelationship: {
            title: "3. Beziehung zu Meta Platforms, Inc.",
            independence: {
              title: "3.1 Unabhängigkeit von Meta",
              content: "Wichtiger Hinweis: rudolpho-chat ist ein vollständig unabhängiger Dienst und wird weder von Meta Platforms, Inc. angeboten, gesponsert noch betrieben. Wir sind ein eigenständiges Unternehmen mit eigenen Geschäftsmodellen und Technologien."
            },
            disclaimer: {
              title: "3.2 Haftungsausschluss bezüglich Meta",
              content: "Meta Platforms, Inc. ist nicht verantwortlich für:",
              conclusion: "Wir handeln als unabhängiger Dienstleister und sind allein verantwortlich für alle Aspekte unseres Services."
            }
          },
          usageTerms: {
            title: "4. Nutzungsbedingungen",
            allowed: {
              title: "4.1 Erlaubte Nutzung",
              content: "Sie dürfen unseren Service nur für rechtmäßige Zwecke nutzen:"
            },
            prohibited: {
              title: "4.2 Verbotene Nutzung",
              content: "Folgende Nutzungen sind nicht erlaubt:"
            }
          },
          accounts: {
            title: "5. Konten und Abonnements",
            free: {
              title: "5.1 Kostenlose Nutzung",
              content: "Wir bieten einen kostenlosen Plan mit begrenzten Funktionen an:"
            },
            pro: {
              title: "5.2 Pro-Abonnement",
              content: "Unser Pro-Plan bietet erweiterte Funktionen:",
              price: "Preis: 10€ pro Monat, kündbar jederzeit"
            }
          },
          privacy: {
            title: "6. Datenschutz und Sicherheit",
            content: "Der Schutz Ihrer Daten hat für uns höchste Priorität. Alle Details zur Datenverarbeitung finden Sie in unserer",
            privacyLink: "Datenschutzerklärung",
            security: "Wir implementieren umfassende Sicherheitsmaßnahmen zum Schutz Ihrer Daten und gewährleisten die Einhaltung aller geltenden Datenschutzbestimmungen."
          },
          liability: {
            title: "7. Haftung und Gewährleistung",
            content: "Unser Service wird 'wie besehen' bereitgestellt. Wir übernehmen keine Gewährleistung für ununterbrochene Verfügbarkeit oder fehlerfreie Funktionalität.",
            limitation: "Unsere Haftung ist auf den Betrag begrenzt, den Sie in den letzten 12 Monaten für unseren Service gezahlt haben."
          },
          changes: {
            title: "8. Änderungen der Nutzungsbedingungen",
            content: "Wir behalten uns das Recht vor, diese Nutzungsbedingungen bei Bedarf zu ändern. Wesentliche Änderungen werden Ihnen per E-Mail mitgeteilt. Die fortgesetzte Nutzung unseres Services nach Änderungen gilt als Zustimmung zu den neuen Bedingungen."
          },
          termination: {
            title: "9. Kündigung",
            content: "Sie können Ihr Konto jederzeit kündigen. Bei Kündigung werden alle Ihre Daten innerhalb von 30 Tagen gelöscht, sofern keine gesetzlichen Aufbewahrungsfristen entgegenstehen.",
            rights: "Wir behalten uns das Recht vor, Konten zu sperren oder zu löschen, die gegen diese Nutzungsbedingungen verstoßen.",
            dataDeletion: {
              title: "Datenlöschung",
              content: "Sie können Ihre Daten auch vor der Kündigung selbst löschen. Eine detaillierte Anleitung finden Sie auf unserer",
              link: "Datenlöschungs-Seite"
            }
          },
          contact: {
            title: "10. Kontakt",
            content: "Bei Fragen zu diesen Nutzungsbedingungen erreichen Sie uns unter:",
            email: "E-Mail",
            address: "Adresse",
            phone: "Telefon"
          },
          legal: {
            title: "11. Rechtliche Grundlagen",
            content: "Diese Nutzungsbedingungen unterliegen deutschem Recht. Gerichtsstand ist, soweit gesetzlich zulässig, der Sitz unseres Unternehmens."
          },
          note: "Hinweis: Diese Nutzungsbedingungen können bei Bedarf aktualisiert werden. Wesentliche Änderungen werden Ihnen per E-Mail mitgeteilt."
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
