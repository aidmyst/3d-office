import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

const root = process.cwd();
const transcriptRoot = path.join(process.env.USERPROFILE || '', '.gemini', 'antigravity', 'brain');
const port = Number(process.env.PORT || 8000);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.glb': 'model/gltf-binary', '.txt': 'text/plain; charset=utf-8' };

async function readLastLines(file, count = 8) {
  const lines = [];
  try {
    for await (const line of createInterface({ input: createReadStream(file), crlfDelay: Infinity })) {
      lines.push(line);
      if (lines.length > count) lines.shift();
    }
  } catch {}
  return lines;
}

async function getLastTool(file) {
  for (const line of await readLastLines(file)) {
    try {
      const entry = JSON.parse(line);
      if (entry.type === 'PLANNER_RESPONSE' && entry.tool_calls?.[0]?.name) return entry.tool_calls[0].name.replace(/_/g, ' ');
    } catch {}
  }
  return null;
}

async function getSubagents(sessionDir) {
  const result = [];
  const subagentDir = path.join(sessionDir, '.system_generated', 'subagents');
  try {
    for (const file of await fs.readdir(subagentDir)) {
      if (!file.endsWith('.json')) continue;
      try {
        const data = JSON.parse(await fs.readFile(path.join(subagentDir, file), 'utf8'));
        const id = data.conversationId || file.slice(0, -5);
        const transcript = path.join(transcriptRoot, id, '.system_generated', 'logs', 'transcript.jsonl');
        const stat = await fs.stat(transcript);
        const working = Date.now() - stat.mtimeMs < 90000 && data.state === 'SUBAGENT_STATE_ALIVE';
        result.push({ id, type: data.subagentDescriptor?.typeName || data.subagentDescriptor?.role || 'Agent', working, lastTool: working ? await getLastTool(transcript) : null, model: null });
      } catch {}
    }
  } catch {}
  return result;
}

async function latestActivity() {
  try {
    const brains = await fs.readdir(transcriptRoot, { withFileTypes: true });
    let latest = 0, recentSession = null;
    const agents = [];
    for (const brain of brains) {
      if (!brain.isDirectory() || brain.name === 'tempmediaStorage') continue;
      const sessionDir = path.join(transcriptRoot, brain.name);
      const transcript = path.join(sessionDir, '.system_generated', 'logs', 'transcript.jsonl');
      try {
        const stat = await fs.stat(transcript);
        if (stat.mtimeMs > latest) { latest = stat.mtimeMs; recentSession = transcript; }
      } catch {}
      agents.push(...await getSubagents(sessionDir));
    }
    const working = latest > 0 && Date.now() - latest < 90000;
    const activeAgents = agents.filter(agent => agent.working);
    return {
      connected: latest > 0,
      working,
      lastAction: working && recentSession ? await getLastTool(recentSession) || 'Agent sedang bekerja' : 'Menunggu aktivitas agent',
      model: null,
      modelSource: 'Provider tidak tercatat di metadata transcript Antigravity',
      agents: activeAgents.slice(0, 4),
      totalAgents: agents.length,
      activeAgents: activeAgents.length
    };
  } catch {
    return { connected: false, working: false, lastAction: 'Session tidak terbaca', model: null, agents: [], totalAgents: 0, activeAgents: 0 };
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname === '/api/activity') {
      const data = await latestActivity();
      res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
      res.end(JSON.stringify(data));
      return;
    }
    const requested = url.pathname === '/' ? '/index.html' : url.pathname;
    const file = path.resolve(root, `.${requested}`);
    if (file !== root && !file.startsWith(root + path.sep)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    const data = await fs.readFile(file);
    res.writeHead(200, { 'content-type': mime[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    if (!res.headersSent) {
      res.writeHead(404);
      res.end('Not found');
    }
  }
});

server.listen(port, '127.0.0.1', () => console.log(`Kantor 3D: http://127.0.0.1:${port}`));
