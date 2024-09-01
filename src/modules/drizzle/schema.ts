import { integer, json, pgTable, primaryKey, varchar } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { BookSource, BookSources } from 'src/core/types/shelvd.types'

// export const countries = pgTable('countries', {
//   id: serial('id').primaryKey(),
//   name: varchar('name', { length: 256 }),
// })
// export const cities = pgTable('cities', {
//   id: serial('id').primaryKey(),
//   name: varchar('name', { length: 256 }),
//   countryId: integer('country_id').references(() => countries.id),
// })

// export const cityRelation = relations(cities, ({ one }) => ({
//   country_city: one(countries, {
//     fields: [cities.countryId],
//     references: [countries.id],
//   }),
// }))

const listSchema = {
  key: varchar('key', { length: 256 }),
  slug: varchar('slug', { length: 256 }).notNull(),
  source: varchar('source', { length: 256, enum: BookSources }).default(
    BookSource.enum.shelvd,
  ),

  name: varchar('name', { length: 256 }),
  description: varchar('description', { length: 256 }).default(''),
  booksCount: integer('booksCount').default(0),
  // books: json('books').$type<Book[]>().default([]),
  bookKeys: json('bookKeys').$type<string[]>().default([]),
  creatorKey: varchar('creatorKey', { length: 256 }).notNull(),
}

export const coreLists = pgTable('core_lists', listSchema, (table) => ({
  pk: primaryKey({ columns: [table.slug, table.creatorKey] }),
  pkWithCustomName: primaryKey({
    name: 'slug_creatorKey',
    columns: [table.slug, table.creatorKey],
  }),
}))
export const insertCoreListSchema = createInsertSchema(coreLists)

export const createdLists = pgTable('created_lists', listSchema, (table) => ({
  pk: primaryKey({ columns: [table.slug, table.creatorKey] }),
  pkWithCustomName: primaryKey({
    name: 'slug_creatorKey',
    columns: [table.slug, table.creatorKey],
  }),
}))
export const insertCreatedListSchema = createInsertSchema(createdLists)

export const followingLists = pgTable('following_lists', {
  userId: varchar('userId', { length: 256 }).notNull().unique().primaryKey(),
  listKeys: json('listKeys').$type<string[]>().default([]),
})
export const insertFollowingListSchema = createInsertSchema(followingLists)
