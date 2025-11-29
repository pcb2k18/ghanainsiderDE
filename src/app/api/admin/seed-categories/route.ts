import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

/**
 * Admin endpoint to seed categories into the database
 *
 * IMPORTANT: This should only be run once during initial setup or if categories are missing
 *
 * Usage:
 * POST http://localhost:3000/api/admin/seed-categories
 *
 * Returns: List of created categories
 */

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

export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  try {
    // Check if categories already exist
    const { data: existingCategories, error: checkError } = await supabase
      .from('categories')
      .select('slug');

    if (checkError) throw checkError;

    if (existingCategories && existingCategories.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Categories already exist. Delete existing categories first if you want to re-seed.',
        existing: existingCategories.map((c) => c.slug),
      });
    }

    // Insert categories
    const { data, error } = await supabase
      .from('categories')
      .insert(CATEGORIES)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${data.length} categories`,
      data,
    });
  } catch (error) {
    console.error('Category seeding error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to seed categories',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check current categories
export async function GET(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch categories',
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint to clear all categories (use with caution!)
export async function DELETE(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const { error } = await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'All categories deleted',
    });
  } catch (error) {
    console.error('Delete categories error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete categories',
      },
      { status: 500 }
    );
  }
}
