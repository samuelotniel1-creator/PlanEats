// Datos semilla en memoria — misma forma que el esquema de Postgres (db/schema.sql).
// Ingredientes y recetas pensados para conseguirse en un supermercado o mercado en México.

let idCounter = 1;
const nextId = (prefix) => `${prefix}_${idCounter++}`;

const ingredient = (name, isPerishable, defaultUnit = 'unidad') => ({
  id: nextId('ing'),
  name,
  isPerishable,
  defaultUnit,
});

export const ingredients = [
  ingredient('huevo', true, 'pieza'),
  ingredient('avena', false, 'g'),
  ingredient('leche', true, 'ml'),
  ingredient('plátano', true, 'pieza'),
  ingredient('miel', false, 'cda'),
  ingredient('canela en polvo', false, 'pizca'),
  ingredient('aguacate', true, 'pieza'),
  ingredient('tortilla de maíz', true, 'pieza'),
  ingredient('jitomate', true, 'pieza'),
  ingredient('cebolla blanca', false, 'pieza'),
  ingredient('chile serrano', true, 'pieza'),
  ingredient('cilantro', true, 'manojo'),
  ingredient('tomate verde', true, 'g'),
  ingredient('pechuga de pollo', true, 'g'),
  ingredient('crema ácida', true, 'cda'),
  ingredient('queso panela', true, 'g'),
  ingredient('pan bolillo', true, 'pieza'),
  ingredient('frijoles refritos', false, 'g'),
  ingredient('queso oaxaca', true, 'g'),
  ingredient('garbanzo cocido', false, 'g'),
  ingredient('pepino', true, 'pieza'),
  ingredient('limón', true, 'pieza'),
  ingredient('arroz', false, 'g'),
  ingredient('brócoli', true, 'g'),
  ingredient('elote', true, 'pieza'),
  ingredient('frijol negro cocido', false, 'g'),
  ingredient('papa', false, 'pieza'),
  ingredient('zanahoria', false, 'pieza'),
  ingredient('pavo molido', true, 'g'),
  ingredient('filete de tilapia', true, 'g'),
  ingredient('espárragos', true, 'g'),
  ingredient('champiñones', true, 'g'),
  ingredient('queso parmesano', true, 'g'),
  ingredient('pasta', false, 'g'),
  ingredient('lentejas', false, 'g'),
  ingredient('comino en polvo', false, 'pizca'),
  ingredient('pimiento morrón', true, 'pieza'),
  ingredient('aceite de oliva', false, 'cda'),
  ingredient('ajo', false, 'diente'),
  ingredient('espinaca', true, 'g'),
  ingredient('yogurt natural', true, 'g'),
  ingredient('fresa', true, 'pieza'),
  ingredient('nuez', false, 'cda'),
  ingredient('atún en agua', false, 'g'),
  ingredient('tortilla de harina', true, 'pieza'),
  ingredient('jamón de pavo', true, 'rebanada'),
  ingredient('chile poblano', true, 'pieza'),
  ingredient('bistec de res', true, 'g'),
  ingredient('carne molida de res', true, 'g'),
  ingredient('calabacita', true, 'pieza'),
  ingredient('camote', false, 'pieza'),
  ingredient('lechuga', true, 'taza'),
  ingredient('muslo de pollo', true, 'pieza'),
  ingredient('salmón', true, 'g'),
  ingredient('camarón', true, 'g'),
  ingredient('piña', true, 'g'),
  ingredient('mango', true, 'pieza'),
  ingredient('naranja', true, 'pieza'),
  ingredient('manzana', true, 'pieza'),
  ingredient('cebolla morada', false, 'pieza'),
  ingredient('chile guajillo', false, 'pieza'),
  ingredient('chile ancho', false, 'pieza'),
  ingredient('nopal', true, 'pieza'),
  ingredient('queso manchego', true, 'g'),
  ingredient('tocino', true, 'rebanada'),
  ingredient('masa de maíz', true, 'g'),
  ingredient('chorizo', true, 'g'),
];

const byName = Object.fromEntries(ingredients.map((i) => [i.name, i]));
const ri = (name, quantity, unit) => ({ ingredientId: byName[name].id, name, quantity, unit });

// --- Helpers para instrucciones que se recalculan según las porciones pedidas ---

function fmt(q) {
  const rounded = Math.round(q * 100) / 100;
  if (Math.abs(rounded - 0.5) < 0.01) return '1/2';
  if (Math.abs(rounded - 0.25) < 0.01) return '1/4';
  if (Math.abs(rounded - 0.75) < 0.01) return '3/4';
  return String(rounded);
}

function find(list, name) {
  const item = list.find((i) => i.name === name);
  if (!item) throw new Error(`ingrediente "${name}" no está en la lista de esta receta`);
  return item;
}

/** "300 g", "2 dientes" — cantidad + unidad, para medidas de despensa. */
function amt(list, name) {
  const item = find(list, name);
  return `${fmt(item.quantity)} ${item.unit}`;
}

/** "4 huevos" / "1 huevo" / "1/2 cebolla" — cantidad + sustantivo (sin artículo), singular/plural correcto. */
function noun(list, name, singular, plural) {
  const item = find(list, name);
  const n = item.quantity;
  return `${fmt(n)} ${n <= 1 ? singular : plural}`;
}

const recipe = (name, mealType, dietTags, allergenTags, prepMinutes, cookMinutes, servings, ingredientsList, instructionsFn) => ({
  id: nextId('rec'),
  name,
  mealType,
  dietTags,
  allergenTags,
  prepMinutes,
  cookMinutes,
  servings,
  ingredients: ingredientsList,
  instructionsFn,
});

export const recipes = [
  recipe('Huevos a la mexicana', 'breakfast', ['vegetarian'], ['huevo'], 8, 8, 2, [
    ri('huevo', 4, 'pieza'), ri('jitomate', 1, 'pieza'), ri('cebolla blanca', 0.5, 'pieza'), ri('chile serrano', 1, 'pieza'), ri('tortilla de maíz', 4, 'pieza'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Pica finamente ${noun(ing, 'jitomate', 'jitomate', 'jitomates')}, ${noun(ing, 'cebolla blanca', 'cebolla', 'cebollas')} y el chile serrano (retira las semillas si quieres menos picor).`,
    `Calienta ${amt(ing, 'aceite de oliva')} de aceite en un sartén a fuego medio (30 seg) y acitrona la cebolla y el chile durante 2 minutos.`,
    'Agrega el jitomate picado y cocina 3 minutos, moviendo ocasionalmente, hasta que suelte su jugo y reduzca un poco.',
    `Bate ${noun(ing, 'huevo', 'huevo', 'huevos')} con una pizca de sal y viértelos en el sartén. Cocina a fuego bajo 3-4 minutos, revolviendo cada 30 segundos, hasta que cuajen suaves.`,
    `Sirve de inmediato con ${noun(ing, 'tortilla de maíz', 'tortilla', 'tortillas')} calientes (30 seg por lado en un comal).`,
  ]),
  recipe('Chilaquiles verdes con pollo', 'breakfast', [], ['lácteos'], 10, 15, 2, [
    ri('tortilla de maíz', 8, 'pieza'), ri('tomate verde', 250, 'g'), ri('chile serrano', 1, 'pieza'), ri('pechuga de pollo', 150, 'g'), ri('crema ácida', 2, 'cda'), ri('queso panela', 40, 'g'), ri('cebolla blanca', 0.25, 'pieza'), ri('aceite de oliva', 2, 'cda'),
  ], (ing) => [
    `Coloca ${amt(ing, 'tomate verde')} de tomate verde (sin cáscara) y el chile serrano en una olla, cubre con agua y hierve 8 minutos hasta que cambien de color.`,
    'Licúa el tomate y el chile con un poco del agua de cocción y una pizca de sal, hasta obtener una salsa tersa.',
    `Mientras, cuece ${amt(ing, 'pechuga de pollo')} de pechuga de pollo en agua con sal durante 12-15 minutos; deshebra cuando enfríe un poco.`,
    `Corta ${noun(ing, 'tortilla de maíz', 'tortilla', 'tortillas')} en triángulos y fríelas en ${amt(ing, 'aceite de oliva')} de aceite, 3-4 minutos por tanda, hasta dorar (o usa totopos ya listos).`,
    'Calienta la salsa verde 2 minutos, agrega los totopos y el pollo deshebrado; mezcla suavemente 1-2 minutos para que se impregnen sin deshacerse.',
    `Sirve de inmediato con ${amt(ing, 'crema ácida')} de crema y ${amt(ing, 'queso panela')} de queso panela repartidos, y cebolla picada encima.`,
  ]),
  recipe('Avena con plátano y miel', 'breakfast', ['vegetarian'], ['lácteos'], 5, 5, 1, [
    ri('avena', 60, 'g'), ri('leche', 200, 'ml'), ri('plátano', 1, 'pieza'), ri('miel', 1, 'cda'), ri('canela en polvo', 1, 'pizca'),
  ], (ing) => [
    `Calienta ${amt(ing, 'leche')} de leche en una olla pequeña a fuego medio durante 2 minutos, sin dejar que hierva.`,
    `Agrega ${amt(ing, 'avena')} de avena y cocina a fuego bajo 5 minutos, moviendo cada minuto, hasta que espese.`,
    'Vierte en un tazón y deja reposar 1 minuto.',
    `Corta ${noun(ing, 'plátano', 'plátano', 'plátanos')} en rodajas y colócalo encima; agrega ${amt(ing, 'miel')} de miel y una pizca de canela.`,
  ]),
  recipe('Molletes', 'breakfast', ['vegetarian'], ['gluten', 'lácteos'], 5, 8, 2, [
    ri('pan bolillo', 2, 'pieza'), ri('frijoles refritos', 150, 'g'), ri('queso oaxaca', 60, 'g'), ri('jitomate', 1, 'pieza'), ri('cebolla blanca', 0.25, 'pieza'), ri('chile serrano', 1, 'pieza'),
  ], (ing) => [
    'Precalienta el horno o comal a fuego medio.',
    `Corta ${noun(ing, 'pan bolillo', 'bolillo', 'bolillos')} a la mitad a lo largo y unta ${amt(ing, 'frijoles refritos')} de frijoles refritos en total, repartidos entre las mitades.`,
    `Reparte ${amt(ing, 'queso oaxaca')} de queso oaxaca deshebrado encima y hornea (o gratina en sartén tapado) 6-8 minutos, hasta que el queso derrita por completo.`,
    'Mientras se gratina, pica finamente el jitomate, la cebolla y el chile para un pico de gallo rápido; sazona con sal.',
    'Sirve los molletes recién salidos del horno con el pico de gallo encima.',
  ]),
  recipe('Ensalada de garbanzo y aguacate', 'lunch', ['vegetarian', 'vegan'], [], 12, 0, 2, [
    ri('garbanzo cocido', 200, 'g'), ri('pepino', 1, 'pieza'), ri('jitomate', 1, 'pieza'), ri('aguacate', 1, 'pieza'), ri('limón', 1, 'pieza'), ri('aceite de oliva', 1, 'cda'), ri('cilantro', 1, 'manojo'),
  ], (ing) => [
    `Escurre y enjuaga ${amt(ing, 'garbanzo cocido')} de garbanzo cocido.`,
    `Corta ${noun(ing, 'pepino', 'pepino', 'pepinos')}, ${noun(ing, 'jitomate', 'jitomate', 'jitomates')} y ${noun(ing, 'aguacate', 'aguacate', 'aguacates')} en cubos de aproximadamente 1 cm (unos 5 minutos).`,
    'Mezcla todo en un tazón grande junto con los garbanzos y el cilantro picado.',
    `Exprime ${noun(ing, 'limón', 'limón', 'limones')}, agrega ${amt(ing, 'aceite de oliva')} de aceite de oliva y sal al gusto; mezcla bien. Sirve de inmediato o refrigera hasta 1 día.`,
  ]),
  recipe('Pollo a la plancha con arroz y brócoli', 'lunch', [], [], 10, 20, 2, [
    ri('pechuga de pollo', 200, 'g'), ri('arroz', 100, 'g'), ri('brócoli', 150, 'g'), ri('ajo', 2, 'diente'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Enjuaga ${amt(ing, 'arroz')} de arroz y cuécelo con el doble de agua y una pizca de sal: 2 minutos a fuego alto hasta hervir, luego 15 minutos tapado a fuego bajo.`,
    `Sazona ${amt(ing, 'pechuga de pollo')} de pechuga con sal y pimienta; cocínala en un sartén caliente 5-6 minutos por lado hasta que esté bien cocida por dentro. Deja reposar 3 minutos y rebana.`,
    `Corta ${amt(ing, 'brócoli')} de brócoli en floretes y cuécelo al vapor 5 minutos, hasta que esté suave pero firme.`,
    `Pica ${noun(ing, 'ajo', 'diente de ajo', 'dientes de ajo')} y saltéalo en ${amt(ing, 'aceite de oliva')} de aceite de oliva 1 minuto hasta que aromatice.`,
    'Sirve el pollo rebanado sobre el arroz, acompañado del brócoli y el ajo salteado encima.',
  ]),
  recipe('Tacos de frijol negro con elote', 'lunch', ['vegetarian', 'vegan'], [], 10, 10, 2, [
    ri('frijol negro cocido', 200, 'g'), ri('tortilla de maíz', 6, 'pieza'), ri('elote', 1, 'pieza'), ri('cebolla blanca', 0.5, 'pieza'), ri('limón', 1, 'pieza'), ri('comino en polvo', 1, 'pizca'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Calienta ${amt(ing, 'frijol negro cocido')} de frijol negro en una olla a fuego bajo con la pizca de comino, machacando ligeramente con un tenedor durante 5 minutos.`,
    `Desgrana ${noun(ing, 'elote', 'elote', 'elotes')} crudo y saltéalo en ${amt(ing, 'aceite de oliva')} de aceite 3-4 minutos hasta que dore un poco.`,
    `Calienta ${noun(ing, 'tortilla de maíz', 'tortilla', 'tortillas')} en un comal, 30 segundos por lado.`,
    'Rellena cada tortilla con frijoles y elote salteado.',
    'Agrega cebolla blanca picada y un chorrito de limón al gusto.',
  ]),
  recipe('Picadillo de pavo con papa y zanahoria', 'lunch', [], [], 10, 18, 2, [
    ri('pavo molido', 200, 'g'), ri('papa', 1, 'pieza'), ri('zanahoria', 1, 'pieza'), ri('jitomate', 1, 'pieza'), ri('ajo', 2, 'diente'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Corta ${noun(ing, 'papa', 'papa', 'papas')} y ${noun(ing, 'zanahoria', 'zanahoria', 'zanahorias')} en cubos pequeños (0.5 cm) y cuécelas 5 minutos en agua hirviendo; escurre.`,
    `Calienta ${amt(ing, 'aceite de oliva')} de aceite y dora ${amt(ing, 'pavo molido')} de pavo molido con el ajo picado durante 5-6 minutos, deshaciendo grumos con una cuchara.`,
    'Agrega el jitomate picado, la papa y la zanahoria precocidas; cocina 8-10 minutos más a fuego medio, moviendo cada 2 minutos, hasta que todo esté suave.',
    'Sazona con sal y pimienta al gusto y sirve caliente.',
  ]),
  recipe('Tilapia al horno con espárragos', 'dinner', [], ['pescado'], 8, 15, 2, [
    ri('filete de tilapia', 300, 'g'), ri('espárragos', 150, 'g'), ri('limón', 1, 'pieza'), ri('aceite de oliva', 1, 'cda'), ri('ajo', 1, 'diente'),
  ], (ing) => [
    'Precalienta el horno a 200°C durante 10 minutos.',
    `Corta la base leñosa de ${amt(ing, 'espárragos')} de espárragos y colócalos junto con ${amt(ing, 'filete de tilapia')} de filete de tilapia en una charola.`,
    `Baña con ${amt(ing, 'aceite de oliva')} de aceite de oliva, el ajo picado, sal, pimienta y rodajas de limón.`,
    'Hornea 12-15 minutos, hasta que el pescado se desmenuce fácilmente con un tenedor y los espárragos estén tiernos.',
    'Sirve de inmediato con el jugo de la charola por encima.',
  ]),
  recipe('Arroz con lentejas y verduras', 'dinner', ['vegetarian', 'vegan'], [], 10, 20, 2, [
    ri('arroz', 100, 'g'), ri('lentejas', 100, 'g'), ri('zanahoria', 1, 'pieza'), ri('cebolla blanca', 0.5, 'pieza'), ri('ajo', 2, 'diente'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Enjuaga ${amt(ing, 'lentejas')} de lentejas y cuécelas en agua con sal (el triple de agua que de lentejas), 18-20 minutos a fuego medio-bajo, hasta que estén suaves; escurre el exceso de agua.`,
    `Aparte, cuece ${amt(ing, 'arroz')} de arroz: 2 minutos a fuego alto hasta hervir, luego 15 minutos tapado a fuego bajo.`,
    `Pica la cebolla, el ajo y ${noun(ing, 'zanahoria', 'zanahoria', 'zanahorias')} en cubos pequeños; sofríe en ${amt(ing, 'aceite de oliva')} de aceite de oliva 5 minutos hasta que la zanahoria esté suave.`,
    'Mezcla el arroz, las lentejas y el sofrito en la misma olla y calienta 2 minutos más antes de servir.',
  ]),
  recipe('Pasta con champiñones y parmesano', 'dinner', ['vegetarian'], ['gluten', 'lácteos'], 10, 15, 2, [
    ri('pasta', 200, 'g'), ri('champiñones', 150, 'g'), ri('queso parmesano', 40, 'g'), ri('ajo', 2, 'diente'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Cuece ${amt(ing, 'pasta')} de pasta en agua con sal según las instrucciones del paquete (normalmente 8-10 minutos); reserva un poco de agua de cocción antes de escurrir.`,
    `Mientras hierve la pasta, rebana ${amt(ing, 'champiñones')} de champiñones y el ajo.`,
    `Calienta ${amt(ing, 'aceite de oliva')} de aceite de oliva y saltea el ajo 30 segundos, agrega los champiñones y cocina 5-6 minutos hasta que doren y suelten su agua.`,
    `Añade la pasta escurrida a los champiñones junto con ${amt(ing, 'queso parmesano')} de queso parmesano rallado y un poco de agua de cocción; mezcla 1-2 minutos a fuego bajo hasta que quede cremosa.`,
    'Sazona con sal y pimienta al gusto y sirve de inmediato.',
  ]),
  recipe('Sopa de lentejas con zanahoria', 'dinner', ['vegetarian', 'vegan'], [], 10, 25, 2, [
    ri('lentejas', 150, 'g'), ri('zanahoria', 2, 'pieza'), ri('ajo', 2, 'diente'), ri('comino en polvo', 1, 'pizca'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Pica ${noun(ing, 'zanahoria', 'zanahoria', 'zanahorias')} y el ajo; sofríe en ${amt(ing, 'aceite de oliva')} de aceite de oliva a fuego medio 4-5 minutos hasta suavizar.`,
    `Enjuaga ${amt(ing, 'lentejas')} de lentejas y agrégalas a la olla junto con la pizca de comino y agua suficiente para cubrir (unas 5 tazas por cada 150 g de lentejas).`,
    'Sube el fuego hasta que hierva (3-4 minutos), luego baja a fuego medio-bajo y deja cocer, tapado, 20 minutos, hasta que las lentejas estén suaves.',
    'Sazona con sal al gusto. Licúa parcialmente si prefieres una textura más espesa, o sirve tal cual.',
  ]),
  recipe('Fajitas de pollo con pimiento', 'dinner', [], [], 10, 15, 2, [
    ri('pechuga de pollo', 200, 'g'), ri('pimiento morrón', 1, 'pieza'), ri('cebolla blanca', 0.5, 'pieza'), ri('limón', 1, 'pieza'), ri('arroz', 100, 'g'), ri('comino en polvo', 1, 'pizca'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Cuece ${amt(ing, 'arroz')} de arroz: 2 minutos a fuego alto hasta hervir, luego 15 minutos tapado a fuego bajo.`,
    `Corta ${amt(ing, 'pechuga de pollo')} de pollo, ${noun(ing, 'pimiento morrón', 'pimiento morrón', 'pimientos morrones')} y la cebolla en tiras delgadas (5 minutos).`,
    `Calienta ${amt(ing, 'aceite de oliva')} de aceite de oliva a fuego alto y sella el pollo con la pizca de comino y sal, 4-5 minutos, moviendo ocasionalmente.`,
    'Agrega el pimiento y la cebolla; cocina 4-5 minutos más hasta que las verduras doren ligeramente pero sigan crujientes.',
    'Sirve sobre el arroz con un chorrito de limón al gusto.',
  ]),
  recipe('Licuado de plátano y avena', 'breakfast', ['vegetarian'], ['lácteos'], 5, 0, 1, [
    ri('leche', 250, 'ml'), ri('avena', 40, 'g'), ri('plátano', 1, 'pieza'), ri('miel', 1, 'cda'),
  ], (ing) => [
    `Licúa ${amt(ing, 'leche')} de leche con ${amt(ing, 'avena')} de avena, ${noun(ing, 'plátano', 'el plátano', 'los plátanos')} y ${amt(ing, 'miel')} de miel durante 1 minuto, hasta que quede tersa.`,
    'Sirve de inmediato bien frío, o con hielos.',
  ]),
  recipe('Yogurt con fresas y nuez', 'breakfast', ['vegetarian'], ['lácteos', 'frutos secos'], 5, 0, 1, [
    ri('yogurt natural', 200, 'g'), ri('fresa', 6, 'pieza'), ri('nuez', 1, 'cda'), ri('miel', 1, 'cda'),
  ], (ing) => [
    `Sirve ${amt(ing, 'yogurt natural')} de yogurt natural en un tazón.`,
    `Rebana ${noun(ing, 'fresa', 'la fresa', 'las fresas')} y colócalas encima.`,
    `Agrega ${amt(ing, 'nuez')} de nuez picada y un chorrito de miel.`,
  ]),
  recipe('Ensalada de atún', 'lunch', [], ['pescado'], 10, 0, 2, [
    ri('atún en agua', 140, 'g'), ri('pepino', 1, 'pieza'), ri('jitomate', 1, 'pieza'), ri('cebolla blanca', 0.25, 'pieza'), ri('limón', 1, 'pieza'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Escurre ${amt(ing, 'atún en agua')} de atún.`,
    `Corta ${noun(ing, 'pepino', 'el pepino', 'los pepinos')} y ${noun(ing, 'jitomate', 'el jitomate', 'los jitomates')} en cubos, y pica finamente la cebolla (5 minutos).`,
    `Mezcla el atún con las verduras, el jugo de limón y ${amt(ing, 'aceite de oliva')} de aceite de oliva; sazona con sal y pimienta.`,
    'Sirve frío, solo o acompañado de tostadas.',
  ]),
  recipe('Quesadillas de queso', 'lunch', ['vegetarian'], ['gluten', 'lácteos'], 8, 8, 2, [
    ri('tortilla de harina', 4, 'pieza'), ri('queso oaxaca', 120, 'g'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Deshebra ${amt(ing, 'queso oaxaca')} de queso oaxaca y rellena ${noun(ing, 'tortilla de harina', 'la tortilla', 'las tortillas')} de harina, doblando a la mitad.`,
    `Calienta ${amt(ing, 'aceite de oliva')} de aceite en un comal o sartén a fuego medio.`,
    'Cocina las quesadillas 2-3 minutos por lado, hasta que doren y el queso derrita por completo.',
  ]),
  recipe('Torta de jamón y aguacate', 'lunch', [], ['gluten', 'lácteos'], 8, 0, 1, [
    ri('pan bolillo', 1, 'pieza'), ri('jamón de pavo', 4, 'rebanada'), ri('queso panela', 40, 'g'), ri('aguacate', 0.5, 'pieza'), ri('jitomate', 0.5, 'pieza'),
  ], (ing) => [
    `Corta ${noun(ing, 'pan bolillo', 'el bolillo', 'los bolillos')} a la mitad y unta el aguacate machacado en ambas caras.`,
    `Rellena con ${noun(ing, 'jamón de pavo', 'la rebanada de jamón', 'las rebanadas de jamón')}, ${amt(ing, 'queso panela')} de queso panela y rodajas de jitomate.`,
    'Sirve de inmediato, o gratina 3-4 minutos en un sartén tapado si prefieres el queso derretido.',
  ]),
  recipe('Rajas con crema', 'dinner', ['vegetarian'], ['lácteos'], 10, 15, 2, [
    ri('chile poblano', 2, 'pieza'), ri('crema ácida', 3, 'cda'), ri('cebolla blanca', 0.5, 'pieza'), ri('elote', 1, 'pieza'), ri('queso oaxaca', 60, 'g'),
  ], (ing) => [
    `Asa ${noun(ing, 'chile poblano', 'el chile poblano', 'los chiles poblanos')} directo al fuego hasta que la piel se ampolle; suda 5 minutos en una bolsa cerrada y pela.`,
    'Corta los chiles en rajas (tiras) y retira las semillas.',
    `Acitrona la cebolla en un sartén 3 minutos, agrega el elote desgranado y las rajas; cocina 5 minutos más.`,
    `Incorpora ${amt(ing, 'crema ácida')} de crema y ${amt(ing, 'queso oaxaca')} de queso oaxaca; cocina a fuego bajo 3-4 minutos hasta que el queso derrita.`,
  ]),
  recipe('Carne asada con papas', 'dinner', [], [], 10, 15, 2, [
    ri('bistec de res', 200, 'g'), ri('papa', 2, 'pieza'), ri('cebolla blanca', 0.5, 'pieza'), ri('limón', 1, 'pieza'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Corta ${noun(ing, 'papa', 'la papa', 'las papas')} en cubos y cuécelas 8-10 minutos en agua hirviendo con sal, hasta que estén suaves; escurre.`,
    `Sazona ${amt(ing, 'bistec de res')} de bistec con sal y pimienta; sella en un sartén caliente con ${amt(ing, 'aceite de oliva')} de aceite, 3-4 minutos por lado.`,
    'Deja reposar la carne 3 minutos y corta en tiras.',
    'Saltea la cebolla y las papas en el mismo sartén 3-4 minutos; sirve todo junto con un chorrito de limón.',
  ]),
  recipe('Espagueti rojo', 'dinner', ['vegetarian'], ['gluten', 'lácteos'], 10, 15, 2, [
    ri('pasta', 200, 'g'), ri('jitomate', 2, 'pieza'), ri('ajo', 2, 'diente'), ri('cebolla blanca', 0.25, 'pieza'), ri('queso parmesano', 30, 'g'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Cuece ${amt(ing, 'pasta')} de pasta en agua con sal según las instrucciones del paquete.`,
    `Licúa ${noun(ing, 'jitomate', 'el jitomate', 'los jitomates')}, el ajo y la cebolla hasta obtener una salsa tersa.`,
    `Calienta ${amt(ing, 'aceite de oliva')} de aceite y cocina la salsa 6-8 minutos a fuego medio, hasta que espese y reduzca.`,
    `Mezcla la pasta escurrida con la salsa y ${amt(ing, 'queso parmesano')} de queso parmesano rallado; sirve caliente.`,
  ]),

  // --- Desayunos adicionales ---
  recipe('Huevos revueltos con jamón', 'breakfast', [], ['huevo', 'lácteos'], 6, 6, 2, [
    ri('huevo', 4, 'pieza'), ri('jamón de pavo', 4, 'rebanada'), ri('queso oaxaca', 40, 'g'),
  ], (ing) => [
    `Pica ${noun(ing, 'jamón de pavo', 'la rebanada de jamón', 'las rebanadas de jamón')} en cuadros pequeños.`,
    `Bate ${noun(ing, 'huevo', 'el huevo', 'los huevos')} con una pizca de sal y cocina en un sartén a fuego bajo, moviendo cada 30 segundos.`,
    `Cuando empiecen a cuajar, agrega el jamón y ${amt(ing, 'queso oaxaca')} de queso oaxaca; cocina 2 minutos más hasta que el queso derrita.`,
  ]),
  recipe('Huevos estrellados con frijoles', 'breakfast', ['vegetarian'], ['huevo'], 5, 8, 2, [
    ri('huevo', 4, 'pieza'), ri('frijoles refritos', 150, 'g'), ri('tortilla de maíz', 4, 'pieza'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Calienta ${amt(ing, 'frijoles refritos')} de frijoles refritos en una olla a fuego bajo.`,
    `Fríe ${noun(ing, 'huevo', 'el huevo', 'los huevos')} en un sartén con ${amt(ing, 'aceite de oliva')} de aceite, 2-3 minutos, hasta que la clara esté firme y la yema siga suave.`,
    `Calienta ${noun(ing, 'tortilla de maíz', 'la tortilla', 'las tortillas')} y sirve con los frijoles y los huevos estrellados encima.`,
  ]),
  recipe('Chilaquiles rojos con huevo', 'breakfast', ['vegetarian'], ['huevo', 'lácteos'], 10, 15, 2, [
    ri('tortilla de maíz', 8, 'pieza'), ri('jitomate', 3, 'pieza'), ri('chile guajillo', 2, 'pieza'), ri('huevo', 2, 'pieza'), ri('crema ácida', 2, 'cda'), ri('queso oaxaca', 40, 'g'), ri('cebolla blanca', 0.25, 'pieza'), ri('aceite de oliva', 2, 'cda'),
  ], (ing) => [
    `Hierve ${noun(ing, 'jitomate', 'el jitomate', 'los jitomates')} y ${noun(ing, 'chile guajillo', 'el chile guajillo', 'los chiles guajillo')} (sin semillas) 8 minutos; licúa con un poco del agua de cocción y sal.`,
    `Corta ${noun(ing, 'tortilla de maíz', 'la tortilla', 'las tortillas')} en triángulos y fríelos en ${amt(ing, 'aceite de oliva')} de aceite hasta dorar, o usa totopos.`,
    `Fríe ${noun(ing, 'huevo', 'el huevo', 'los huevos')} y resérvalos.`,
    `Calienta la salsa roja 2 minutos, agrega los totopos y mezcla suavemente; sirve con el huevo, crema, queso oaxaca y cebolla encima.`,
  ]),
  recipe('Enfrijoladas', 'breakfast', ['vegetarian'], ['lácteos'], 8, 10, 2, [
    ri('tortilla de maíz', 6, 'pieza'), ri('frijoles refritos', 200, 'g'), ri('queso panela', 40, 'g'), ri('crema ácida', 2, 'cda'), ri('cebolla blanca', 0.25, 'pieza'),
  ], (ing) => [
    `Calienta ${amt(ing, 'frijoles refritos')} de frijoles refritos con un poco de agua hasta que queden como una salsa espesa.`,
    `Pasa ${noun(ing, 'tortilla de maíz', 'la tortilla', 'las tortillas')} por los frijoles calientes hasta cubrirlas bien, y dóblalas o enróllalas en un plato.`,
    `Sirve con crema, ${amt(ing, 'queso panela')} de queso panela desmoronado y cebolla picada encima.`,
  ]),
  recipe('Molletes con chorizo', 'breakfast', [], ['gluten', 'lácteos'], 8, 10, 2, [
    ri('pan bolillo', 2, 'pieza'), ri('frijoles refritos', 150, 'g'), ri('chorizo', 80, 'g'), ri('queso oaxaca', 60, 'g'),
  ], (ing) => [
    `Fríe ${amt(ing, 'chorizo')} de chorizo en un sartén sin aceite 5-6 minutos, deshaciéndolo con una cuchara, hasta que esté bien cocido.`,
    `Corta ${noun(ing, 'pan bolillo', 'el bolillo', 'los bolillos')} a la mitad, unta frijoles refritos y reparte el chorizo encima.`,
    `Cubre con ${amt(ing, 'queso oaxaca')} de queso oaxaca y gratina 5-6 minutos en el horno o en un sartén tapado, hasta que derrita.`,
  ]),
  recipe('Hot cakes de avena', 'breakfast', ['vegetarian'], ['huevo', 'lácteos'], 8, 10, 2, [
    ri('avena', 100, 'g'), ri('huevo', 2, 'pieza'), ri('leche', 150, 'ml'), ri('miel', 2, 'cda'),
  ], (ing) => [
    `Licúa ${amt(ing, 'avena')} de avena con ${noun(ing, 'huevo', 'el huevo', 'los huevos')}, ${amt(ing, 'leche')} de leche y una cucharada de miel hasta obtener una mezcla tersa.`,
    'Calienta un sartén antiadherente a fuego medio-bajo y vierte porciones de la mezcla.',
    'Cocina 2 minutos por lado, hasta que se formen burbujas en la superficie antes de voltear.',
    'Sirve apilados con el resto de la miel encima.',
  ]),
  recipe('Sincronizadas', 'breakfast', [], ['gluten', 'lácteos'], 6, 8, 2, [
    ri('tortilla de harina', 4, 'pieza'), ri('jamón de pavo', 4, 'rebanada'), ri('queso oaxaca', 80, 'g'),
  ], (ing) => [
    `Coloca ${amt(ing, 'jamón de pavo')} de jamón y ${amt(ing, 'queso oaxaca')} de queso oaxaca entre dos tortillas de harina, armando 2 sincronizadas.`,
    'Cocina en un comal o sartén a fuego medio, 2 minutos por lado, hasta que el queso derrita y la tortilla dore ligeramente.',
    'Corta en triángulos y sirve de inmediato.',
  ]),
  recipe('Burritos de huevo con frijoles', 'breakfast', ['vegetarian'], ['huevo', 'gluten', 'lácteos'], 8, 8, 2, [
    ri('tortilla de harina', 2, 'pieza'), ri('huevo', 4, 'pieza'), ri('frijoles refritos', 100, 'g'), ri('queso panela', 40, 'g'),
  ], (ing) => [
    `Calienta ${amt(ing, 'frijoles refritos')} de frijoles refritos.`,
    `Bate ${noun(ing, 'huevo', 'el huevo', 'los huevos')} y cocina revolviendo 3-4 minutos hasta que cuajen suaves.`,
    `Calienta ${noun(ing, 'tortilla de harina', 'la tortilla', 'las tortillas')} de harina y rellena con los frijoles, el huevo y ${amt(ing, 'queso panela')} de queso panela; enrolla como burrito.`,
  ]),
  recipe('Omelette de champiñones y queso', 'breakfast', ['vegetarian'], ['huevo', 'lácteos'], 6, 8, 2, [
    ri('huevo', 4, 'pieza'), ri('champiñones', 100, 'g'), ri('queso oaxaca', 40, 'g'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Saltea ${amt(ing, 'champiñones')} de champiñones rebanados en ${amt(ing, 'aceite de oliva')} de aceite, 4-5 minutos hasta que doren.`,
    `Bate ${noun(ing, 'huevo', 'el huevo', 'los huevos')} con sal y vierte sobre los champiñones en el sartén.`,
    `Cocina 2-3 minutos a fuego bajo, agrega ${amt(ing, 'queso oaxaca')} de queso oaxaca en el centro y dobla el omelette a la mitad.`,
  ]),
  recipe('Avena con manzana y canela', 'breakfast', ['vegetarian'], ['lácteos'], 5, 5, 1, [
    ri('avena', 60, 'g'), ri('leche', 200, 'ml'), ri('manzana', 1, 'pieza'), ri('canela en polvo', 1, 'pizca'), ri('miel', 1, 'cda'),
  ], (ing) => [
    `Calienta ${amt(ing, 'leche')} de leche y agrega ${amt(ing, 'avena')} de avena; cocina a fuego bajo 5 minutos, moviendo.`,
    `Corta ${noun(ing, 'manzana', 'la manzana', 'las manzanas')} en cubos pequeños y agrégala junto con la canela.`,
    'Sirve caliente con un chorrito de miel encima.',
  ]),
  recipe('Licuado de fresa con yogurt', 'breakfast', ['vegetarian'], ['lácteos'], 5, 0, 1, [
    ri('yogurt natural', 150, 'g'), ri('fresa', 8, 'pieza'), ri('leche', 100, 'ml'), ri('miel', 1, 'cda'),
  ], (ing) => [
    `Licúa ${amt(ing, 'yogurt natural')} de yogurt con ${noun(ing, 'fresa', 'la fresa', 'las fresas')}, ${amt(ing, 'leche')} de leche y la miel durante 1 minuto.`,
    'Sirve frío de inmediato.',
  ]),
  recipe('Parfait de yogurt con avena y fresa', 'breakfast', ['vegetarian'], ['lácteos'], 5, 0, 1, [
    ri('yogurt natural', 200, 'g'), ri('avena', 30, 'g'), ri('fresa', 6, 'pieza'), ri('miel', 1, 'cda'),
  ], (ing) => [
    `En un vaso, alterna capas de ${amt(ing, 'yogurt natural')} de yogurt, ${amt(ing, 'avena')} de avena y ${noun(ing, 'fresa', 'la fresa', 'las fresas')} rebanadas.`,
    'Termina con un chorrito de miel encima y sirve de inmediato, o refrigera hasta 1 día.',
  ]),
  recipe('Pan tostado con aguacate y huevo', 'breakfast', ['vegetarian'], ['huevo', 'gluten'], 6, 6, 1, [
    ri('pan bolillo', 1, 'pieza'), ri('aguacate', 0.5, 'pieza'), ri('huevo', 1, 'pieza'),
  ], (ing) => [
    `Tuesta ${noun(ing, 'pan bolillo', 'el bolillo', 'los bolillos')} rebanado a la mitad.`,
    'Machaca el aguacate con sal y pimienta, y úntalo sobre el pan tostado.',
    `Fríe o pocha ${noun(ing, 'huevo', 'el huevo', 'los huevos')} y colócalo encima antes de servir.`,
  ]),
  recipe('Tostadas de frijol con huevo', 'breakfast', ['vegetarian'], ['huevo', 'lácteos'], 8, 8, 2, [
    ri('tortilla de maíz', 4, 'pieza'), ri('frijoles refritos', 150, 'g'), ri('huevo', 2, 'pieza'), ri('queso panela', 40, 'g'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Tuesta ${noun(ing, 'tortilla de maíz', 'la tortilla', 'las tortillas')} en un comal hasta que estén crujientes, u hornea 8 minutos.`,
    `Unta ${amt(ing, 'frijoles refritos')} de frijoles refritos sobre las tostadas.`,
    `Fríe ${noun(ing, 'huevo', 'el huevo', 'los huevos')} en ${amt(ing, 'aceite de oliva')} de aceite y coloca uno sobre cada tostada; espolvorea ${amt(ing, 'queso panela')} de queso panela encima.`,
  ]),
  recipe('Quesadillas de huevo', 'breakfast', ['vegetarian'], ['huevo', 'lácteos'], 6, 8, 2, [
    ri('tortilla de maíz', 4, 'pieza'), ri('huevo', 3, 'pieza'), ri('queso oaxaca', 60, 'g'),
  ], (ing) => [
    `Bate ${noun(ing, 'huevo', 'el huevo', 'los huevos')} y cocina revolviendo 3 minutos hasta que cuajen.`,
    `Rellena ${noun(ing, 'tortilla de maíz', 'la tortilla', 'las tortillas')} con el huevo y ${amt(ing, 'queso oaxaca')} de queso oaxaca, doblando a la mitad.`,
    'Calienta en un comal 1-2 minutos por lado hasta que el queso derrita.',
  ]),
  recipe('Torta de huevo', 'breakfast', ['vegetarian'], ['huevo', 'gluten'], 8, 8, 1, [
    ri('pan bolillo', 1, 'pieza'), ri('huevo', 2, 'pieza'), ri('aguacate', 0.5, 'pieza'), ri('jitomate', 0.5, 'pieza'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Fríe ${noun(ing, 'huevo', 'el huevo', 'los huevos')} en ${amt(ing, 'aceite de oliva')} de aceite, revueltos o estrellados, a tu gusto.`,
    `Corta ${noun(ing, 'pan bolillo', 'el bolillo', 'los bolillos')} a la mitad y unta el aguacate machacado.`,
    'Rellena con el huevo y rodajas de jitomate; sazona con sal y pimienta.',
  ]),
  recipe('Huevos con nopales', 'breakfast', ['vegetarian'], ['huevo'], 8, 10, 2, [
    ri('huevo', 4, 'pieza'), ri('nopal', 4, 'pieza'), ri('cebolla blanca', 0.25, 'pieza'), ri('jitomate', 1, 'pieza'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Corta ${noun(ing, 'nopal', 'el nopal', 'los nopales')} en cuadros y cuécelos en agua con sal 8 minutos; escurre bien.`,
    `Acitrona la cebolla y el jitomate picados en un sartén con ${amt(ing, 'aceite de oliva')} de aceite, 3 minutos.`,
    `Agrega los nopales y ${noun(ing, 'huevo', 'el huevo', 'los huevos')} batidos; cocina revolviendo 3-4 minutos hasta que cuajen.`,
  ]),
  recipe('Chilaquiles verdes con huevo', 'breakfast', ['vegetarian'], ['huevo', 'lácteos'], 10, 15, 2, [
    ri('tortilla de maíz', 8, 'pieza'), ri('tomate verde', 250, 'g'), ri('chile serrano', 1, 'pieza'), ri('huevo', 2, 'pieza'), ri('queso panela', 40, 'g'), ri('crema ácida', 2, 'cda'), ri('aceite de oliva', 2, 'cda'),
  ], (ing) => [
    `Hierve ${amt(ing, 'tomate verde')} de tomate verde y el chile serrano 8 minutos; licúa con un poco del agua de cocción.`,
    `Fríe ${noun(ing, 'tortilla de maíz', 'la tortilla', 'las tortillas')} cortada en triángulos en ${amt(ing, 'aceite de oliva')} de aceite hasta dorar, o usa totopos.`,
    `Fríe ${noun(ing, 'huevo', 'el huevo', 'los huevos')} y resérvalos.`,
    `Calienta la salsa, mezcla con los totopos 1-2 minutos y sirve con el huevo, crema y ${amt(ing, 'queso panela')} de queso panela encima.`,
  ]),
  recipe('Licuado de plátano y fresa', 'breakfast', ['vegetarian'], ['lácteos'], 5, 0, 1, [
    ri('leche', 200, 'ml'), ri('plátano', 1, 'pieza'), ri('fresa', 6, 'pieza'), ri('miel', 1, 'cda'),
  ], (ing) => [
    `Licúa ${amt(ing, 'leche')} de leche con ${noun(ing, 'plátano', 'el plátano', 'los plátanos')}, ${noun(ing, 'fresa', 'la fresa', 'las fresas')} y la miel durante 1 minuto.`,
    'Sirve frío de inmediato.',
  ]),
  recipe('Yogurt con mango y nuez', 'breakfast', ['vegetarian'], ['lácteos', 'frutos secos'], 5, 0, 1, [
    ri('yogurt natural', 200, 'g'), ri('mango', 0.5, 'pieza'), ri('nuez', 1, 'cda'), ri('miel', 1, 'cda'),
  ], (ing) => [
    `Sirve ${amt(ing, 'yogurt natural')} de yogurt en un tazón.`,
    `Corta ${noun(ing, 'mango', 'el mango', 'los mangos')} en cubos y colócalo encima junto con ${amt(ing, 'nuez')} de nuez picada.`,
    'Termina con un chorrito de miel.',
  ]),
  recipe('Papas con huevo', 'breakfast', ['vegetarian'], ['huevo'], 10, 12, 2, [
    ri('papa', 2, 'pieza'), ri('huevo', 3, 'pieza'), ri('cebolla blanca', 0.25, 'pieza'), ri('jitomate', 1, 'pieza'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Corta ${noun(ing, 'papa', 'la papa', 'las papas')} en cubos pequeños y fríelos en ${amt(ing, 'aceite de oliva')} de aceite 8-10 minutos hasta que estén suaves.`,
    'Acitrona la cebolla y el jitomate 3 minutos en el mismo sartén.',
    `Agrega ${noun(ing, 'huevo', 'el huevo', 'los huevos')} batidos y las papas; cocina revolviendo 3-4 minutos hasta que el huevo cuaje.`,
  ]),
  recipe('Burrito de picadillo de res', 'breakfast', [], ['gluten'], 12, 18, 2, [
    ri('tortilla de harina', 2, 'pieza'), ri('carne molida de res', 200, 'g'), ri('papa', 1, 'pieza'), ri('zanahoria', 1, 'pieza'),
  ], (ing) => [
    `Corta ${noun(ing, 'papa', 'la papa', 'las papas')} y ${noun(ing, 'zanahoria', 'la zanahoria', 'las zanahorias')} en cubos pequeños y cuécelos 8 minutos; escurre.`,
    `Dora ${amt(ing, 'carne molida de res')} de carne molida en un sartén 6-8 minutos, deshaciendo grumos.`,
    'Agrega la papa y zanahoria precocidas, cocina 3-4 minutos más y sazona.',
    `Calienta ${noun(ing, 'tortilla de harina', 'la tortilla', 'las tortillas')} de harina, rellena con el picadillo y enrolla.`,
  ]),
  recipe('Molletes de queso panela', 'breakfast', ['vegetarian'], ['gluten', 'lácteos'], 6, 8, 2, [
    ri('pan bolillo', 2, 'pieza'), ri('frijoles refritos', 150, 'g'), ri('queso panela', 80, 'g'), ri('jitomate', 1, 'pieza'),
  ], (ing) => [
    `Corta ${noun(ing, 'pan bolillo', 'el bolillo', 'los bolillos')} a la mitad y unta frijoles refritos.`,
    `Cubre con ${amt(ing, 'queso panela')} de queso panela rebanado y gratina 5-6 minutos en el horno o en un sartén tapado.`,
    'Sirve con jitomate picado encima.',
  ]),
  recipe('Chilaquiles con crema y queso', 'breakfast', ['vegetarian'], ['lácteos'], 10, 12, 2, [
    ri('tortilla de maíz', 8, 'pieza'), ri('tomate verde', 200, 'g'), ri('chile serrano', 1, 'pieza'), ri('crema ácida', 3, 'cda'), ri('queso oaxaca', 60, 'g'), ri('aceite de oliva', 2, 'cda'),
  ], (ing) => [
    `Hierve ${amt(ing, 'tomate verde')} de tomate verde y el chile serrano 8 minutos; licúa con un poco de agua de cocción.`,
    `Fríe ${noun(ing, 'tortilla de maíz', 'la tortilla', 'las tortillas')} en triángulos en ${amt(ing, 'aceite de oliva')} de aceite hasta dorar, o usa totopos.`,
    `Mezcla los totopos con la salsa caliente y sirve con ${amt(ing, 'crema ácida')} de crema y ${amt(ing, 'queso oaxaca')} de queso oaxaca encima.`,
  ]),
  recipe('Avena con mango', 'breakfast', ['vegetarian'], ['lácteos'], 5, 5, 1, [
    ri('avena', 60, 'g'), ri('leche', 200, 'ml'), ri('mango', 0.5, 'pieza'), ri('miel', 1, 'cda'),
  ], (ing) => [
    `Calienta ${amt(ing, 'leche')} de leche y agrega ${amt(ing, 'avena')} de avena; cocina 5 minutos a fuego bajo, moviendo.`,
    `Corta ${noun(ing, 'mango', 'el mango', 'los mangos')} en cubos y colócalo encima con un chorrito de miel.`,
  ]),
  recipe('Huevos a la mexicana con chorizo', 'breakfast', [], ['huevo'], 8, 10, 2, [
    ri('huevo', 4, 'pieza'), ri('chorizo', 60, 'g'), ri('jitomate', 1, 'pieza'), ri('cebolla blanca', 0.25, 'pieza'), ri('chile serrano', 1, 'pieza'),
  ], (ing) => [
    `Fríe ${amt(ing, 'chorizo')} de chorizo 4-5 minutos, deshaciéndolo con una cuchara.`,
    'Agrega la cebolla, el jitomate y el chile picados; cocina 3 minutos más.',
    `Incorpora ${noun(ing, 'huevo', 'el huevo', 'los huevos')} batidos y cocina revolviendo 3-4 minutos hasta que cuajen.`,
  ]),

  // --- Almuerzos adicionales ---
  recipe('Tostadas de pollo', 'lunch', [], ['lácteos'], 12, 15, 2, [
    ri('tortilla de maíz', 4, 'pieza'), ri('pechuga de pollo', 200, 'g'), ri('frijoles refritos', 100, 'g'), ri('lechuga', 1, 'taza'), ri('crema ácida', 2, 'cda'), ri('queso panela', 40, 'g'),
  ], (ing) => [
    `Cuece ${amt(ing, 'pechuga de pollo')} de pechuga en agua con sal 12-15 minutos; deshebra al enfriar un poco.`,
    `Tuesta ${noun(ing, 'tortilla de maíz', 'la tortilla', 'las tortillas')} en un comal o al horno hasta que quede crujiente.`,
    `Unta frijoles refritos, agrega el pollo, ${amt(ing, 'lechuga')} de lechuga picada, crema y ${amt(ing, 'queso panela')} de queso panela.`,
  ]),
  recipe('Sopa de fideo', 'lunch', ['vegetarian'], ['gluten'], 8, 15, 2, [
    ri('pasta', 150, 'g'), ri('jitomate', 2, 'pieza'), ri('ajo', 1, 'diente'), ri('cebolla blanca', 0.25, 'pieza'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Licúa ${noun(ing, 'jitomate', 'el jitomate', 'los jitomates')}, el ajo y la cebolla con un poco de agua hasta obtener una salsa tersa.`,
    `Dora ${amt(ing, 'pasta')} de pasta (fideo) en ${amt(ing, 'aceite de oliva')} de aceite 2-3 minutos, moviendo constantemente.`,
    'Agrega la salsa colada y suficiente agua para cubrir; cocina 10-12 minutos a fuego medio hasta que el fideo esté suave.',
  ]),
  recipe('Ensalada de pollo con manzana', 'lunch', [], ['frutos secos'], 12, 12, 2, [
    ri('pechuga de pollo', 200, 'g'), ri('manzana', 1, 'pieza'), ri('lechuga', 2, 'taza'), ri('nuez', 1, 'cda'), ri('limón', 1, 'pieza'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Cuece ${amt(ing, 'pechuga de pollo')} de pechuga 12 minutos; deja enfriar y corta en cubos.`,
    `Corta ${noun(ing, 'manzana', 'la manzana', 'las manzanas')} en cubos y mezcla con ${amt(ing, 'lechuga')} de lechuga, el pollo y ${amt(ing, 'nuez')} de nuez.`,
    'Aliña con jugo de limón, aceite de oliva y sal al gusto.',
  ]),
  recipe('Tacos de carne molida', 'lunch', [], [], 10, 12, 2, [
    ri('carne molida de res', 200, 'g'), ri('tortilla de maíz', 6, 'pieza'), ri('cebolla blanca', 0.5, 'pieza'), ri('cilantro', 0.5, 'manojo'), ri('limón', 1, 'pieza'),
  ], (ing) => [
    `Dora ${amt(ing, 'carne molida de res')} de carne molida en un sartén 8-10 minutos, deshaciendo grumos, hasta que esté bien cocida.`,
    `Calienta ${noun(ing, 'tortilla de maíz', 'la tortilla', 'las tortillas')} y rellena con la carne.`,
    'Agrega cebolla y cilantro picados, y un chorrito de limón al gusto.',
  ]),
  recipe('Enchiladas verdes de pollo', 'lunch', [], ['lácteos'], 12, 18, 2, [
    ri('tortilla de maíz', 8, 'pieza'), ri('pechuga de pollo', 200, 'g'), ri('tomate verde', 250, 'g'), ri('chile serrano', 1, 'pieza'), ri('crema ácida', 2, 'cda'), ri('queso panela', 40, 'g'),
  ], (ing) => [
    `Cuece ${amt(ing, 'pechuga de pollo')} de pechuga 12 minutos y deshebra.`,
    `Hierve ${amt(ing, 'tomate verde')} de tomate verde y el chile 8 minutos; licúa con un poco de agua de cocción.`,
    `Pasa ${noun(ing, 'tortilla de maíz', 'la tortilla', 'las tortillas')} por la salsa caliente, rellena con el pollo y enrolla.`,
    `Sirve bañadas con más salsa, crema y ${amt(ing, 'queso panela')} de queso panela encima.`,
  ]),
  recipe('Enchiladas rojas de queso', 'lunch', ['vegetarian'], ['lácteos'], 12, 15, 2, [
    ri('tortilla de maíz', 8, 'pieza'), ri('jitomate', 3, 'pieza'), ri('chile guajillo', 2, 'pieza'), ri('queso oaxaca', 100, 'g'), ri('crema ácida', 2, 'cda'), ri('cebolla blanca', 0.25, 'pieza'),
  ], (ing) => [
    `Hierve ${noun(ing, 'jitomate', 'el jitomate', 'los jitomates')} y ${noun(ing, 'chile guajillo', 'el chile guajillo', 'los chiles guajillo')} 8 minutos; licúa con un poco de agua de cocción.`,
    `Rellena ${noun(ing, 'tortilla de maíz', 'la tortilla', 'las tortillas')} con ${amt(ing, 'queso oaxaca')} de queso oaxaca deshebrado y enróllalas.`,
    'Baña con la salsa roja caliente y sirve con crema y cebolla picada encima.',
  ]),
  recipe('Sopes de frijol', 'lunch', ['vegetarian'], ['lácteos'], 15, 15, 2, [
    ri('masa de maíz', 200, 'g'), ri('frijoles refritos', 150, 'g'), ri('lechuga', 1, 'taza'), ri('queso panela', 40, 'g'), ri('crema ácida', 2, 'cda'),
  ], (ing) => [
    `Forma 4 discos gruesos con ${amt(ing, 'masa de maíz')} de masa y cuécelos en un comal 3-4 minutos por lado.`,
    'Pellizca los bordes de cada sope aún caliente para formar un borde.',
    `Unta frijoles refritos, agrega ${amt(ing, 'lechuga')} de lechuga, crema y ${amt(ing, 'queso panela')} de queso panela desmoronado.`,
  ]),
  recipe('Tostadas de tinga de pollo', 'lunch', [], ['lácteos'], 12, 18, 2, [
    ri('pechuga de pollo', 200, 'g'), ri('jitomate', 2, 'pieza'), ri('cebolla blanca', 0.5, 'pieza'), ri('tortilla de maíz', 4, 'pieza'), ri('crema ácida', 2, 'cda'),
  ], (ing) => [
    `Cuece ${amt(ing, 'pechuga de pollo')} de pechuga 12 minutos y deshebra.`,
    'Acitrona la cebolla en un sartén 3 minutos, agrega el jitomate picado y cocina 5 minutos más hasta que espese.',
    'Incorpora el pollo deshebrado y cocina 3-4 minutos, sazonando con sal.',
    `Sirve sobre ${noun(ing, 'tortilla de maíz', 'la tostada', 'las tostadas')} tostadas con crema encima.`,
  ]),
  recipe('Tacos de camarón', 'lunch', [], ['mariscos'], 10, 10, 2, [
    ri('camarón', 250, 'g'), ri('tortilla de maíz', 6, 'pieza'), ri('cebolla morada', 0.5, 'pieza'), ri('limón', 1, 'pieza'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Saltea ${amt(ing, 'camarón')} de camarón en ${amt(ing, 'aceite de oliva')} de aceite, 3-4 minutos hasta que estén rosados.`,
    `Calienta ${noun(ing, 'tortilla de maíz', 'la tortilla', 'las tortillas')} y rellena con los camarones.`,
    'Agrega cebolla morada picada y un chorrito de limón al gusto.',
  ]),
  recipe('Tostadas de atún', 'lunch', [], ['pescado'], 10, 0, 2, [
    ri('atún en agua', 140, 'g'), ri('tortilla de maíz', 4, 'pieza'), ri('aguacate', 0.5, 'pieza'), ri('jitomate', 1, 'pieza'), ri('limón', 1, 'pieza'),
  ], (ing) => [
    `Escurre ${amt(ing, 'atún en agua')} de atún y mezcla con el aguacate machacado, el jitomate picado y jugo de limón.`,
    `Tuesta ${noun(ing, 'tortilla de maíz', 'la tortilla', 'las tortillas')} y reparte la mezcla de atún encima.`,
  ]),
  recipe('Ensalada de nopales', 'lunch', ['vegetarian', 'vegan'], [], 12, 10, 2, [
    ri('nopal', 4, 'pieza'), ri('jitomate', 1, 'pieza'), ri('cebolla morada', 0.25, 'pieza'), ri('cilantro', 0.5, 'manojo'), ri('limón', 1, 'pieza'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Corta ${noun(ing, 'nopal', 'el nopal', 'los nopales')} en cuadros y cuécelos en agua con sal 8-10 minutos; enjuaga y escurre bien.`,
    'Mezcla con el jitomate y cebolla picados, y el cilantro.',
    'Aliña con jugo de limón, aceite de oliva y sal al gusto.',
  ]),
  recipe('Caldo de pollo con verduras', 'lunch', [], [], 10, 25, 2, [
    ri('pechuga de pollo', 250, 'g'), ri('zanahoria', 1, 'pieza'), ri('papa', 1, 'pieza'), ri('calabacita', 1, 'pieza'), ri('cebolla blanca', 0.25, 'pieza'),
  ], (ing) => [
    `Cuece ${amt(ing, 'pechuga de pollo')} de pechuga en agua con sal y la cebolla, 15 minutos.`,
    `Agrega ${noun(ing, 'zanahoria', 'la zanahoria', 'las zanahorias')}, ${noun(ing, 'papa', 'la papa', 'las papas')} y ${noun(ing, 'calabacita', 'la calabacita', 'las calabacitas')} en cubos.`,
    'Cocina 10 minutos más, hasta que las verduras estén suaves. Sazona y sirve caliente.',
  ]),
  recipe('Arroz con pollo', 'lunch', [], [], 10, 20, 2, [
    ri('pechuga de pollo', 200, 'g'), ri('arroz', 150, 'g'), ri('jitomate', 1, 'pieza'), ri('zanahoria', 1, 'pieza'), ri('ajo', 1, 'diente'),
  ], (ing) => [
    `Corta ${amt(ing, 'pechuga de pollo')} de pollo en cubos y dora en un sartén 5 minutos.`,
    `Agrega ${amt(ing, 'arroz')} de arroz y sofríe 2 minutos; incorpora jitomate y ajo licuados.`,
    `Añade ${noun(ing, 'zanahoria', 'la zanahoria', 'las zanahorias')} en cubos y el doble de agua que de arroz; cocina tapado 15-18 minutos a fuego bajo.`,
  ]),
  recipe('Picadillo de res con verduras', 'lunch', [], [], 10, 18, 2, [
    ri('carne molida de res', 200, 'g'), ri('calabacita', 1, 'pieza'), ri('zanahoria', 1, 'pieza'), ri('papa', 1, 'pieza'), ri('jitomate', 1, 'pieza'),
  ], (ing) => [
    `Dora ${amt(ing, 'carne molida de res')} de carne molida 6-8 minutos, deshaciendo grumos.`,
    `Corta ${noun(ing, 'calabacita', 'la calabacita', 'las calabacitas')}, ${noun(ing, 'zanahoria', 'la zanahoria', 'las zanahorias')} y ${noun(ing, 'papa', 'la papa', 'las papas')} en cubos pequeños.`,
    'Agrega las verduras y el jitomate picado a la carne; cocina tapado 10-12 minutos hasta que estén suaves.',
  ]),
  recipe('Quesadillas de champiñones', 'lunch', ['vegetarian'], ['lácteos'], 8, 10, 2, [
    ri('champiñones', 150, 'g'), ri('tortilla de maíz', 6, 'pieza'), ri('queso oaxaca', 80, 'g'), ri('ajo', 1, 'diente'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Saltea ${amt(ing, 'champiñones')} de champiñones rebanados con el ajo en ${amt(ing, 'aceite de oliva')} de aceite, 5-6 minutos.`,
    `Rellena ${noun(ing, 'tortilla de maíz', 'la tortilla', 'las tortillas')} con los champiñones y ${amt(ing, 'queso oaxaca')} de queso oaxaca.`,
    'Cocina en un comal 2 minutos por lado hasta que el queso derrita.',
  ]),
  recipe('Tacos dorados de papa', 'lunch', ['vegetarian'], ['lácteos'], 15, 15, 2, [
    ri('papa', 3, 'pieza'), ri('tortilla de maíz', 6, 'pieza'), ri('crema ácida', 2, 'cda'), ri('lechuga', 1, 'taza'), ri('queso panela', 40, 'g'), ri('aceite de oliva', 2, 'cda'),
  ], (ing) => [
    `Cuece ${noun(ing, 'papa', 'la papa', 'las papas')} 12-15 minutos hasta que estén suaves; machácalas con sal.`,
    `Rellena ${noun(ing, 'tortilla de maíz', 'la tortilla', 'las tortillas')} con el puré de papa y enrolla; dora en un sartén con ${amt(ing, 'aceite de oliva')} de aceite hasta que estén crujientes.`,
    `Sirve con ${amt(ing, 'lechuga')} de lechuga, crema y ${amt(ing, 'queso panela')} de queso panela encima.`,
  ]),
  recipe('Chile relleno de queso al horno', 'lunch', ['vegetarian'], ['huevo', 'lácteos'], 15, 20, 2, [
    ri('chile poblano', 4, 'pieza'), ri('queso oaxaca', 120, 'g'), ri('huevo', 2, 'pieza'), ri('jitomate', 2, 'pieza'),
  ], (ing) => [
    `Asa ${noun(ing, 'chile poblano', 'el chile poblano', 'los chiles poblanos')} directo al fuego hasta que la piel se ampolle; suda en una bolsa cerrada 5 minutos y pela.`,
    `Haz una abertura en cada chile, retira las semillas y rellena con ${amt(ing, 'queso oaxaca')} de queso oaxaca.`,
    `Bate ${noun(ing, 'huevo', 'el huevo', 'los huevos')} y baña los chiles; hornea 15 minutos a 180°C hasta que cuaje.`,
    'Sirve con jitomate picado o una salsa de jitomate licuado.',
  ]),
  recipe('Sopa de calabacita', 'lunch', ['vegetarian'], ['lácteos'], 8, 15, 2, [
    ri('calabacita', 3, 'pieza'), ri('cebolla blanca', 0.25, 'pieza'), ri('ajo', 1, 'diente'), ri('crema ácida', 2, 'cda'),
  ], (ing) => [
    `Sofríe la cebolla y el ajo 2 minutos; agrega ${noun(ing, 'calabacita', 'la calabacita', 'las calabacitas')} picada y cocina 3 minutos más.`,
    'Cubre con agua y cocina 10-12 minutos hasta que la calabacita esté muy suave.',
    `Licúa hasta obtener una crema tersa; sirve con ${amt(ing, 'crema ácida')} de crema encima.`,
  ]),
  recipe('Ensalada de camarón', 'lunch', [], ['mariscos'], 10, 5, 2, [
    ri('camarón', 200, 'g'), ri('pepino', 1, 'pieza'), ri('jitomate', 1, 'pieza'), ri('cebolla morada', 0.25, 'pieza'), ri('limón', 1, 'pieza'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Cuece ${amt(ing, 'camarón')} de camarón en agua hirviendo 2-3 minutos, hasta que estén rosados; enfría en agua con hielo.`,
    `Corta ${noun(ing, 'pepino', 'el pepino', 'los pepinos')}, ${noun(ing, 'jitomate', 'el jitomate', 'los jitomates')} y la cebolla en cubos.`,
    'Mezcla todo con jugo de limón, aceite de oliva y sal al gusto.',
  ]),
  recipe('Burritos de frijol y queso', 'lunch', ['vegetarian'], ['gluten', 'lácteos'], 8, 8, 2, [
    ri('tortilla de harina', 2, 'pieza'), ri('frijoles refritos', 150, 'g'), ri('queso oaxaca', 80, 'g'), ri('lechuga', 1, 'taza'),
  ], (ing) => [
    `Calienta ${amt(ing, 'frijoles refritos')} de frijoles refritos.`,
    `Calienta ${noun(ing, 'tortilla de harina', 'la tortilla', 'las tortillas')} de harina y rellena con los frijoles, ${amt(ing, 'queso oaxaca')} de queso oaxaca y ${amt(ing, 'lechuga')} de lechuga.`,
    'Enrolla bien apretado y sirve de inmediato.',
  ]),
  recipe('Tostadas de frijol con queso', 'lunch', ['vegetarian'], ['lácteos'], 8, 0, 2, [
    ri('tortilla de maíz', 4, 'pieza'), ri('frijoles refritos', 150, 'g'), ri('queso panela', 60, 'g'), ri('lechuga', 1, 'taza'), ri('crema ácida', 2, 'cda'),
  ], (ing) => [
    `Tuesta ${noun(ing, 'tortilla de maíz', 'la tortilla', 'las tortillas')} hasta que estén crujientes.`,
    `Unta frijoles refritos y reparte ${amt(ing, 'queso panela')} de queso panela desmoronado.`,
    `Agrega ${amt(ing, 'lechuga')} de lechuga picada y un toque de crema encima.`,
  ]),
  recipe('Molletes de atún', 'lunch', [], ['gluten'], 10, 8, 2, [
    ri('pan bolillo', 2, 'pieza'), ri('atún en agua', 140, 'g'), ri('jitomate', 1, 'pieza'), ri('cebolla blanca', 0.25, 'pieza'), ri('queso oaxaca', 60, 'g'),
  ], (ing) => [
    `Escurre ${amt(ing, 'atún en agua')} de atún y mezcla con jitomate y cebolla picados.`,
    `Corta ${noun(ing, 'pan bolillo', 'el bolillo', 'los bolillos')} a la mitad, reparte la mezcla de atún encima.`,
    `Cubre con ${amt(ing, 'queso oaxaca')} de queso oaxaca y gratina 5 minutos en el horno o sartén tapado.`,
  ]),
  recipe('Pasta con atún', 'lunch', [], ['gluten', 'pescado'], 10, 12, 2, [
    ri('pasta', 200, 'g'), ri('atún en agua', 140, 'g'), ri('jitomate', 2, 'pieza'), ri('ajo', 1, 'diente'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Cuece ${amt(ing, 'pasta')} de pasta según las instrucciones del paquete.`,
    `Sofríe el ajo en ${amt(ing, 'aceite de oliva')} de aceite 30 segundos, agrega ${noun(ing, 'jitomate', 'el jitomate', 'los jitomates')} picado y cocina 5 minutos.`,
    `Incorpora ${amt(ing, 'atún en agua')} de atún escurrido y la pasta; mezcla 2 minutos a fuego bajo antes de servir.`,
  ]),
  recipe('Milanesa de pollo con ensalada', 'lunch', [], ['huevo'], 12, 12, 2, [
    ri('pechuga de pollo', 250, 'g'), ri('huevo', 1, 'pieza'), ri('lechuga', 2, 'taza'), ri('jitomate', 1, 'pieza'), ri('limón', 1, 'pieza'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Aplana ${amt(ing, 'pechuga de pollo')} de pechuga hasta que quede delgada y sazona con sal y pimienta.`,
    `Pasa el pollo por ${noun(ing, 'huevo', 'el huevo', 'los huevos')} batido y cocina en un sartén con ${amt(ing, 'aceite de oliva')} de aceite, 4-5 minutos por lado, hasta dorar y que ya no esté rosado en el centro.`,
    `Sirve con ${amt(ing, 'lechuga')} de lechuga y jitomate en rodajas, aliñados con limón.`,
  ]),
  recipe('Ensalada de garbanzo y atún', 'lunch', [], ['pescado'], 10, 0, 2, [
    ri('garbanzo cocido', 200, 'g'), ri('atún en agua', 140, 'g'), ri('jitomate', 1, 'pieza'), ri('pepino', 1, 'pieza'), ri('aceite de oliva', 1, 'cda'), ri('limón', 1, 'pieza'),
  ], (ing) => [
    `Escurre ${amt(ing, 'garbanzo cocido')} de garbanzo y ${amt(ing, 'atún en agua')} de atún.`,
    `Corta ${noun(ing, 'jitomate', 'el jitomate', 'los jitomates')} y ${noun(ing, 'pepino', 'el pepino', 'los pepinos')} en cubos y mezcla todo.`,
    'Aliña con aceite de oliva, jugo de limón y sal al gusto.',
  ]),
  recipe('Sándwich de pavo y aguacate', 'lunch', [], ['gluten'], 8, 0, 1, [
    ri('pan bolillo', 1, 'pieza'), ri('jamón de pavo', 3, 'rebanada'), ri('aguacate', 0.5, 'pieza'), ri('jitomate', 0.5, 'pieza'), ri('lechuga', 0.5, 'taza'),
  ], (ing) => [
    `Corta ${noun(ing, 'pan bolillo', 'el bolillo', 'los bolillos')} a la mitad y unta el aguacate machacado.`,
    `Rellena con ${noun(ing, 'jamón de pavo', 'la rebanada de jamón', 'las rebanadas de jamón')}, jitomate en rodajas y ${amt(ing, 'lechuga')} de lechuga.`,
  ]),

  // --- Cenas adicionales ---
  recipe('Pollo al horno con papas y zanahoria', 'dinner', [], [], 10, 45, 2, [
    ri('muslo de pollo', 4, 'pieza'), ri('papa', 2, 'pieza'), ri('zanahoria', 2, 'pieza'), ri('ajo', 2, 'diente'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    'Precalienta el horno a 200°C.',
    `Corta ${noun(ing, 'papa', 'la papa', 'las papas')} y ${noun(ing, 'zanahoria', 'la zanahoria', 'las zanahorias')} en trozos medianos (no muy grandes, para que se cuezan parejo).`,
    `Coloca ${noun(ing, 'muslo de pollo', 'el muslo de pollo', 'los muslos de pollo')} y las verduras en una charola; baña con ${amt(ing, 'aceite de oliva')} de aceite y el ajo picado.`,
    'Hornea 40-45 minutos, hasta que el pollo alcance 74°C internos (el jugo debe salir claro, sin rosado) y las verduras estén doradas.',
  ]),
  recipe('Salmón al horno con espárragos', 'dinner', [], ['pescado'], 8, 15, 2, [
    ri('salmón', 300, 'g'), ri('espárragos', 150, 'g'), ri('limón', 1, 'pieza'), ri('aceite de oliva', 1, 'cda'), ri('ajo', 1, 'diente'),
  ], (ing) => [
    'Precalienta el horno a 200°C.',
    `Coloca ${amt(ing, 'salmón')} de salmón y ${amt(ing, 'espárragos')} de espárragos en una charola.`,
    `Baña con ${amt(ing, 'aceite de oliva')} de aceite, ajo picado y rodajas de limón.`,
    'Hornea 12-15 minutos, hasta que el salmón se desmenuce fácilmente.',
  ]),
  recipe('Camarones al ajillo', 'dinner', [], ['mariscos'], 8, 10, 2, [
    ri('camarón', 300, 'g'), ri('ajo', 4, 'diente'), ri('chile guajillo', 1, 'pieza'), ri('aceite de oliva', 2, 'cda'), ri('limón', 1, 'pieza'),
  ], (ing) => [
    `Fríe ${noun(ing, 'ajo', 'el ajo', 'los ajos')} laminado y ${noun(ing, 'chile guajillo', 'el chile guajillo', 'los chiles guajillo')} en ${amt(ing, 'aceite de oliva')} de aceite, 1-2 minutos, sin que se quemen.`,
    `Agrega ${amt(ing, 'camarón')} de camarón y cocina 3-4 minutos, hasta que estén rosados.`,
    'Sirve de inmediato con un chorrito de limón.',
  ]),
  recipe('Chile poblano relleno de picadillo', 'dinner', [], ['huevo'], 20, 25, 2, [
    ri('chile poblano', 4, 'pieza'), ri('carne molida de res', 200, 'g'), ri('zanahoria', 1, 'pieza'), ri('huevo', 2, 'pieza'), ri('jitomate', 1, 'pieza'),
  ], (ing) => [
    `Asa ${noun(ing, 'chile poblano', 'el chile poblano', 'los chiles poblanos')} directo al fuego, suda en bolsa cerrada 5 minutos y pela; retira las semillas.`,
    `Dora ${amt(ing, 'carne molida de res')} de carne molida con ${noun(ing, 'zanahoria', 'la zanahoria', 'las zanahorias')} en cubos, 8-10 minutos.`,
    'Rellena los chiles con el picadillo.',
    `Bate ${noun(ing, 'huevo', 'el huevo', 'los huevos')}, baña los chiles y cocina en un sartén con un poco de aceite 3-4 minutos por lado, hasta dorar.`,
  ]),
  recipe('Pescado a la veracruzana', 'dinner', [], ['pescado'], 10, 18, 2, [
    ri('filete de tilapia', 300, 'g'), ri('jitomate', 3, 'pieza'), ri('cebolla blanca', 0.5, 'pieza'), ri('ajo', 2, 'diente'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Sofríe la cebolla y el ajo en ${amt(ing, 'aceite de oliva')} de aceite 3 minutos.`,
    `Agrega ${noun(ing, 'jitomate', 'el jitomate', 'los jitomates')} picado y cocina 8-10 minutos hasta que espese.`,
    `Añade ${amt(ing, 'filete de tilapia')} de filete y cocina tapado 8-10 minutos, hasta que se desmenuce fácilmente.`,
  ]),
  recipe('Arroz a la mexicana con pollo', 'dinner', [], [], 10, 20, 2, [
    ri('arroz', 150, 'g'), ri('pechuga de pollo', 200, 'g'), ri('jitomate', 2, 'pieza'), ri('zanahoria', 1, 'pieza'), ri('ajo', 1, 'diente'),
  ], (ing) => [
    `Dora ${amt(ing, 'pechuga de pollo')} de pollo en cubos, 5 minutos.`,
    `Sofríe ${amt(ing, 'arroz')} de arroz 2 minutos; agrega jitomate y ajo licuados.`,
    `Añade ${noun(ing, 'zanahoria', 'la zanahoria', 'las zanahorias')} en cubos y el pollo, más el doble de agua que de arroz; cocina tapado 15-18 minutos.`,
  ]),
  recipe('Enchiladas suizas', 'dinner', [], ['lácteos'], 12, 20, 2, [
    ri('tortilla de maíz', 8, 'pieza'), ri('pechuga de pollo', 200, 'g'), ri('tomate verde', 250, 'g'), ri('crema ácida', 3, 'cda'), ri('queso oaxaca', 100, 'g'),
  ], (ing) => [
    `Cuece ${amt(ing, 'pechuga de pollo')} de pechuga 12 minutos y deshebra.`,
    `Hierve ${amt(ing, 'tomate verde')} de tomate verde 8 minutos; licúa con la crema hasta obtener una salsa tersa.`,
    `Rellena ${noun(ing, 'tortilla de maíz', 'la tortilla', 'las tortillas')} con el pollo, enrolla y coloca en un refractario.`,
    `Baña con la salsa, cubre con ${amt(ing, 'queso oaxaca')} de queso oaxaca y gratina 10 minutos en el horno a 200°C.`,
  ]),
  recipe('Pozole rápido de pollo', 'dinner', [], [], 12, 25, 2, [
    ri('pechuga de pollo', 250, 'g'), ri('chile guajillo', 2, 'pieza'), ri('ajo', 2, 'diente'), ri('cebolla blanca', 0.25, 'pieza'), ri('lechuga', 1, 'taza'),
  ], (ing) => [
    `Cuece ${amt(ing, 'pechuga de pollo')} de pechuga en agua con sal, 15 minutos; deshebra y reserva el caldo.`,
    `Hierve ${noun(ing, 'chile guajillo', 'el chile guajillo', 'los chiles guajillo')} 8 minutos y licúa con el ajo y un poco de caldo.`,
    'Regresa la salsa colada al caldo junto con el pollo; cocina 10 minutos más.',
    `Sirve con ${amt(ing, 'lechuga')} de lechuga picada y cebolla encima.`,
  ]),
  recipe('Albóndigas en caldo', 'dinner', [], ['huevo'], 15, 25, 2, [
    ri('carne molida de res', 250, 'g'), ri('huevo', 1, 'pieza'), ri('zanahoria', 2, 'pieza'), ri('papa', 1, 'pieza'), ri('jitomate', 2, 'pieza'),
  ], (ing) => [
    `Mezcla ${amt(ing, 'carne molida de res')} de carne molida con ${noun(ing, 'huevo', 'el huevo', 'los huevos')} y sal; forma albóndigas pequeñas.`,
    `Licúa ${noun(ing, 'jitomate', 'el jitomate', 'los jitomates')} y cuela en una olla con agua; hierve 5 minutos.`,
    `Agrega las albóndigas, ${noun(ing, 'zanahoria', 'la zanahoria', 'las zanahorias')} y ${noun(ing, 'papa', 'la papa', 'las papas')} en cubos.`,
    'Cocina 15-18 minutos a fuego medio, hasta que las albóndigas estén bien cocidas.',
  ]),
  recipe('Bistec de res encebollado', 'dinner', [], [], 10, 12, 2, [
    ri('bistec de res', 250, 'g'), ri('cebolla blanca', 1, 'pieza'), ri('limón', 1, 'pieza'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Sazona ${amt(ing, 'bistec de res')} de bistec con sal y pimienta.`,
    `Sella en un sartén caliente con ${amt(ing, 'aceite de oliva')} de aceite, 3-4 minutos por lado.`,
    `Retira la carne, acitrona ${noun(ing, 'cebolla blanca', 'la cebolla', 'las cebollas')} rebanada en el mismo sartén 5 minutos.`,
    'Sirve la carne cubierta con la cebolla y un chorrito de limón.',
  ]),
  recipe('Camarones a la diabla', 'dinner', [], ['mariscos'], 10, 10, 2, [
    ri('camarón', 300, 'g'), ri('chile guajillo', 3, 'pieza'), ri('ajo', 2, 'diente'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Hierve ${noun(ing, 'chile guajillo', 'el chile guajillo', 'los chiles guajillo')} 8 minutos; licúa con el ajo y un poco de agua.`,
    `Cuela la salsa y cocínala en ${amt(ing, 'aceite de oliva')} de aceite 3-4 minutos.`,
    `Agrega ${amt(ing, 'camarón')} de camarón y cocina 3-4 minutos más, hasta que estén bien cocidos.`,
  ]),
  recipe('Salmón con arroz y brócoli', 'dinner', [], ['pescado'], 10, 20, 2, [
    ri('salmón', 300, 'g'), ri('arroz', 100, 'g'), ri('brócoli', 150, 'g'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Cuece ${amt(ing, 'arroz')} de arroz: 2 minutos a fuego alto hasta hervir, luego 15 minutos tapado a fuego bajo.`,
    `Sazona ${amt(ing, 'salmón')} de salmón y cocina en un sartén con ${amt(ing, 'aceite de oliva')} de aceite, 4 minutos por lado.`,
    `Cuece ${amt(ing, 'brócoli')} de brócoli al vapor 5 minutos y sirve todo junto.`,
  ]),
  recipe('Tacos de pescado', 'dinner', [], ['pescado'], 12, 12, 2, [
    ri('filete de tilapia', 300, 'g'), ri('tortilla de maíz', 6, 'pieza'), ri('lechuga', 1, 'taza'), ri('limón', 1, 'pieza'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Sazona ${amt(ing, 'filete de tilapia')} de tilapia con sal y limón; cocina en un sartén con ${amt(ing, 'aceite de oliva')} de aceite, 4 minutos por lado.`,
    'Desmenuza el pescado en trozos grandes.',
    `Calienta ${noun(ing, 'tortilla de maíz', 'la tortilla', 'las tortillas')} y rellena con el pescado y ${amt(ing, 'lechuga')} de lechuga; agrega limón al gusto.`,
  ]),
  recipe('Espagueti verde', 'dinner', ['vegetarian'], ['gluten', 'lácteos'], 12, 15, 2, [
    ri('pasta', 200, 'g'), ri('chile poblano', 2, 'pieza'), ri('crema ácida', 3, 'cda'), ri('queso parmesano', 30, 'g'), ri('ajo', 1, 'diente'),
  ], (ing) => [
    `Asa ${noun(ing, 'chile poblano', 'el chile poblano', 'los chiles poblanos')}, suda en bolsa cerrada 5 minutos, pela y retira las semillas.`,
    `Licúa los chiles con el ajo y ${amt(ing, 'crema ácida')} de crema hasta obtener una salsa tersa.`,
    `Cuece ${amt(ing, 'pasta')} de pasta según las instrucciones del paquete.`,
    `Mezcla la pasta con la salsa y ${amt(ing, 'queso parmesano')} de queso parmesano; calienta 2 minutos antes de servir.`,
  ]),
  recipe('Sopa de champiñones', 'dinner', ['vegetarian'], ['lácteos'], 8, 15, 2, [
    ri('champiñones', 250, 'g'), ri('cebolla blanca', 0.25, 'pieza'), ri('ajo', 1, 'diente'), ri('crema ácida', 2, 'cda'),
  ], (ing) => [
    `Sofríe la cebolla y el ajo 2 minutos; agrega ${amt(ing, 'champiñones')} de champiñones rebanados y cocina 5 minutos.`,
    'Cubre con agua o caldo y cocina 8-10 minutos.',
    `Licúa parcialmente y sirve con ${amt(ing, 'crema ácida')} de crema encima.`,
  ]),
  recipe('Ensalada de espinaca con pollo', 'dinner', [], ['frutos secos'], 10, 12, 2, [
    ri('pechuga de pollo', 200, 'g'), ri('espinaca', 100, 'g'), ri('fresa', 6, 'pieza'), ri('nuez', 1, 'cda'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Cuece ${amt(ing, 'pechuga de pollo')} de pechuga 12 minutos; deja enfriar y rebana.`,
    `Mezcla ${amt(ing, 'espinaca')} de espinaca con ${noun(ing, 'fresa', 'la fresa', 'las fresas')} rebanadas y ${amt(ing, 'nuez')} de nuez.`,
    'Agrega el pollo encima y aliña con aceite de oliva, sal y pimienta.',
  ]),
  recipe('Arroz con camarones', 'dinner', [], ['mariscos'], 10, 20, 2, [
    ri('arroz', 150, 'g'), ri('camarón', 200, 'g'), ri('jitomate', 1, 'pieza'), ri('ajo', 1, 'diente'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Sofríe ${amt(ing, 'arroz')} de arroz en ${amt(ing, 'aceite de oliva')} de aceite 2 minutos; agrega jitomate y ajo licuados.`,
    'Añade el doble de agua que de arroz y cocina tapado 15 minutos a fuego bajo.',
    `Incorpora ${amt(ing, 'camarón')} de camarón los últimos 4-5 minutos de cocción, hasta que estén rosados.`,
  ]),
  recipe('Tinga de res en tostadas', 'dinner', [], ['lácteos'], 12, 20, 2, [
    ri('bistec de res', 250, 'g'), ri('jitomate', 2, 'pieza'), ri('cebolla blanca', 0.5, 'pieza'), ri('tortilla de maíz', 4, 'pieza'), ri('crema ácida', 2, 'cda'),
  ], (ing) => [
    `Cuece ${amt(ing, 'bistec de res')} de bistec en agua con sal 15 minutos; deshebra al enfriar.`,
    'Acitrona la cebolla 3 minutos, agrega el jitomate picado y cocina 8 minutos hasta que espese.',
    'Incorpora la carne deshebrada y cocina 3-4 minutos más.',
    `Sirve sobre ${noun(ing, 'tortilla de maíz', 'la tostada', 'las tostadas')} tostadas con crema encima.`,
  ]),
  recipe('Camote al horno con frijoles', 'dinner', ['vegetarian', 'vegan'], [], 8, 35, 2, [
    ri('camote', 2, 'pieza'), ri('frijol negro cocido', 200, 'g'), ri('comino en polvo', 1, 'pizca'),
  ], (ing) => [
    'Precalienta el horno a 200°C.',
    `Pica ${noun(ing, 'camote', 'el camote', 'los camotes')} con un tenedor y hornea directo en la rejilla 30-35 minutos, hasta que esté suave.`,
    `Calienta ${amt(ing, 'frijol negro cocido')} de frijol negro con la pizca de comino.`,
    'Corta el camote a la mitad y rellena con los frijoles.',
  ]),
  recipe('Nopales con carne asada', 'dinner', [], [], 12, 15, 2, [
    ri('bistec de res', 250, 'g'), ri('nopal', 4, 'pieza'), ri('cebolla blanca', 0.25, 'pieza'), ri('limón', 1, 'pieza'),
  ], (ing) => [
    `Cuece ${noun(ing, 'nopal', 'el nopal', 'los nopales')} en cubos 8-10 minutos en agua con sal; escurre bien.`,
    `Sazona ${amt(ing, 'bistec de res')} de bistec y sella en un sartén caliente, 3-4 minutos por lado; corta en tiras.`,
    'Mezcla la carne con los nopales y cebolla picada; sirve con un chorrito de limón.',
  ]),
  recipe('Pechuga rellena de queso', 'dinner', [], ['lácteos'], 12, 30, 2, [
    ri('pechuga de pollo', 300, 'g'), ri('queso oaxaca', 80, 'g'), ri('jitomate', 1, 'pieza'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    'Precalienta el horno a 190°C.',
    `Haz un corte a lo largo en ${amt(ing, 'pechuga de pollo')} de pechuga sin atravesarla, formando una bolsa.`,
    `Rellena con ${amt(ing, 'queso oaxaca')} de queso oaxaca y cierra con palillos.`,
    `Sella en un sartén con ${amt(ing, 'aceite de oliva')} de aceite, 2-3 minutos por lado solo para dorar.`,
    'Termina la cocción en el horno 20-25 minutos, hasta que el pollo alcance 74°C internos y ya no esté rosado en el centro. Retira los palillos y sirve con rodajas de jitomate.',
  ]),
  recipe('Lentejas con chorizo', 'dinner', [], [], 10, 25, 2, [
    ri('lentejas', 150, 'g'), ri('chorizo', 80, 'g'), ri('cebolla blanca', 0.25, 'pieza'), ri('zanahoria', 1, 'pieza'),
  ], (ing) => [
    `Fríe ${amt(ing, 'chorizo')} de chorizo 4-5 minutos, deshaciéndolo con una cuchara.`,
    `Agrega la cebolla y ${noun(ing, 'zanahoria', 'la zanahoria', 'las zanahorias')} en cubos; sofríe 3 minutos.`,
    `Incorpora ${amt(ing, 'lentejas')} de lentejas enjuagadas y agua suficiente para cubrir; cocina 20 minutos hasta que estén suaves.`,
  ]),
  recipe('Sopa de tortilla', 'dinner', [], ['lácteos'], 10, 20, 2, [
    ri('tortilla de maíz', 4, 'pieza'), ri('jitomate', 3, 'pieza'), ri('ajo', 1, 'diente'), ri('queso panela', 40, 'g'), ri('aguacate', 0.5, 'pieza'), ri('aceite de oliva', 2, 'cda'),
  ], (ing) => [
    `Corta ${noun(ing, 'tortilla de maíz', 'la tortilla', 'las tortillas')} en tiras y fríe en ${amt(ing, 'aceite de oliva')} de aceite hasta que estén crujientes; reserva el resto del aceite en la olla.`,
    `Licúa ${noun(ing, 'jitomate', 'el jitomate', 'los jitomates')} con el ajo; cuela y cocina en la misma olla 8 minutos.`,
    'Agrega agua o caldo y cocina 10 minutos más.',
    `Sirve con las tiras de tortilla, ${amt(ing, 'queso panela')} de queso panela y aguacate encima.`,
  ]),
  recipe('Calabacitas rellenas de queso', 'dinner', ['vegetarian'], ['lácteos'], 12, 20, 2, [
    ri('calabacita', 4, 'pieza'), ri('queso oaxaca', 80, 'g'), ri('jitomate', 1, 'pieza'), ri('cebolla blanca', 0.25, 'pieza'),
  ], (ing) => [
    'Precalienta el horno a 190°C.',
    `Corta ${noun(ing, 'calabacita', 'la calabacita', 'las calabacitas')} a la mitad a lo largo y ahueca un poco el centro.`,
    'Sofríe la cebolla y el jitomate picados 5 minutos y rellena las calabacitas.',
    `Cubre con ${amt(ing, 'queso oaxaca')} de queso oaxaca y hornea 15-18 minutos, hasta que las calabacitas estén suaves y el queso derrita.`,
  ]),
  recipe('Camarones con calabacita', 'dinner', [], ['mariscos'], 10, 12, 2, [
    ri('camarón', 250, 'g'), ri('calabacita', 2, 'pieza'), ri('ajo', 2, 'diente'), ri('aceite de oliva', 1, 'cda'),
  ], (ing) => [
    `Saltea el ajo en ${amt(ing, 'aceite de oliva')} de aceite 1 minuto; agrega ${noun(ing, 'calabacita', 'la calabacita', 'las calabacitas')} en cubos y cocina 5 minutos.`,
    `Incorpora ${amt(ing, 'camarón')} de camarón y cocina 3-4 minutos más, hasta que estén rosados.`,
    'Sazona con sal y pimienta al gusto.',
  ]),
  recipe('Bistec a la mexicana', 'dinner', [], [], 10, 15, 2, [
    ri('bistec de res', 250, 'g'), ri('jitomate', 2, 'pieza'), ri('cebolla blanca', 0.5, 'pieza'), ri('chile serrano', 1, 'pieza'),
  ], (ing) => [
    `Corta ${amt(ing, 'bistec de res')} de bistec en tiras y sazona con sal.`,
    'Sella la carne en un sartén caliente 3-4 minutos.',
    'Agrega jitomate, cebolla y chile picados; cocina 8-10 minutos más, hasta que las verduras estén suaves.',
  ]),
  recipe('Pollo en salsa de chile guajillo', 'dinner', [], [], 12, 30, 2, [
    ri('muslo de pollo', 4, 'pieza'), ri('chile guajillo', 3, 'pieza'), ri('ajo', 2, 'diente'), ri('cebolla blanca', 0.25, 'pieza'),
  ], (ing) => [
    `Hierve ${noun(ing, 'chile guajillo', 'el chile guajillo', 'los chiles guajillo')} 8 minutos; licúa con el ajo, la cebolla y un poco de agua.`,
    `Sella ${noun(ing, 'muslo de pollo', 'el muslo de pollo', 'los muslos de pollo')} en un sartén 5 minutos por lado.`,
    'Agrega la salsa colada y un poco de agua si hace falta para cubrir a la mitad; cocina tapado 25-30 minutos a fuego medio-bajo, volteando a la mitad, hasta que el pollo esté bien cocido cerca del hueso (el jugo debe salir claro).',
  ]),
];
