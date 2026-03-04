export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { shipName } = req.body;
  if (!shipName) return res.status(400).json({ error: 'shipName required' });
  const today = new Date().toISOString().slice(0, 10);
  try {
    const searchRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: `Search for the upcoming port itinerary for the cruise ship "${shipName}" for voyages on or after ${today}. Check cruisemapper.com, cruisetimetables.com, or the cruise line website. List every port and date.` }]
      })
    });
    const searchData = await searchRes.json();
    if (!searchRes.ok) throw new Error(searchData?.error?.message || 'Search failed');
    const assistantBlocks = searchData.content;
    const toolResults = assistantBlocks
      .filter(b => b.type === 'tool_use')
      .map(b => ({ type: 'tool_result', tool_use_id: b.id, content: 'Included above' }));
    const formatRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: 'You output only raw valid JSON. No markdown, no backticks, no explanation.',
        messages: [
          { role: 'user', content: `Find itinerary for "${shipName}" from ${today}.` },
          { role: 'assistant', content: assistantBlocks },
          ...(toolResults.length ? [{ role: 'user', content: toolResults }] : []),
          { role: 'user', content: `Output ONLY this JSON:\n{"shipName":"...","cruiseLine":"...","source":"...","itinerary":[{"day":1,"date":"YYYY-MM-DD","port":"City, Country"}]}\nRules: dates>=${today}, sea days="At Sea", soonest voyage. If not found: {"error":"not found"}` }
        ]
      })
    });
    const formatData = await formatRes.json();
    if (!formatRes.ok) throw new Error(formatData?.error?.message || 'Format failed');
    const text = (formatData.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('').trim();
    let parsed = null, depth = 0, start = -1;
    for (let i = 0; i < text.length; i++) {
      if (text[i]==='{') { if(depth===0) start=i; depth++; }
      else if (text[i]==='}') { depth--; if(depth===0&&start!==-1) { try{parsed=JSON.parse(text.slice(start,i+1));break;}catch{start=-1;} } }
    }
    if (!parsed) return res.status(500).json({ error: 'Could not parse: '+text.slice(0,100) });
    if (parsed.error) return res.status(404).json({ error: 'Itinerary not found' });
    if (!Array.isArray(parsed.itinerary)||!parsed.itinerary.length) return res.status(404).json({ error: 'No upcoming ports found' });
    parsed.itinerary = parsed.itinerary.filter(s => s.date >= today);
    return res.status(200).json(parsed);
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
}
