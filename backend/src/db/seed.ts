import { pool } from './pool';

interface VocabSeed {
  spanish: string;
  english: string;
  gender?: 'm' | 'f' | null;
}

interface LessonSeed {
  title: string;
  vocabulary: VocabSeed[];
  grammar: {
    title: string;
    explanationEn: string;
    examples: { es: string; en: string }[];
  };
  sentenceBuilder: { promptEn: string; words: string[]; correctOrder: string[] }[];
  fillInBlank: { sentence: string; answer: string; hintEn?: string }[];
  dialogue: { speaker: string; es: string; en: string }[];
  cultureNote: string;
}

interface UnitSeed {
  title: string;
  description: string;
  lessons: LessonSeed[];
}

const A1_UNITS: UnitSeed[] = [
  {
    title: 'Greetings & Introductions',
    description: 'Say hello, introduce yourself, and ask basic questions.',
    lessons: [
      {
        title: 'Hola, ¿qué tal?',
        vocabulary: [
          { spanish: 'hola', english: 'hello' },
          { spanish: 'buenos días', english: 'good morning' },
          { spanish: 'buenas noches', english: 'good night' },
          { spanish: 'adiós', english: 'goodbye' },
          { spanish: 'gracias', english: 'thank you' },
          { spanish: 'por favor', english: 'please' },
        ],
        grammar: {
          title: 'Greetings are time-of-day specific',
          explanationEn:
            'Spanish greetings change depending on the time of day, similar to English "good morning/afternoon/evening". Unlike English, "buenas noches" is used both as a greeting at night and as "goodnight".',
          examples: [
            { es: 'Buenos días, ¿cómo está usted?', en: 'Good morning, how are you (formal)?' },
            { es: 'Buenas noches, hasta mañana.', en: 'Good night, see you tomorrow.' },
          ],
        },
        sentenceBuilder: [
          {
            promptEn: 'Good morning, thank you very much.',
            words: ['Buenos', 'días,', 'gracias', 'mucho'],
            correctOrder: ['Buenos', 'días,', 'gracias', 'mucho'],
          },
        ],
        fillInBlank: [{ sentence: '___ días, ¿cómo estás?', answer: 'Buenos', hintEn: 'Good (morning)' }],
        dialogue: [
          { speaker: 'Ana', es: '¡Hola! ¿Qué tal?', en: 'Hi! How are you?' },
          { speaker: 'Luis', es: 'Bien, gracias. ¿Y tú?', en: 'Good, thanks. And you?' },
        ],
        cultureNote: 'In Spain, friends greet each other with two kisses on the cheek, while in Latin America one kiss is more common.',
      },
      {
        title: 'Me llamo...',
        vocabulary: [
          { spanish: 'me llamo', english: 'my name is' },
          { spanish: 'mucho gusto', english: 'nice to meet you' },
          { spanish: 'el nombre', english: 'name', gender: 'm' },
          { spanish: 'soy de', english: 'I am from' },
          { spanish: 'el amigo', english: 'friend (male)', gender: 'm' },
          { spanish: 'la amiga', english: 'friend (female)', gender: 'f' },
        ],
        grammar: {
          title: '"Me llamo" vs "Soy"',
          explanationEn:
            '"Me llamo" literally means "I call myself" and is the most common way to say your name. "Soy" (I am) can also introduce your name, but is more often used for nationality or profession.',
          examples: [
            { es: 'Me llamo Carlos.', en: 'My name is Carlos.' },
            { es: 'Soy de México.', en: 'I am from Mexico.' },
          ],
        },
        sentenceBuilder: [
          {
            promptEn: 'My name is Ana, nice to meet you.',
            words: ['Me', 'llamo', 'Ana,', 'mucho', 'gusto'],
            correctOrder: ['Me', 'llamo', 'Ana,', 'mucho', 'gusto'],
          },
        ],
        fillInBlank: [{ sentence: '___ Pedro, mucho gusto.', answer: 'Me llamo', hintEn: 'My name is' }],
        dialogue: [
          { speaker: 'Sofía', es: 'Me llamo Sofía, ¿y tú?', en: "My name is Sofía, and you?" },
          { speaker: 'Tomás', es: 'Me llamo Tomás. Mucho gusto.', en: 'My name is Tomás. Nice to meet you.' },
        ],
        cultureNote: 'Many Spanish speakers have two surnames — one from each parent — which is why official documents often list four names.',
      },
    ],
  },
  {
    title: 'Numbers & Dates',
    description: 'Count, tell time, and talk about days and months.',
    lessons: [
      {
        title: 'Los números del 1 al 20',
        vocabulary: [
          { spanish: 'uno', english: 'one' },
          { spanish: 'dos', english: 'two' },
          { spanish: 'tres', english: 'three' },
          { spanish: 'diez', english: 'ten' },
          { spanish: 'quince', english: 'fifteen' },
          { spanish: 'veinte', english: 'twenty' },
        ],
        grammar: {
          title: 'Numbers 1-20 are mostly irregular',
          explanationEn:
            'Unlike numbers from 21 onward, which follow a "veinte y uno" pattern (contracted to veintiuno), numbers 1-20 in Spanish each have a unique form that must be memorized.',
          examples: [
            { es: 'Tengo tres hermanos.', en: 'I have three siblings.' },
            { es: 'Son las diez.', en: "It's ten o'clock." },
          ],
        },
        sentenceBuilder: [
          {
            promptEn: 'I have two friends.',
            words: ['Tengo', 'dos', 'amigos'],
            correctOrder: ['Tengo', 'dos', 'amigos'],
          },
        ],
        fillInBlank: [{ sentence: 'Tengo ___ años.', answer: 'veinte', hintEn: 'twenty' }],
        dialogue: [
          { speaker: 'Mateo', es: '¿Cuántos años tienes?', en: 'How old are you?' },
          { speaker: 'Lucía', es: 'Tengo quince años.', en: 'I am fifteen years old.' },
        ],
        cultureNote: 'In most Spanish-speaking countries, turning 15 ("quinceañera") is a major celebration for girls, similar to a sweet sixteen.',
      },
      {
        title: 'Los días y los meses',
        vocabulary: [
          { spanish: 'lunes', english: 'Monday' },
          { spanish: 'viernes', english: 'Friday' },
          { spanish: 'domingo', english: 'Sunday' },
          { spanish: 'enero', english: 'January' },
          { spanish: 'la semana', english: 'week', gender: 'f' },
          { spanish: 'el mes', english: 'month', gender: 'm' },
        ],
        grammar: {
          title: 'Days and months are lowercase',
          explanationEn:
            'In Spanish, days of the week and months are NOT capitalized unless they start a sentence, which differs from English convention.',
          examples: [
            { es: 'Hoy es lunes.', en: 'Today is Monday.' },
            { es: 'Mi cumpleaños es en enero.', en: 'My birthday is in January.' },
          ],
        },
        sentenceBuilder: [
          {
            promptEn: 'Today is Friday.',
            words: ['Hoy', 'es', 'viernes'],
            correctOrder: ['Hoy', 'es', 'viernes'],
          },
        ],
        fillInBlank: [{ sentence: 'Hoy es ___.', answer: 'domingo', hintEn: 'Sunday' }],
        dialogue: [
          { speaker: 'Diego', es: '¿Qué día es hoy?', en: 'What day is it today?' },
          { speaker: 'Elena', es: 'Hoy es viernes, ¡por fin!', en: "Today is Friday, finally!" },
        ],
        cultureNote: 'The Spanish-speaking work week traditionally runs Monday to Saturday in some countries, with Sunday reserved for family time.',
      },
    ],
  },
  {
    title: 'Colors & Objects',
    description: 'Describe everyday objects and their colors.',
    lessons: [
      {
        title: 'Los colores',
        vocabulary: [
          { spanish: 'rojo', english: 'red' },
          { spanish: 'azul', english: 'blue' },
          { spanish: 'verde', english: 'green' },
          { spanish: 'amarillo', english: 'yellow' },
          { spanish: 'negro', english: 'black' },
          { spanish: 'blanco', english: 'white' },
        ],
        grammar: {
          title: 'Adjective agreement with gender',
          explanationEn:
            'Color adjectives ending in -o change to -a for feminine nouns (rojo → roja), while colors ending in other letters like "verde" or "azul" stay the same for both genders.',
          examples: [
            { es: 'El coche rojo.', en: 'The red car.' },
            { es: 'La casa roja.', en: 'The red house.' },
          ],
        },
        sentenceBuilder: [
          {
            promptEn: 'The house is blue.',
            words: ['La', 'casa', 'es', 'azul'],
            correctOrder: ['La', 'casa', 'es', 'azul'],
          },
        ],
        fillInBlank: [{ sentence: 'El cielo es ___.', answer: 'azul', hintEn: 'blue' }],
        dialogue: [
          { speaker: 'Marta', es: '¿De qué color es tu mochila?', en: 'What color is your backpack?' },
          { speaker: 'Iván', es: 'Es verde y negra.', en: "It's green and black." },
        ],
        cultureNote: 'In Mexico, the colors of the flag (green, white, red) are a frequent motif in everyday objects and decorations.',
      },
    ],
  },
  {
    title: 'Family Members',
    description: 'Talk about your family and relationships.',
    lessons: [
      {
        title: 'La familia',
        vocabulary: [
          { spanish: 'la madre', english: 'mother', gender: 'f' },
          { spanish: 'el padre', english: 'father', gender: 'm' },
          { spanish: 'el hermano', english: 'brother', gender: 'm' },
          { spanish: 'la hermana', english: 'sister', gender: 'f' },
          { spanish: 'los abuelos', english: 'grandparents', gender: 'm' },
          { spanish: 'el hijo', english: 'son', gender: 'm' },
        ],
        grammar: {
          title: 'Possessive adjectives',
          explanationEn:
            '"Mi" (my) and "tu" (your) do not change for gender, only for number: "mi hermano" / "mis hermanos". This is simpler than in English where possessives never change at all, but trips up beginners expecting full agreement.',
          examples: [
            { es: 'Mi hermano es alto.', en: 'My brother is tall.' },
            { es: 'Mis hermanos son altos.', en: 'My brothers are tall.' },
          ],
        },
        sentenceBuilder: [
          {
            promptEn: 'My mother and my father are here.',
            words: ['Mi', 'madre', 'y', 'mi', 'padre', 'están', 'aquí'],
            correctOrder: ['Mi', 'madre', 'y', 'mi', 'padre', 'están', 'aquí'],
          },
        ],
        fillInBlank: [{ sentence: 'Mi ___ se llama Rosa.', answer: 'madre', hintEn: 'mother' }],
        dialogue: [
          { speaker: 'Carlos', es: '¿Cuántos hermanos tienes?', en: 'How many siblings do you have?' },
          { speaker: 'Valeria', es: 'Tengo un hermano y una hermana.', en: 'I have one brother and one sister.' },
        ],
        cultureNote: 'Extended family — including aunts, uncles, and cousins — typically plays a much larger day-to-day role in Latin American households than in many English-speaking cultures.',
      },
    ],
  },
  {
    title: 'Food & Drinks',
    description: 'Order food, talk about meals, and express preferences.',
    lessons: [
      {
        title: 'La comida y la bebida',
        vocabulary: [
          { spanish: 'el agua', english: 'water', gender: 'f' },
          { spanish: 'el café', english: 'coffee', gender: 'm' },
          { spanish: 'el pan', english: 'bread', gender: 'm' },
          { spanish: 'la fruta', english: 'fruit', gender: 'f' },
          { spanish: 'quiero', english: 'I want' },
          { spanish: 'la cuenta', english: 'the bill', gender: 'f' },
        ],
        grammar: {
          title: '"Quiero" + noun/infinitive',
          explanationEn:
            '"Quiero" (I want) is one of the most useful beginner verbs. It can be followed directly by a noun ("Quiero agua") or by an infinitive verb ("Quiero comer").',
          examples: [
            { es: 'Quiero un café, por favor.', en: 'I want a coffee, please.' },
            { es: 'Quiero comer fruta.', en: 'I want to eat fruit.' },
          ],
        },
        sentenceBuilder: [
          {
            promptEn: 'I want water, please.',
            words: ['Quiero', 'agua,', 'por', 'favor'],
            correctOrder: ['Quiero', 'agua,', 'por', 'favor'],
          },
        ],
        fillInBlank: [{ sentence: '___ un café, por favor.', answer: 'Quiero', hintEn: 'I want' }],
        dialogue: [
          { speaker: 'Camarero', es: '¿Qué desea?', en: 'What would you like?' },
          { speaker: 'Cliente', es: 'Quiero pan y un café, gracias.', en: 'I want bread and a coffee, thanks.' },
        ],
        cultureNote: 'In Spain, "el desayuno" (breakfast) is often light — just coffee and toast — with the largest meal of the day eaten around 2pm.',
      },
    ],
  },
];

async function clearExisting() {
  await pool.query('DELETE FROM srs_cards');
  await pool.query('DELETE FROM user_progress');
  await pool.query('DELETE FROM vocabulary');
  await pool.query('DELETE FROM lessons');
  await pool.query('DELETE FROM units');
}

async function seed() {
  await clearExisting();

  for (let unitIndex = 0; unitIndex < A1_UNITS.length; unitIndex++) {
    const unitSeed = A1_UNITS[unitIndex];
    const unitResult = await pool.query(
      `INSERT INTO units (title, level, order_index, description) VALUES ($1, 'A1', $2, $3) RETURNING id`,
      [unitSeed.title, unitIndex, unitSeed.description]
    );
    const unitId = unitResult.rows[0].id;

    for (let lessonIndex = 0; lessonIndex < unitSeed.lessons.length; lessonIndex++) {
      const lessonSeed = unitSeed.lessons[lessonIndex];
      const contentJson = {
        vocabulary: lessonSeed.vocabulary,
        grammar: lessonSeed.grammar,
        sentenceBuilder: lessonSeed.sentenceBuilder,
        fillInBlank: lessonSeed.fillInBlank,
        dialogue: lessonSeed.dialogue,
        cultureNote: lessonSeed.cultureNote,
      };

      const lessonResult = await pool.query(
        `INSERT INTO lessons (unit_id, title, level, order_index, content_json)
         VALUES ($1, $2, 'A1', $3, $4) RETURNING id`,
        [unitId, lessonSeed.title, lessonIndex, JSON.stringify(contentJson)]
      );
      const lessonId = lessonResult.rows[0].id;

      for (const vocab of lessonSeed.vocabulary) {
        await pool.query(
          `INSERT INTO vocabulary (spanish, english, gender, lesson_id, tags)
           VALUES ($1, $2, $3, $4, $5)`,
          [vocab.spanish, vocab.english, vocab.gender ?? null, lessonId, ['A1', unitSeed.title]]
        );
      }
    }
  }

  console.log('Seed complete: 5 units, 10 lessons.');
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
