import { pageType } from './page'
import { postType } from './post'
import { authorType } from './author'
import { categoryType } from './category'
import { homepageType } from './homepage'
import { bookmakerType } from './bookmaker'
import { bonusType } from './bonus'
import { comparisonTableTemplateType } from './comparisonTableTemplate'
import { siteSettingsType } from './siteSettings'
import { redirectType } from './redirect'
import { ligaStillingerType } from './ligaStillinger'

export const schemaTypes = [
  ligaStillingerType,
  siteSettingsType,
  homepageType,
  bookmakerType,
  bonusType,
  comparisonTableTemplateType,
  postType,
  pageType,
  authorType,
  categoryType,
  redirectType,
]
