/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

/**
 * Collection ID: bancodelinguagem
 * Interface for BancodeLinguagem
 */
export interface BancodeLinguagem {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  suggestionTitle?: string;
  /** @wixFieldType text */
  category?: string;
  /** @wixFieldType text */
  suggestionText?: string;
  /** @wixFieldType text */
  explanation?: string;
  /** @wixFieldType text */
  usageExample?: string;
}


/**
 * Collection ID: eventosdalinhadotempo
 * Interface for EventosdaLinhadoTempo
 */
export interface EventosdaLinhadoTempo {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  eventName?: string;
  /** @wixFieldType text */
  eventDescription?: string;
  /** @wixFieldType datetime */
  eventDate?: Date | string;
  /** @wixFieldType text */
  eraName?: string;
  /** @wixFieldType text */
  storyId?: string;
  /** @wixFieldType text */
  characterIds?: string;
  /** @wixFieldType text */
  chapterId?: string;
  /** @wixFieldType multi_reference */
  historias?: Stories[];
  /** @wixFieldType multi_reference */
  personagens?: Personagens[];
}


/**
 * Collection ID: historias
 * Interface for Stories
 */
export interface Stories {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType multi_reference */
  allevents?: EventosdaLinhadoTempo[];
  /** @wixFieldType multi_reference */
  allrelationships?: CharacterRelationships[];
  /** @wixFieldType multi_reference */
  allcharacters?: Personagens[];
  /** @wixFieldType text */
  title?: string;
  /** @wixFieldType text */
  synopsis?: string;
  /** @wixFieldType text */
  storyContent?: string;
  /** @wixFieldType text */
  authorId?: string;
  /** @wixFieldType datetime */
  createdAt?: Date | string;
  /** @wixFieldType datetime */
  lastUpdatedAt?: Date | string;
  /** @wixFieldType text */
  status?: string;
}


/**
 * Collection ID: personagens
 * Interface for Personagens
 */
export interface Personagens {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  name?: string;
  /** @wixFieldType multi_reference */
  relationships?: CharacterRelationships[];
  /** @wixFieldType multi_reference */
  eventsinvolvedin?: EventosdaLinhadoTempo[];
  /** @wixFieldType reference */
  alternativeversionof?: Personagens;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType text */
  versionName?: string;
  /** @wixFieldType number */
  age?: number;
  /** @wixFieldType text */
  gender?: string;
  /** @wixFieldType text */
  appearance?: string;
  /** @wixFieldType image */
  portrait?: string;
  /** @wixFieldType multi_reference */
  historias?: Stories[];
}


/**
 * Collection ID: relacoesdepersonagens
 * Interface for CharacterRelationships
 */
export interface CharacterRelationships {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  characterOneId?: string;
  /** @wixFieldType text */
  characterTwoId?: string;
  /** @wixFieldType text */
  relationshipType?: string;
  /** @wixFieldType text */
  storyId?: string;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType multi_reference */
  historias?: Stories[];
  /** @wixFieldType multi_reference */
  personagens?: Personagens[];
}
