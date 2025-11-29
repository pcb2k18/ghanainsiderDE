#!/usr/bin/env node

/**
 * Category Seeding Script
 *
 * This script seeds the categories table in Supabase
 *
 * Usage:
 *   node scripts/seed-categories.js
 *
 * Or via npm:
 *   npm run seed:categories
 */

const https = require('https');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Error: Missing environment variables');
  console.error('Please ensure .env.local contains:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const currentYear = new Date().getFullYear();

const CATEGORIES = [
  {
    name: 'Tod/Nachruf',
    slug: 'tod',
    description: 'Breaking news about celebrity deaths',
    template_structure: {
      sections: [
        {
          type: 'intro',
          title: null,
          word_count: '150-200',
          requirements: ['exact_keyword', 'trending_context', 'hook'],
        },
        {
          type: 'section',
          title: 'Todesursache von {name}',
          word_count: '200-250',
          requirements: ['cause', 'date', 'location'],
        },
        {
          type: 'section',
          title: '{name} Familie: Partner und Kinder',
          word_count: '150-200',
          requirements: ['spouse', 'children', 'family_background'],
        },
        {
          type: 'section',
          title: 'Karriere und Vermächtnis von {name}',
          word_count: '200-250',
          requirements: ['career_highlights', 'impact', 'legacy'],
        },
      ],
      title_template: '{name} Tod: {age}-Jähriger {profession} Verstorben',
      slug_template: `{name}-tod-ursache-${currentYear}`,
      nlp_terms: [
        'verstorben',
        'Todesursache',
        'Vermächtnis',
        'Karriere',
        'Familie',
        'Nachruf',
      ],
    },
    seo_defaults: {
      meta_title_template: `{name} Tod: Ursache, Familie & Vermächtnis ${currentYear}`,
      meta_description_template:
        '{name} ist verstorben. Alles über die Todesursache, Familie und das Vermächtnis. Aktuelle Details hier.',
      schema_type: ['NewsArticle', 'Person'],
    },
  },
  {
    name: 'Hochzeit',
    slug: 'hochzeit',
    description: 'Celebrity wedding news',
    template_structure: {
      sections: [
        {
          type: 'intro',
          title: null,
          word_count: '150-200',
          requirements: ['couple_names', 'wedding_date', 'location'],
        },
        {
          type: 'section',
          title: 'Die Hochzeit von {name1} und {name2}',
          word_count: '200-250',
          requirements: ['ceremony_details', 'venue', 'guests'],
        },
        {
          type: 'section',
          title: 'Liebesgeschichte: Wie sie sich kennenlernten',
          word_count: '150-200',
          requirements: ['how_they_met', 'relationship_timeline'],
        },
        {
          type: 'section',
          title: 'Was wir über die Zukunft wissen',
          word_count: '150-200',
          requirements: ['future_plans', 'quotes'],
        },
      ],
      title_template:
        '{name1} und {name2} Hochzeit: Alle Details zur Traumhochzeit',
      slug_template: `{name1}-{name2}-hochzeit-${currentYear}`,
      nlp_terms: [
        'Hochzeit',
        'Trauung',
        'Braut',
        'Bräutigam',
        'Ehepaar',
        'Liebesgeschichte',
      ],
    },
    seo_defaults: {
      meta_title_template: `{name1} & {name2} Hochzeit: Datum, Ort & alle Details ${currentYear}`,
      meta_description_template:
        '{name1} und {name2} haben geheiratet! Alle Infos zur Hochzeit, Location und Gäste.',
      schema_type: ['NewsArticle', 'Event'],
    },
  },
  {
    name: 'Breaking News',
    slug: 'breaking-news',
    description: 'General breaking news and updates',
    template_structure: {
      sections: [
        {
          type: 'intro',
          title: null,
          word_count: '150-200',
          requirements: ['what_happened', 'when', 'where', 'who'],
        },
        {
          type: 'section',
          title: 'Was ist passiert?',
          word_count: '200-300',
          requirements: ['detailed_account', 'timeline'],
        },
        {
          type: 'section',
          title: 'Reaktionen und Stellungnahmen',
          word_count: '150-200',
          requirements: ['official_statements', 'public_reaction'],
        },
        {
          type: 'section',
          title: 'Aktuelle Entwicklungen',
          word_count: '100-150',
          requirements: ['updates', 'what_next'],
        },
      ],
      title_template: '{headline}: {subheadline}',
      slug_template: `{topic}-${currentYear}`,
      nlp_terms: ['aktuell', 'breaking', 'Eilmeldung', 'Update', 'Entwicklung'],
    },
    seo_defaults: {
      meta_title_template: `{headline} - Aktuelle News ${currentYear}`,
      meta_description_template:
        '{summary} Alle aktuellen Informationen und Updates hier.',
      schema_type: ['NewsArticle'],
    },
  },
  {
    name: 'Gastbeitrag',
    slug: 'gastbeitrag',
    description: 'Guest posts from agencies',
    template_structure: {
      sections: [
        {
          type: 'flexible',
          min_sections: 3,
          max_sections: 10,
        },
      ],
      title_template: '{custom}',
      slug_template: '{custom}',
      nlp_terms: [],
    },
    seo_defaults: {
      meta_title_template: '{custom}',
      meta_description_template: '{custom}',
      schema_type: ['Article'],
    },
  },
];

async function seedCategories() {
  console.log('🌱 Starting category seeding...\n');

  // Check existing categories
  console.log('📋 Checking existing categories...');

  const checkUrl = `${SUPABASE_URL}/rest/v1/categories?select=slug`;

  try {
    const existing = await fetch(checkUrl, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
    }).then((res) => res.json());

    if (existing && existing.length > 0) {
      console.log('⚠️  Categories already exist:');
      existing.forEach((cat) => console.log(`   - ${cat.slug}`));
      console.log(
        '\n💡 To re-seed, delete existing categories from Supabase first.'
      );
      return;
    }

    console.log('✅ No existing categories found\n');
  } catch (error) {
    console.error('❌ Error checking categories:', error.message);
    process.exit(1);
  }

  // Insert categories
  console.log('📝 Inserting categories...');

  const insertUrl = `${SUPABASE_URL}/rest/v1/categories`;

  try {
    const response = await fetch(insertUrl, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(CATEGORIES),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const data = await response.json();

    console.log(`✅ Successfully seeded ${data.length} categories:\n`);
    data.forEach((cat) => {
      console.log(`   ✓ ${cat.name} (${cat.slug})`);
    });

    console.log('\n🎉 Category seeding complete!');
  } catch (error) {
    console.error('❌ Error inserting categories:', error.message);
    process.exit(1);
  }
}

// Run the script
seedCategories();
