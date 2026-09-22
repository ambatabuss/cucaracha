import { Plugin } from "@vendetta/plugins";
import { storage } from "@vendetta/plugin";
import { patcher, metro } from "@vendetta";
import { findByProps } from "@vendetta/metro";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import Settings from "./settings";

const { getCurrentUser } = findByProps("getCurrentUser");
const { getChannel } = findByProps("getChannel");
const { sendMessage } = findByProps("sendMessage");

// Helper: Escape special regex characters
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Helper: Strip Arabic diacritics (Tashkeel) for consistent matching
function normalizeText(text: string): string {
  return text.replace(/[\u064B-\u0652]/g, "");
}

// Helper: Check if keyword exists inside text with proper Unicode support
function matchesKeyword(content: string, keyword: string): boolean {
  if (!content || !keyword) return false;

  let text = normalizeText(content);
  let kw = normalizeText(keyword);

  if (!storage.caseSensitive) {
    text = text.toLowerCase();
    kw = kw.toLowerCase();
  }

  // Exact match
  if (storage.exactMatch) {
    return text.trim() === kw.trim();
  }

  // Whole word match using Unicode character classes (\p{L} matches any Unicode letter)
  if (storage.wholeWords) {
    const escapedKw = escapeRegex(kw);
    // (?<![\p{L}\p{N}_]) checks that no letter/number precedes the word
    // (?![\p{L}\p{N}_]) checks that no letter/number follows the word
    const regex = new RegExp(
      `(?<![\\p{L}\\p{N}_])${escapedKw}(?![\\p{L}\\p{N}_])`,
      storage.caseSensitive ? "u" : "iu"
    );
    return regex.test(text);
  }

  // Default / In Sentence match
  return text.includes(kw);
}

// Helper: Parse comma-separated ID strings
function parseIds(input: string): string[] {
  if (!input) return [];
  return input.split(",").map((id) => id.trim()).filter(Boolean);
}

let unpatch: () => void;

export default {
  onLoad: () => {
    // Default storage initialization
    storage.keywords ??= [];
    storage.showInSettings ??= true;
    storage.trackMode ??= "everyone";
    storage.ignoreBots ??= true;
    storage.trackEmbeds ??= false;
    storage.trackServers ??= true;
    storage.trackGroups ??= true;
    storage.trackDMs ??= true;

    const MessageActions = findByProps("receiveMessage", "sendMessage");

    if (!MessageActions) return;

    unpatch = patcher.before("receiveMessage", MessageActions, (args) => {
      const [, message] = args;
      if (!message || !storage.keywords || storage.keywords.length === 0) return;

      const currentUser = getCurrentUser();
      if (!currentUser || message.author?.id === currentUser.id) return;

      // Bot filter
      if (storage.ignoreBots && message.author?.bot) return;

      // Track target mode filtering
      if (storage.trackMode === "friends") {
        const RelationshipStore = findByProps("getRelationships");
        const isFriend = RelationshipStore?.isFriend?.(message.author?.id);
        if (!isFriend) return;
      } else if (storage.trackMode === "custom") {
        const customIds = parseIds(storage.customIds || "");
        if (!customIds.includes(message.author?.id)) return;
      }

      // Ignore user check
      if (storage.ignoreUsersEnabled) {
        const ignoredUsers = parseIds(storage.ignoredUserIds || "");
        if (ignoredUsers.includes(message.author?.id)) return;
      }

      // Location checks
      const channel = getChannel(message.channel_id);
      if (!channel) return;

      const isServer = !!channel.guild_id;
      const isGroup = channel.type === 3;
      const isDM = channel.type === 1;

      // Ignore server / channel check
      if (storage.ignoreServersEnabled && isServer) {
        const ignoredServers = parseIds(storage.ignoredServerIds || "");
        if (ignoredServers.includes(channel.guild_id)) {
          // Unless channel is explicitly allowed
          const trackedChannels = parseIds(storage.trackedChannelIds || "");
          if (!storage.trackChannelsEnabled || !trackedChannels.includes(channel.id)) {
            return;
          }
        }
      }

      if (storage.ignoreChannelsEnabled) {
        const ignoredChannels = parseIds(storage.ignoredChannelIds || "");
        if (ignoredChannels.includes(channel.id)) return;
      }

      if (isServer && !storage.trackServers) return;
      if (isGroup && !storage.trackGroups) return;
      if (isDM && !storage.trackDMs) return;

      // Content aggregation
      let contentToSearch = message.content || "";
      if (storage.trackEmbeds && message.embeds) {
        for (const embed of message.embeds) {
          if (embed.title) contentToSearch += " " + embed.title;
          if (embed.description) contentToSearch += " " + embed.description;
        }
      }

      // Keyword evaluation
      const matchedKeyword = storage.keywords.find((kw: string) =>
        matchesKeyword(contentToSearch, kw)
      );

      if (matchedKeyword) {
        const authorTag = `${message.author?.username || "Unknown"}`;
        const toastMsg = `Keyword matched: "${matchedKeyword}" from ${authorTag}`;
        
        showToast(toastMsg, getAssetIDByName("ChatCheckIcon"));

        // External notification routing
        if (storage.sendNotificationToChannel && storage.targetChannelId) {
          sendMessage(storage.targetChannelId, {
            content: `🔔 **Keyword Matched:** \`${matchedKeyword}\` in <#${message.channel_id}>\n**User:** ${authorTag}\n**Message:** ${message.content}`
          });
        }

        if (storage.sendNotificationToWebhook && storage.webhookUrl) {
          fetch(storage.webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: `🔔 **Keyword Matched:** \`${matchedKeyword}\` in <#${message.channel_id}>\n**User:** ${authorTag}\n**Message:** ${message.content}`
            })
          }).catch(() => {});
        }
      }
    });
  },

  onUnload: () => {
    if (unpatch) unpatch();
  },

  settings: Settings,
};
