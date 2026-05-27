import { Hono } from 'hono';
import { reddit, context } from '@devvit/web/server';
import type { UiResponse } from '@devvit/web/shared';
import { CONFIG } from './config';

const app = new Hono();

// ── Types ─────────────────────────────────────────────────────────────────────

type ToxicityLabel = 'safe' | 'low' | 'medium' | 'high';

interface ToxicityResult {
  score:  number;
  label:  ToxicityLabel;
  flags:  string[];
  reason: string;
}

// ── AI: Groq Toxicity Analysis ────────────────────────────────────────────────

async function analyzeToxicity(text: string): Promise<ToxicityResult> {
  const fallback: ToxicityResult = {
    score:  0,
    label:  'safe',
    flags:  [],
    reason: 'Analysis unavailable',
  };

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${CONFIG.groqApiKey}`,
      },
      body: JSON.stringify({
        model:       'llama-3.3-70b-versatile',
        max_tokens:  150,
        temperature: 0.1,
        messages: [
          {
            role:    'system',
            content: `Return ONLY valid JSON, no markdown:
{"score":0.0,"label":"safe","flags":[],"reason":"..."}
score 0.0-1.0. label: safe(0-0.2) low(0.2-0.5) medium(0.5-0.8) high(0.8-1.0)
flags from: harassment,hate_speech,spam,violence,nsfw,doxxing`,
          },
          {
            role:    'user',
            content: `Analyze this Reddit content:\n${text.slice(0, 800)}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      console.error('[ModKit] Groq error:', res.status);
      return fallback;
    }

    const data  = await res.json() as {
      choices: Array<{ message: { content: string } }>;
    };
    const raw   = data.choices[0]?.message?.content ?? '';
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean) as ToxicityResult;

  } catch (err) {
    console.error('[ModKit] analyzeToxicity error:', err);
    return fallback;
  }
}

// ── Helper ────────────────────────────────────────────────────────────────────

function toxicityEmoji(label: ToxicityLabel): string {
  if (label === 'high')   return '🚨';
  if (label === 'medium') return '⚠️';
  if (label === 'low')    return '⬇️';
  return '✅';
}

// ── Menu: Analyze Post ────────────────────────────────────────────────────────

app.post('/internal/menu/analyze-post', async (c) => {
  const { postId } = context;

  if (!postId) {
    return c.json<UiResponse>({ showToast: '❌ Could not find post.' });
  }

  try {
    const post    = await reddit.getPostById(postId);
    const text    = `${post.title} ${post.body ?? ''}`;
    const result  = await analyzeToxicity(text);

    const emoji   = toxicityEmoji(result.label);
    const percent = Math.round(result.score * 100);
    const flags   = result.flags.length > 0 ? ` [${result.flags.join(', ')}]` : '';

    return c.json<UiResponse>({
      showToast: `${emoji} ${result.label.toUpperCase()} ${percent}%${flags} — ${result.reason}`,
    });

  } catch (err) {
    console.error('[ModKit] analyze-post error:', err);
    return c.json<UiResponse>({
      showToast: `❌ Error: ${String(err).slice(0, 80)}`,
    });
  }
});

// ── Menu: Analyze Comment ─────────────────────────────────────────────────────

app.post('/internal/menu/analyze-comment', async (c) => {
  const { commentId } = context;

  if (!commentId) {
    return c.json<UiResponse>({ showToast: '❌ Could not find comment.' });
  }

  try {
    const comment = await reddit.getCommentById(commentId);
    const result  = await analyzeToxicity(comment.body ?? '');

    const emoji   = toxicityEmoji(result.label);
    const percent = Math.round(result.score * 100);
    const flags   = result.flags.length > 0 ? ` [${result.flags.join(', ')}]` : '';

    return c.json<UiResponse>({
      showToast: `${emoji} Comment: ${result.label.toUpperCase()} ${percent}%${flags}`,
    });

  } catch (err) {
    console.error('[ModKit] analyze-comment error:', err);
    return c.json<UiResponse>({ showToast: '❌ Comment analysis failed.' });
  }
});

// ── Menu: Quick Stats (no storage needed) ────────────────────────────────────

app.post('/internal/menu/show-alerts', async (c) => {
  return c.json<UiResponse>({
    showToast: '🛡️ ModKit active — use "Analyze with ModKit" on any post or comment.',
  });
});

export default app;