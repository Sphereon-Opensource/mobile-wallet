export const getInitials = (fullName: string): string => {
  if (fullName && fullName.length > 0) {
    const namePartsArray = fullName.trim().split(' ')

    let firstInitial = ''
    let lastInitial = ''

    if (namePartsArray.length > 0) {
      const firstName = namePartsArray[0]
      if (firstName.length > 0) {
        firstInitial = firstName[0]
      }

      if (namePartsArray.length > 1) {
        const lastPart = namePartsArray[namePartsArray.length - 1]
        if (lastPart.length > 0) {
          lastInitial = lastPart[0]
        }
      }
    }
    const initials = `${firstInitial}${lastInitial}`
    return initials.toUpperCase()
  }

  return '?'
}
