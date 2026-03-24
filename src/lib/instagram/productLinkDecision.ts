export type ProductLink = {
  id?: string;
  url: string;
  actionType?: string;
  sendingBehavior?: string;
};

export type ProductDecisionInput = {
  links: ProductLink[];
  incomingMessageCount: number;
  lastPromoAt: string | null;
  latestUserMessage: string;
  now: Date;
};

export type ProductDecision =
  | {
      shouldSendPromo: true;
      reason: 'situational_trigger' | 'proactive_threshold';
      selectedLink: ProductLink;
    }
  | {
      shouldSendPromo: false;
      reason:
        | 'no_links'
        | 'no_eligible_link'
        | 'cooldown_active'
        | 'threshold_not_reached'
        | 'no_situational_intent';
      selectedLink: null;
    };

const SITUATIONAL_INTENT_PATTERNS: RegExp[] = [
  /\b(link|url|shop|store|buy|purchase|order)\b/i,
  /\b(price|cost|how much|kosten|preis)\b/i,
  /\b(wo kann ich|where can i|hast du.*link|do you have.*link)\b/i,
  /\b(recommend|empfehl|product|produkt)\b/i,
];

export function hasSituationalIntent(message: string): boolean {
  const normalized = message.trim();
  if (!normalized) return false;
  return SITUATIONAL_INTENT_PATTERNS.some((pattern) => pattern.test(normalized));
}

function normalizeLinks(links: ProductLink[]): ProductLink[] {
  return links
    .map((link) => ({
      ...link,
      actionType: link.actionType || 'buy',
      sendingBehavior: link.sendingBehavior || 'proactive',
    }))
    .filter((link) => typeof link.url === 'string' && link.url.trim().length > 0);
}

function isCooldownActive(lastPromoAt: string | null, now: Date): boolean {
  if (!lastPromoAt) return false;
  const parsed = Date.parse(lastPromoAt);
  if (Number.isNaN(parsed)) return false;
  const elapsed = now.getTime() - parsed;
  return elapsed < 24 * 60 * 60 * 1000;
}

export function decideProductLink(input: ProductDecisionInput): ProductDecision {
  const links = normalizeLinks(input.links);
  if (links.length === 0) {
    return { shouldSendPromo: false, reason: 'no_links', selectedLink: null };
  }

  if (isCooldownActive(input.lastPromoAt, input.now)) {
    return { shouldSendPromo: false, reason: 'cooldown_active', selectedLink: null };
  }

  const situationalLinks = links.filter((link) => link.sendingBehavior === 'situational');
  const proactiveLinks = links.filter((link) => link.sendingBehavior === 'proactive');
  const situationalIntent = hasSituationalIntent(input.latestUserMessage);

  if (situationalIntent) {
    if (situationalLinks.length > 0) {
      const selected = situationalLinks[0];
      if (!selected) {
        return { shouldSendPromo: false, reason: 'no_eligible_link', selectedLink: null };
      }
      return {
        shouldSendPromo: true,
        reason: 'situational_trigger',
        selectedLink: selected,
      };
    }
    return { shouldSendPromo: false, reason: 'no_eligible_link', selectedLink: null };
  }

  if (input.incomingMessageCount >= 5) {
    if (proactiveLinks.length > 0) {
      const selected = proactiveLinks[0];
      if (!selected) {
        return { shouldSendPromo: false, reason: 'no_eligible_link', selectedLink: null };
      }
      return {
        shouldSendPromo: true,
        reason: 'proactive_threshold',
        selectedLink: selected,
      };
    }
    return { shouldSendPromo: false, reason: 'no_eligible_link', selectedLink: null };
  }

  return { shouldSendPromo: false, reason: 'threshold_not_reached', selectedLink: null };
}
