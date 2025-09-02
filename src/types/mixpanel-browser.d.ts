declare module 'mixpanel-browser' {
  export interface Config {
    record_heatmap_data?: boolean
    api_host?: string
    debug?: boolean
    disable_persistence?: boolean
    disable_cookie?: boolean
    ignore_dnt?: boolean
    opt_out_tracking_by_default?: boolean
    record_sessions_percent?: number
    record_mask_text_selector?: string
    record_block_selector?: string
    [key: string]: any
  }

  export interface OverridedMixpanel {
    init(token: string, config?: Config): void
    config: Config
    track(event_name: string, properties?: any): void
    identify(id: string): void
    opt_in_tracking(): void
    opt_out_tracking(): void
  }

  const mixpanel: OverridedMixpanel
  export = mixpanel
  export default mixpanel
}
