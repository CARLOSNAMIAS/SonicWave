import { describe, it, expect } from 'vitest';
import { pedirAlDJ } from '../dj';
import { SIN_ENTENDER } from '@/data/djIntents';
import { ALL_SUGGESTIONS } from '@/components/AIDJModal';

describe('El DJ', () => {
    describe('conversación', () => {
        it('devuelve el saludo sin ponerse a buscar', () => {
            for (const saludo of ['hola', 'Hola!', 'buenas', 'hey', 'buenos días', 'qué tal']) {
                const r = pedirAlDJ(saludo);
                expect(r.searchQuery, `«${saludo}» no debería buscar`).toBeNull();
                expect(r.reasoning.length).toBeGreaterThan(10);
            }
        });

        it('responde a un agradecimiento y a una despedida', () => {
            expect(pedirAlDJ('gracias').searchQuery).toBeNull();
            expect(pedirAlDJ('adiós').searchQuery).toBeNull();
            expect(pedirAlDJ('chao').reasoning.length).toBeGreaterThan(5);
        });

        it('explica qué sabe hacer cuando se lo preguntan', () => {
            const r = pedirAlDJ('qué sabes hacer');
            expect(r.searchQuery).toBeNull();
            expect(r.reasoning.toLowerCase()).toMatch(/género|país|emisora/);
        });
    });

    describe('géneros y ambientes', () => {
        it('entiende un género escrito tal cual', () => {
            expect(pedirAlDJ('quiero rock').searchQuery).toEqual({ tag: 'rock' });
            expect(pedirAlDJ('jazz').searchQuery).toEqual({ tag: 'jazz' });
            expect(pedirAlDJ('ponme salsa').searchQuery).toEqual({ tag: 'salsa' });
        });

        it('no se pierde por mayúsculas ni acentos', () => {
            expect(pedirAlDJ('MÚSICA ELECTRÓNICA').searchQuery).toHaveProperty('tag');
            expect(pedirAlDJ('clásica').searchQuery).toEqual({ tag: 'classical' });
        });

        it('traduce estados de ánimo a géneros reales', () => {
            const tranquilo = pedirAlDJ('algo tranquilo para trabajar').searchQuery;
            expect(['lofi', 'chillout', 'ambient', 'instrumental']).toContain(tranquilo?.tag);

            const fiesta = pedirAlDJ('música para bailar').searchQuery;
            expect(['dance', 'house', 'edm', 'disco', 'techno']).toContain(fiesta?.tag);
        });

        it('varía la etiqueta entre peticiones iguales', () => {
            const salidas = new Set<string | undefined>();
            for (let i = 0; i < 40; i++) salidas.add(pedirAlDJ('algo relajado').searchQuery?.tag);
            expect(salidas.size).toBeGreaterThan(1);
        });
    });

    describe('países', () => {
        it('entiende el país por su nombre y por su gentilicio', () => {
            expect(pedirAlDJ('radio de venezuela').searchQuery).toEqual({ country: 'Venezuela' });
            expect(pedirAlDJ('algo mexicano').searchQuery).toEqual({ country: 'Mexico' });
        });

        it('combina país y género cuando aparecen los dos', () => {
            expect(pedirAlDJ('salsa venezolana').searchQuery).toEqual({ country: 'Venezuela', tag: 'salsa' });
            expect(pedirAlDJ('rock argentino').searchQuery).toEqual({ country: 'Argentina', tag: 'rock' });
        });
    });

    describe('seguir la conversación', () => {
        it('repite la última intención con «ponme otra»', () => {
            const primera = pedirAlDJ('quiero jazz');
            const segunda = pedirAlDJ('ponme otra', primera.contexto);
            expect(segunda.searchQuery).toEqual({ tag: 'jazz' });
        });

        it('sube la energía con «algo más movido»', () => {
            const tranquila = pedirAlDJ('algo tranquilo');
            const movida = pedirAlDJ('algo más movido', tranquila.contexto);
            expect(movida.searchQuery).not.toBeNull();
            expect(movida.searchQuery?.tag).not.toBe(tranquila.searchQuery?.tag);
        });

        it('sin contexto previo, «otra» pide una aclaración en vez de fallar', () => {
            const r = pedirAlDJ('ponme otra');
            expect(r.searchQuery).toBeNull();
            expect(r.reasoning.length).toBeGreaterThan(10);
        });
    });

    describe('cuando no reconoce nada', () => {
        it('busca por nombre si parece una emisora concreta', () => {
            expect(pedirAlDJ('radio metropolis').searchQuery).toEqual({ name: 'metropolis' });
        });

        it('no busca nada ante algo ininteligible', () => {
            expect(pedirAlDJ('asdfghjkl').searchQuery).toBeNull();
            expect(pedirAlDJ('qwerty').searchQuery).toBeNull();
        });

        it('todas las respuestas de «no te entiendo» orientan sobre qué pedir', () => {
            // Se comprueba el catálogo entero en lugar de muestrear al azar: así el
            // test no depende de la suerte y avisa si alguien añade una frase vaga.
            for (const frase of SIN_ENTENDER) {
                expect(frase.toLowerCase(), `«${frase}» no ofrece ninguna pista`)
                    .toMatch(/género|país|ambiente|ejemplo/);
                expect(frase.length).toBeGreaterThan(30);
            }
        });

        it('no se rompe con una petición vacía', () => {
            expect(() => pedirAlDJ('')).not.toThrow();
            expect(pedirAlDJ('   ').searchQuery).toBeNull();
        });
    });

    describe('las sugerencias que muestra el modal', () => {
        it('todas devuelven una búsqueda: ninguna deja al DJ sin respuesta', () => {
            for (const s of ALL_SUGGESTIONS) {
                const r = pedirAlDJ(s);
                expect(r.searchQuery, `la sugerencia «${s}» no devolvió búsqueda`).not.toBeNull();
            }
        });

        it('entiende también frases largas del estilo antiguo', () => {
            const frases = [
                'Música lofi para estudiar',
                'Salsa pesada colombiana',
                'Rock alternativo de Reino Unido',
                'Música clásica para concentrarse',
                'Heavy Metal escandinavo',
            ];
            for (const f of frases) {
                expect(pedirAlDJ(f).searchQuery, `«${f}» no devolvió búsqueda`).not.toBeNull();
            }
        });
    });

    describe('el color de la sesión', () => {
        it('propone un color cuando hay música', () => {
            const r = pedirAlDJ('quiero metal');
            expect(r.vibe?.primaryColor).toMatch(/^#[0-9a-fA-F]{6}$/);
        });

        it('no cambia el color en una simple charla', () => {
            expect(pedirAlDJ('hola').vibe).toBeUndefined();
        });
    });
});
