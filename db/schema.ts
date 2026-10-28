import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const rooms = sqliteTable('rooms', {
 code: text('code').primaryKey(), data: text('data').notNull(), revision: integer('revision').notNull().default(0), updated: integer('updated').notNull()
});
export const requestLimits = sqliteTable('request_limits', {
 id:text('id').primaryKey(), count:integer('count').notNull(), expires:integer('expires').notNull()
});
