import { FIRST_ALPHABET_REGEX, SPLITTING_WORDS_REGEX } from '../@config/constants'

/**
 * This is a helper function to help the wallet user see prefilled initials.
 *
 * @param namePart1 is first part of the username. Also known as firstName
 * @param namePart2 is 2nd part of the username. Also known as lastName, surname or remaining part of the name etc.
 *
 * @return the initials selected by default
 */
export const getGeneralInitialsOfUserName = (namePart1?: string, namePart2?: string): string => {
  let initials = ''
  initials += getPartialInitials(namePart1)
  initials += getFirstAlphabetOfLastWord(namePart2)
  if (initials.length < 1) {
    initials = '?'
  }

  return initials.toUpperCase()
}

/**
 * This is a helper function to help the wallet user see prefilled initials.
 *
 * @param namePart is part of the username
 *
 * @return the partial initials selected by default
 */
export const getPartialInitials = (namePart?: string): string => {
  let initials = ''
  if (namePart && namePart.length > 0) {
    const firstAlphabetIndex: number = namePart.search(FIRST_ALPHABET_REGEX)
    initials += firstAlphabetIndex > -1 ? namePart[firstAlphabetIndex] : ''
  }
  return initials
}

/**
 * This is a helper function to help the wallet user see prefilled initials.
 *
 * @param namePart is part of the username
 *
 * @return the partial initials selected by default i.e. first alphabet last word
 */
function getFirstAlphabetOfLastWord(namePart?: string): string {
  if (namePart) {
    const words = namePart.split(SPLITTING_WORDS_REGEX)
    const lastWord = words[words.length - 1]
    const match = lastWord.match(FIRST_ALPHABET_REGEX)
    if (match) {
      return match[0]
    }
  }
  return ''
}
