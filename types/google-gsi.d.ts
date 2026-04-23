/** Google Identity Services (gsi) — loaded from https://accounts.google.com/gsi/client */

export {};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string; select_by?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              width?: number;
              text?: string;
              locale?: string;
            }
          ) => void;
        };
      };
    };
  }
}
