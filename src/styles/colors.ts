import { ConnectionStatusEnum, CredentialStatusEnum } from '../@types'

type Background = 'primaryDark' | 'secondaryDark' | 'primaryLight' | 'secondaryLight'

export const backgrounds: Record<Background, string> = {
  primaryDark: '#202537',
  // TODO fix this new color #2A3046(design) vs secondary color #2C334B(design)
  secondaryDark: '#2A3046',
  primaryLight: '#FBFBFB',
  secondaryLight: '#E3E3FF'
}

type Alerts = 'primaryLight' | 'secondaryLight'

export const alerts: Record<Alerts, string> = {
  primaryLight: '#FBFBFB',
  secondaryLight: '#EBEBEB'
}

type Highlight = 'dark'

export const highlights: Record<Highlight, string> = {
  dark: '#3B425E'
}

type Border = 'dark'

export const borders: Record<Border, string> = {
  dark: '#404D7A'
}

type Entity = 100 | 200 | 300 | 400 | 500

export const entities: Record<Entity, string> = {
  100: '#EE5209',
  200: '#FF9900',
  300: '#5BDED3',
  400: '#0B81FF',
  500: '#BD2DFF'
}

type GradientProperties = {
  primaryColor: string
  secondaryColor: string
}

type Gradient = 100 | 200 | 300 | 400 | 500

export const gradients: Record<Gradient, GradientProperties> = {
  100: {
    primaryColor: 'rgba(111,105,224,1)',
    secondaryColor: 'rgba(69,64,164,1)'
  },
  200: {
    primaryColor: 'rgba(250,182,81,1)',
    secondaryColor: 'rgba(202,122,2,1)'
  },
  300: {
    primaryColor: 'rgba(108,240,228,1)',
    secondaryColor: 'rgba(0,169,153,1)'
  },
  400: {
    primaryColor: 'rgba(50,156,245,1)',
    secondaryColor: 'rgba(0,91,168,1)'
  },
  500: {
    primaryColor: 'rgba(188,45,255,1)',
    secondaryColor: 'rgba(122,3,177,1)'
  }
}

type HighLightGradient = 100 | 200

export const highLightGradients: Record<HighLightGradient, GradientProperties> = {
  100: {
    primaryColor: 'rgba(114,118,247,1)',
    secondaryColor: 'rgba(124,64,232,1)'
  },
  200: {
    primaryColor: 'rgba(255,153,0,1)',
    secondaryColor: 'rgba(238,83,9,1)'
  }
}

type Font = 'dark' | 'light' | 'secondaryButton' | 'greyedOut'

export const fonts: Record<Font, string> = {
  dark: '#303030',
  light: '#FBFBFB',
  secondaryButton: '#7664F2',
  greyedOut: '#8F8F8F'
}

export const credentialStatuses: Record<CredentialStatusEnum, string> = {
  valid: '#00E957',
  expired: '#FF9900',
  revoked: '#EE5309'
}

export const connectionStatuses: Record<ConnectionStatusEnum, string> = {
  connected: '#00E957',
  disconnected: '#B2BEB5'
}

type Status = 'error'

export const statuses: Record<Status, string> = {
  error: '#D74500'
}

type Button = 'blue'

export const buttons: Record<Button, string> = {
  blue: '#0B81FF'
}
