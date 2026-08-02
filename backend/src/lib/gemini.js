// Cliente mínimo para reescribir recetas vía IA de texto (OpenRouter, API
// compatible con OpenAI). Se usa fetch nativo en vez de un SDK por ser una
// sola llamada REST. El nombre del archivo se conserva por compatibilidad
// con las importaciones existentes (`../lib/gemini.js`), aunque el proveedor
// real ya no es Gemini sino OpenRouter.
const OPENROUTER_MODEL = 'nvidia/nemotron-3-super-120b-a12b:free';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const RECIPE_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    ingredients: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          quantity: { type: 'number' },
          unit: { type: 'string' },
        },
        required: ['name', 'quantity', 'unit'],
        additionalProperties: false,
      },
    },
    instructions: { type: 'array', items: { type: 'string' } },
    notes: { type: 'array', items: { type: 'string' } },
  },
  required: ['name', 'ingredients', 'instructions', 'notes'],
  additionalProperties: false,
};

/**
 * Pide al modelo que reescriba una receta reemplazando un ingrediente por su
 * equivalente SMAE, devolviendo JSON validado contra RECIPE_RESPONSE_SCHEMA.
 * Lanza si falta la API key, si la llamada de red falla, o si el modelo
 * devuelve algo que no es JSON parseable — el llamador decide cómo degradar.
 */
export async function rewriteRecipeWithGemini({
  recipe,
  originalIngredient,
  substituteIngredient,
  equivalentGroup,
  quantity,
}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY no está configurada en el backend');
  }

  const prompt = buildPrompt({
    recipe,
    originalIngredient,
    substituteIngredient,
    equivalentGroup,
    quantity,
  });

  let response;
  try {
    response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        temperature: 0.4,
        messages: [{ role: 'user', content: prompt }],
        response_format: {
          type: 'json_schema',
          json_schema: { name: 'recipe_rewrite', strict: true, schema: RECIPE_RESPONSE_SCHEMA },
        },
      }),
    });
  } catch (err) {
    throw new Error(`No se pudo contactar a la IA: ${err.message}`);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`La IA respondió ${response.status}: ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('La IA no devolvió contenido utilizable');
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('La IA devolvió una respuesta que no es JSON válido');
  }

  if (
    typeof parsed.name !== 'string' ||
    !Array.isArray(parsed.ingredients) ||
    !Array.isArray(parsed.instructions) ||
    !Array.isArray(parsed.notes)
  ) {
    throw new Error('El JSON de la IA no tiene la forma esperada');
  }

  return parsed;
}

function buildPrompt({ recipe, originalIngredient, substituteIngredient, equivalentGroup, quantity }) {
  const ingredientLines = recipe.ingredients
    .map((ing) => `- ${ing.name}: ${ing.quantity} ${ing.unit}`)
    .join('\n');
  const instructionLines = recipe.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n');

  return `Eres un chef mexicano y editor de recetas. Reescribe la siguiente receta \
reemplazando UN ingrediente por su equivalente nutrimental, manteniendo la receta \
culinariamente lógica y coherente.

RECETA ORIGINAL: "${recipe.name}"

Ingredientes:
${ingredientLines}

Preparación:
${instructionLines}

SUSTITUCIÓN A APLICAR:
- Ingrediente original: "${originalIngredient}"
- Reemplázalo por: "${substituteIngredient}" (mismo grupo del Sistema Mexicano de \
Alimentos Equivalentes: "${equivalentGroup}", ${quantity} ración(es))

INSTRUCCIONES PARA TI:
1. Ajusta la cantidad y unidad de "${substituteIngredient}" para que la ración \
sea nutricionalmente equivalente a la que tenía "${originalIngredient}".
2. Mantén el resto de los ingredientes sin cambios, salvo ajustes menores de \
condimento/técnica que el nuevo ingrediente exija razonablemente.
3. Reescribe los pasos de preparación que mencionen "${originalIngredient}" para \
que en su lugar describan cómo cocinar/preparar "${substituteIngredient}" de forma \
realista (tiempos de cocción, corte, técnica), sin inventar pasos innecesarios.
4. Si el ingrediente nuevo requiere una nota de seguridad o técnica (por ejemplo, \
temperaturas internas de cocción para proteínas de origen animal), agrégala en "notes".
5. No agregues ingredientes que no estaban ni elimines otros ingredientes originales.
6. Responde ÚNICAMENTE con el JSON solicitado, en español, sin texto fuera del JSON.`;
}
