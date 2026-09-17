import type { Directive } from 'vue'
import type { RevealEffect } from '@/directives/reveal'

declare module 'vue' {
  interface GlobalDirectives {
    vReveal: Directive<HTMLElement, RevealEffect | undefined>
  }
}

export {}
