import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override render() {
    if (this.state.error) {
      return (
        <div className="m-8 p-6 bg-red-500/10 border border-red-500/40 rounded-xl">
          <h2 className="text-red-400 font-bold text-sm mb-2">Erreur de rendu</h2>
          <pre className="text-red-300 text-xs whitespace-pre-wrap break-all">
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}
