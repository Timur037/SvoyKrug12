// Feature flags. EARLY_STAGE hides everything except the dinner format —
// strategy decision from 2026-06-18: dinners only until day 60+.
export const EARLY_STAGE = true

export const FLAGS = {
  showFormatCategories: !EARLY_STAGE, // кофе/бранч/прогулка/настолки chips on Home
  showGenderFilters:    !EARLY_STAGE, // женский/мужской/пары row on Home
  showFormatsScreen:    !EARLY_STAGE, // "о форматах" info screen
  showBuildCircle:      !EARLY_STAGE, // FAB «предложить вечер»
}

// Meetup kinds visible in the feed while EARLY_STAGE is on
export const EARLY_KINDS = ['УЖИН', 'ВЕЧЕР']
