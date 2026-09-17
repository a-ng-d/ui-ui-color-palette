import { atom } from 'nanostores'
import { PalettesView, UserTheme } from '../types/app'

export const $userTheme = atom<UserTheme>('system')
export const $palettesView = atom<PalettesView>('LIST')
export const $isWCAGDisplayed = atom<boolean>(true)
export const $isAPCADisplayed = atom<boolean>(true)
export const $isWCAGIntervalDisplayed = atom<boolean>(false)
export const $isAPCAIntervalDisplayed = atom<boolean>(false)
export const $canStylesDeepSync = atom<boolean>(false)
export const $canVariablesDeepSync = atom<boolean>(false)
export const $canTokensDeepSync = atom<boolean>(false)
export const $isVsCodeMessageDisplayed = atom<boolean>(true)
export const $isSuggestedLanguageDisplayed = atom<boolean>(false)
export const $isOnboardingRead = atom<boolean>(false)
export const $pluginWindowWidth = atom<number>(640)
export const $pluginWindowHeight = atom<number>(400)
