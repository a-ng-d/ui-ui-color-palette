import { atom } from 'nanostores'
import { Language } from '../types/translations'

export const $isWCAGDisplayed = atom<boolean>(true)
export const $isAPCADisplayed = atom<boolean>(true)
export const $canStylesDeepSync = atom<boolean>(false)
export const $canVariablesDeepSync = atom<boolean>(false)
export const $isVsCodeMessageDisplayed = atom<boolean>(true)
export const $pluginWindowWidth = atom<number>(640)
export const $pluginWindowHeight = atom<number>(400)
export const $userLanguage = atom<Language>('en-US')
