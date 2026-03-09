import type React from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'analysis-result': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        title?: string
        items?: string
      }
      'react-analysis': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        title?: string
        items?: string
      }
    }
  }
}