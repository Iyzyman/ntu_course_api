import { createZodDto } from '@anatine/zod-nestjs'
import { User } from '@clerk/clerk-sdk-node'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { and, eq } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DRIZZLE_ORM } from 'src/core/constants/db.constants'
import {
  BookSource,
  DefaultListTypeInfo,
  List,
  ListData,
  ListInfo,
  ListType,
  ListTypeInfo,
} from 'src/core/types/shelvd.types'
import { getUniqueArray, getXorArray, getXorArrays } from 'src/core/utils/helpers'
import { ShelvdUtils } from 'src/core/utils/shelvd.utils'
import { z } from 'zod'
import * as schema from '../drizzle/schema'

export const CreateList = ListData
export class CreateListDTO extends createZodDto(CreateList) { }

export const GetCreatedList = z.object({
  userId: z.string().min(1).trim(),
  key: z.string().min(1).trim(),
})
export class GetCreatedListDTO extends createZodDto(GetCreatedList) { }

export const DeleteListByType = GetCreatedList.extend({
  type: ListType,
})
export class DeleteListByTypeDTO extends createZodDto(DeleteListByType) { }

export const UpdateListBooks = DeleteListByType.extend({
  addBookKeys: z.string().array().default([]).optional(),
  deleteBookKeys: z.string().array().default([]).optional(),
})
export class UpdateListBooksDTO extends createZodDto(UpdateListBooks) { }

export const GetList = z.object({
  userId: z.string().min(1).trim(),
  key: z.string().min(1).trim(),
  type: ListType.exclude(['following']),
})
export class GetListDTO extends createZodDto(GetList) { }

export const GetLists = z.object({
  userId: z.string().min(1).trim(),
  type: ListType,
})
export class GetListsDTO extends createZodDto(GetLists) { }

export const UpdateListFollows = z.object({
  userId: z.string().min(1).trim(),
  listKeys: z.string().array().default([]).transform(getUniqueArray),
})
export class UpdateListFollowsDTO extends createZodDto(UpdateListFollows) { }

const KeyChanges = z.object({
  prev: z.string().array().default([]).transform(getUniqueArray),
  curr: z.string().array().default([]).transform(getUniqueArray),
})
type KeyChanges = z.infer<typeof KeyChanges>
export const BulkUpdateListByBookKey = z.object({
  userId: z.string().min(1).trim(),

  bookKey: z.string().min(1).trim(),
  core: KeyChanges.optional(),
  created: KeyChanges.optional(),
})
export class BulkUpdateListByBookKeyDTO extends createZodDto(
  BulkUpdateListByBookKey,
) { }

export const UpdateList = GetCreatedList.extend({
  data: CreateList.omit({
    creator: true,
    bookKeys: true,
    booksCount: true,
  }).partial(),
})
export class UpdateListDTO extends createZodDto(UpdateList) { }

export const UpdateListByType = UpdateList.extend({
  type: ListType,
})
export class UpdateListByTypeDTO extends createZodDto(UpdateListByType) { }

@Injectable()
export class ListService {
  constructor(
    @Inject(DRIZZLE_ORM) private db: PostgresJsDatabase<typeof schema>,
  ) { }

  private typeSchemaMap = {
    [ListType.enum.core]: schema.coreLists,
    [ListType.enum.created]: schema.createdLists,
    [ListType.enum.following]: schema.followingLists,
  }
  //#endregion  //*======== UTILS ===========
  parseList(dbList: z.infer<typeof schema.insertCoreListSchema>): ListData {
    return ListData.parse({
      ...dbList,
      creator: {
        key: dbList.creatorKey,
      },
    }) as List
  }
  parseLists(
    dbLists: z.infer<typeof schema.insertCoreListSchema>[],
  ): ListData[] {
    if (!dbLists.length) return []
    return ShelvdUtils.sortLists(dbLists.map(this.parseList)) as ListData[]
  }
  //#endregion  //*======== UTILS ===========

  //#endregion  //*======== GETTERS ===========
  getList = async (payload: GetListDTO): Promise<ListData> => {
    const db =
      payload.type === 'created'
        ? this.db.query.createdLists
        : this.db.query.coreLists

    const dbList = await db.findFirst({
      where: (list, { eq, and }) =>
        and(eq(list.creatorKey, payload.userId), eq(list.key, payload.key)),
    })

    if (!dbList) return dbList

    const list = this.parseList(dbList)
    Logger.log(`ListService/getList`, {
      list,
      dbList,
    })
    return list
  }

  getUserLists = async (payload: GetListsDTO): Promise<ListData[]> => {
    const db =
      payload.type === 'created'
        ? this.db.query.createdLists
        : payload.type === 'following'
          ? this.db.query.followingLists
          : this.db.query.coreLists

    const creatorKey = payload.userId

    let lists: ListData[] = []

    if (payload.type === 'following') {
      let userFollowing = await this.db.query.followingLists.findFirst({
        where: (list, { eq }) => eq(list.userId, creatorKey),
      })

      const isInitRequired = !userFollowing
      if (isInitRequired)
        userFollowing =
          (await this.createFollowLists(payload))?.[0] ?? userFollowing

      if (!userFollowing || !(userFollowing?.listKeys ?? []).length)
        return lists

      for (const key of userFollowing.listKeys) {
        const delimiter = '/'
        const followListKey = key.split(delimiter)

        const isValidKey = followListKey.length === 2
        if (!isValidKey) continue

        const [creatorKey, listKey] = followListKey

        // get list by key from db
        const list = await this.getList(
          GetList.parse({
            userId: creatorKey,
            key: listKey,
            type: ListType.enum.created,
          }),
        )

        Logger.log(
          { breakpoint: '[list.service.ts:166]/getUserLists/following' },
          {
            followListKey,
            list,
          },
        )

        if (!list) continue
        lists.push(list)
      }

      return lists
    }

    lists = await db.findMany({
      where: (list, { eq }) => eq(list.creatorKey, creatorKey),
    })

    // init iff is core
    const isInitRequired = payload.type === 'core' && !lists.length
    if (isInitRequired) lists = await this.createCoreLists(payload)

    return this.parseLists(lists)
  }

  getUserListsKeys = async (user: User): Promise<ListTypeInfo> => {
    const listKeyRecord: ListTypeInfo = DefaultListTypeInfo

    for (const type of ListType.options) {
      const payload = GetLists.parse({
        userId: user.id,
        type,
      })

      const lists = (await this.getUserLists(payload)).map(
        ({ key, slug, booksCount, name, bookKeys }) =>
          ListInfo.parse({
            key,
            slug,
            name,
            booksCount,
            bookKeys,
          }),
      )

      listKeyRecord[type] = ShelvdUtils.sortLists(lists)
    }
    return listKeyRecord
  }

  getUserListsKeyAvailability = async (
    payload: GetListDTO,
  ): Promise<boolean> => {
    const list = await this.getList(payload)
    const isAvailable = !list
    Logger.log({ breakpoint: '[list.service.ts:186]' }, { list, isAvailable })
    return isAvailable
  }
  //#endregion  //*======== GETTERS ===========

  //#endregion  //*======== CREATORS ===========
  createCoreLists = async (payload: GetListsDTO) => {
    if (payload.type !== 'core') return []
    Logger.log(`ListService/createCoreLists`, payload)

    const listNames: string[] = ['To Read', 'Reading', 'Completed', 'DNF']
    const lists = listNames.map((name) => {
      const slug = ShelvdUtils.createSlug(name)
      const source = BookSource.enum.shelvd
      const creatorKey = payload.userId

      return schema.insertCoreListSchema.parse({
        key: slug,
        slug,
        source,
        name,
        description: '',
        bookKeys: [],
        creatorKey,
      })
    })

    return this.db
      .insert(schema.coreLists)
      .values(lists as any[])
      .returning()
  }

  createList = async (list: CreateListDTO) => {
    const creatorKey = list?.creator?.key ?? ''
    if (!creatorKey) return []

    const lists: ListData[] = this.parseLists(
      await this.db
        .insert(schema.createdLists)
        .values(
          schema.insertCreatedListSchema.parse({
            ...list,
            creatorKey,
          }) as any,
        )
        .returning(),
    )
    return lists
  }

  createFollowLists = async (payload: GetListsDTO) => {
    const userId = payload.userId
    if (!userId) return []

    return await this.db
      .insert(schema.followingLists)
      .values(
        schema.insertFollowingListSchema.parse({
          userId,
        }) as any,
      )
      .returning()
  }
  //#endregion  //*======== CREATORS ===========

  //#endregion  //*======== UPDATERS ===========
  updateListFollows = async (payload: UpdateListFollowsDTO) => {
    // verify list keys iff not empty
    const unverifiedKeys = payload?.listKeys ?? []
    const verifiedKeys: Set<string> = new Set<string>()
    const invalidKeys: Set<string> = new Set<string>()

    const lists: ListData[] = []

    for (const key of unverifiedKeys) {
      const delimiter = '/'
      const followListKey = key.split(delimiter)

      const isValidKey = followListKey.length === 2
      if (!isValidKey) {
        invalidKeys.add(key)
        continue
      }

      const [creatorKey, listKey] = followListKey

      // get list by key from db
      const list = await this.getList(
        GetList.parse({
          userId: creatorKey,
          key: listKey,
          type: ListType.enum.created,
        }),
      )
      if (!list) {
        invalidKeys.add(key)
        continue
      }

      verifiedKeys.add(key)
      lists.push(list)
    }

    const dbSchema = this.typeSchemaMap['following']
    const updatedListFollows = schema.insertFollowingListSchema.parse({
      ...payload,
      listKeys: Array.from(verifiedKeys),
    })

    await this.db
      .update(dbSchema)
      .set(updatedListFollows as any)
      .where(eq(dbSchema.userId, payload.userId))
      .returning()

    return lists
  }

  updateListDetails = async (
    payload: UpdateListByTypeDTO,
  ): Promise<ListData[]> => {
    // exit: can only edit created lists
    if (payload.type !== 'created') return []

    const dbSchema = this.typeSchemaMap[payload.type]

    // get list by key from db
    const list = await this.getList(GetList.parse(payload))
    if (!list) return []

    // exit: if is not creator
    const isCreator = payload.userId === list.creator.key
    if (!isCreator) return []

    const creatorKey = list?.creator?.key ?? payload.userId
    const updatedList = schema.insertCreatedListSchema.parse({
      ...list,
      ...payload.data,
      creatorKey,
    })

    const lists: ListData[] = this.parseLists(
      await this.db
        .update(dbSchema)
        .set(updatedList as any)
        .where(
          and(
            eq(dbSchema.key, payload.key),
            eq(dbSchema.creatorKey, payload.userId),
          ),
        )
        .returning(),
    )

    // Logger.log({ breakpoint: '[list.service.ts:394]/updateListDetails' }, { lists })

    // // update follow lists
    // const followListKey = `${creatorKey}/${list.key}`
    // const updatedFollowListKey = `${creatorKey}/${updatedList.key}`

    // // const averagePrice = this.db
    // //   .$with('following_lists')
    // //   .as(
    // //     this.db
    // //       .select({value: sql`avg(${products.price})`.as('value')})
    // //       .from(this.typeSchemaMap['following']),
    // //   )

    // // const following = this.typeSchemaMap['following']

    // const listFollowers = await this.db.query.followingLists.findMany({
    //   where: (follow) => arrayContains(follow.listKeys, [followListKey]),
    // })

    // // const listFollowers = this.db.$with('list_followers').as(
    // //   this.db
    // //     .select()
    // //     .from(following)
    // //     .where(arrayContains(following.listKeys, [followListKey])),
    // // )

    // // await this.db.with(listFollowers)
    // //   .update()
    // // const result = await this.db.with(listFollowers).select().from(listFollowers)

    // Logger.log(
    //   { breakpoint: '[list.service.ts:387]/updateListDetails' },
    //   { listFollowers },
    // )

    // // if(!listFollowers.)
    // // await this.db
    // // .update(this.typeSchemaMap['following'])
    // // .set({
    // //   listKeys:
    // // })
    // // const listKeys: string[] = userFollowing.listKeys ?? []
    // // if (!listKeys.length) return lists

    // // lists = await this.db.query.createdLists.findMany({
    // //   where: (list, { inArray }) => inArray(list.key, listKeys),
    // // })

    return lists
  }
  //#endregion  //*======== UPDATERS ===========

  //#endregion  //*======== DELETERS ===========
  deleteList = async (
    payload: DeleteListByTypeDTO,
  ): Promise<{ key: List['key'] }[]> => {
    //exit: can only delete created lists
    if (payload.type !== 'created') return []

    const dbSchema = this.typeSchemaMap[payload.type]
    // get list by key from db
    const list = await this.getList(
      GetList.parse({
        ...payload,
        type: 'created',
      }),
    )
    if (!list) return []

    Logger.log(`ListService/deleteList`, payload, list)

    // exit: if is not creator
    const isCreator = payload.userId === list.creator.key
    if (!isCreator) return []

    return await this.db
      .delete(dbSchema)
      .where(
        and(
          eq(dbSchema.key, payload.key),
          eq(dbSchema.creatorKey, payload.userId),
        ),
      )
      .returning({
        key: dbSchema.key,
      })
  }
  //#endregion  //*======== DELETERS ===========

  //TODO(following): update list followers

  //TODO: dedicated endpoint to add/remove books
  updateListBooks = async (payload: UpdateListBooksDTO) => {
    const isEmptyKeys = !payload.addBookKeys && !payload.deleteBookKeys

    //exit: can only remove books from created lists
    if (payload.type === 'following' || isEmptyKeys) return []

    const dbSchema = this.typeSchemaMap[payload.type]
    // get list by key from db
    const list = await this.getList(GetList.parse(payload))
    if (!list) return []

    // exit: if is not creator
    const isCreator = payload.userId === list.creator.key
    if (!isCreator) return []

    // push to books (maintain book.key uniqueness)
    const listBooks: string[] = list.bookKeys ?? []
    const { array1: addBooks, array2: removeBooks } = getXorArrays(
      payload.addBookKeys ?? [],
      payload.deleteBookKeys ?? [],
    )
    if (addBooks.length) listBooks.push(...addBooks)
    const bookKeys = getUniqueArray(listBooks).filter(
      (bookKey) => !removeBooks.includes(bookKey),
    )
    const booksCount = bookKeys.length

    const updatedList = schema.insertCreatedListSchema.parse({
      ...list,
      bookKeys,
      booksCount,
      creatorKey: list?.creator?.key ?? payload.userId,
    })

    Logger.log(`ListService/updateListBooks`, {
      listBooks: listBooks,
      addBooks: addBooks,
      removeBooks: removeBooks,
      expectedBooksCount: listBooks.length - addBooks.length,
      booksCount,
    })

    const lists: ListData[] = this.parseLists(
      await this.db
        .update(dbSchema)
        .set(updatedList as any)
        .where(
          and(
            eq(dbSchema.key, payload.key),
            eq(dbSchema.creatorKey, payload.userId),
          ),
        )
        .returning(),
    )
    return lists
  }

  bulkUpdateListMembership = async (
    payload: BulkUpdateListByBookKeyDTO,
  ): Promise<boolean> => {
    let isChanged = false
    // exit: no changes
    if (!payload.core && !payload.created) return isChanged

    // created
    const updateCreated = async (type: ListType, changes: KeyChanges) => {
      let isUpdated = false
      if (!changes) return isUpdated

      const { prev, curr } = changes
      const isSame = !getXorArray(prev, curr).length
      if (isSame) return isUpdated

      const query = GetLists.parse({
        userId: payload.userId,
        type,
      })

      const lists = await this.getUserLists(query)
      if (!lists.length) return isUpdated

      // 1. remove from prev
      const prevLists = lists.filter(
        ({ key, bookKeys }) =>
          prev.includes(key) && bookKeys.includes(payload.bookKey),
      )
      for (const prevList of prevLists) {
        const removePayload = UpdateListBooks.parse({
          userId: payload.userId,
          key: prevList.key,
          type,
          deleteBookKeys: [payload.bookKey],
        })

        await this.updateListBooks(removePayload)
      }

      // 2. add from curr
      const currLists = lists.filter(({ key }) => curr.includes(key))
      for (const currList of currLists) {
        const addPayload = UpdateListBooks.parse({
          userId: payload.userId,
          key: currList.key,
          type,
          addBookKeys: [payload.bookKey],
        })

        await this.updateListBooks(addPayload)
      }

      isUpdated = true
      return isUpdated
    }

    const isCoreUpdated = await updateCreated(
      ListType.enum.core,

      payload.core,
    )
    const isCreatedUpdated = await updateCreated(
      ListType.enum.created,

      payload.created,
    )

    isChanged = isCoreUpdated || isCreatedUpdated
    return isChanged
  }
}
