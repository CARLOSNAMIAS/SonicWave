import React from 'react';
import { ViewState } from '@/types';

/**
 * Dirección de cada sección.
 * La navegación se dibuja con enlaces reales para que los buscadores puedan
 * seguirla y para que el clic central o «abrir en pestaña nueva» funcionen; el
 * cambio de vista sigue ocurriendo sin recargar la página.
 */
export const viewPath = (view: ViewState): string =>
    view === ViewState.HOME ? '/' : `/?view=${view}`;

/** Un clic normal del botón izquierdo, sin teclas que pidan otra cosa. */
const isPlainLeftClick = (event: React.MouseEvent): boolean =>
    event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

/**
 * Manejador para los enlaces de navegación: cambia de vista en el sitio, salvo
 * cuando la persona pide explícitamente abrir el enlace de otra manera.
 */
export const handleViewLinkClick = (
    event: React.MouseEvent,
    view: ViewState,
    setView: (view: ViewState) => void
): void => {
    if (!isPlainLeftClick(event)) return;
    event.preventDefault();
    setView(view);
};
