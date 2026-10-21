import { Component } from 'react';

/**
 * Ако некоја страница падне при прикажување, наместо бел екран:
 * 1) првиот пат автоматски ја вчитува страницата повторно;
 * 2) ако пак падне, покажува порака со копче „Обиди се повторно“.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.error('ВрвТура – грешка при прикажување:', error);
    const key = `vt-reload:${window.location.pathname}`;
    let tried = false;
    try { tried = sessionStorage.getItem(key) === '1'; sessionStorage.setItem(key, '1'); } catch { /* sessionStorage не е достапен */ }
    if (!tried) window.location.reload();
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="container py-5">
        <div className="panel text-center mx-auto" style={{ maxWidth: 560 }}>
          <i className="bi bi-cloud-fog2 text-forest" style={{ fontSize: '3rem' }} />
          <h1 className="h4 mt-2">Се изгубивме во маглата…</h1>
          <p className="text-muted small mb-3">Страницата не можеше да се прикаже. Грешка: {String(error.message || error)}</p>
          <button type="button" className="btn btn-forest" onClick={() => window.location.reload()}>Обиди се повторно</button>
        </div>
      </div>
    );
  }
}
