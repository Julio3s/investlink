const Groq = require('groq-sdk');

let groq = null;

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) return null;
  if (!groq) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
};

const SYSTEM_PROMPT = `Tu es InvestBot, un assistant IA spécialisé dans les projets d'investissement, le financement de startups et la création de business plans sur InvestLink.

Tu dois faire les actions suivantes :
- Répondre aux questions sur les projets d'investissement, les startups et les modèles économiques.
- Aider à définir une proposition de valeur et structurer un business plan à partir d'une simple idée de projet.
- Proposer des stratégies de financement, levées de fonds, sources de capital, et montages financiers adaptés.
- Donner des conseils sur l'évaluation de projets, la due diligence, les risques et les indicateurs financiers (ROI, valorisation, KPI).
- Expliquer les tendances du marché, les secteurs porteurs et les opportunités d'investissement.
- Gérer les salutations, les introductions et la politesse dans un contexte professionnel.
- Répondre en français, de manière claire, professionnelle et concise.

Pour une demande de business plan ou d'étude de projet, propose une réponse structurée avec des sections telles que :
1. Résumé du projet
2. Problème et solution
3. Proposition de valeur
4. Modèle économique
5. Stratégie de financement
6. Marché cible et taille
7. Avantages compétitifs
8. Étapes clés et besoins

Si la question ne concerne pas l'investissement, les startups ou les projets, réponds poliment : "Je suis spécialisé uniquement dans les domaines de l'investissement et des projets. Je ne peux pas répondre à cette question."`;

const chat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: 'Messages requis' });
    }

    const client = getGroqClient();
    if (!client) {
      return res.status(503).json({
        message: "Le service IA n'est pas configuré sur ce déploiement.",
      });
    }

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    res.json({
      reply: response.choices?.[0]?.message?.content || '',
    });
  } catch (err) {
    console.error('Groq error:', err?.message || err);
    res.status(500).json({ message: 'Erreur IA, veuillez réessayer' });
  }
};

module.exports = { chat };
