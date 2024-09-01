import {BookSource, List, ListData} from '../types/shelvd.types'

export class ShelvdUtils {
  static source: BookSource = 'shelvd'

  static createSlug = (
    input: string,
    options: Partial<{
      delimiter: string
    }> = {
      delimiter: '-',
    },
  ): string => input.toLowerCase().replace(/\s+/g, options.delimiter ?? '-')

  static createCoreLists = (): List[] => {
    const coreListNames: string[] = ['To Read', 'Reading', 'Completed', 'DNF']
    const lists: List[] = coreListNames.map((name) => {
      const slug = ShelvdUtils.createSlug(name)
      const source = BookSource.enum.shelvd

      const list: List = {
        key: slug,
        source,
        name,
        books: [],
      }

      return list
    })
    return lists
  }

  static sortLists = (lists: ListData[]): ListData[] => {
    const orderCore = ['reading', 'to-read', 'completed', 'dnf']
    return lists.sort((a, b) =>
      orderCore.includes(a.key)
        ? orderCore.indexOf(a.key) - orderCore.indexOf(b.key)
        : a.key.localeCompare(b.key, 'en', {numeric: true}),
    )
  }

  static printAuthorName = (
    name: string = '',
    options: Partial<{
      delimiter: string
      mandatoryNames?: string[]
    }> = {
      delimiter: ',',
      mandatoryNames: [],
    },
  ) => {
    let printName = name.trim()
    if (!printName.length) return printName

    const names = printName.split(options.delimiter ?? ',')
    const threshold = 2
    if (names.length <= threshold) return names.join(', ')

    const mandatoryNames = options?.mandatoryNames ?? []
    const mandatoryNamesSet = new Set(mandatoryNames)

    // Check if any mandatory names are present
    const hasMandatoryNames = names.some((author) =>
      mandatoryNamesSet.has(author.trim()),
    )

    // Modify the output based on the presence of mandatory names
    if (hasMandatoryNames) {
      printName = `${mandatoryNames.join(', ')}, +${names.length - mandatoryNames.length} others`
    } else {
      printName = `${names.slice(0, threshold)}, +${names.length - threshold} others`
    }
    return printName
  }
}
