class SimuladorEngine {
    constructor(preguntas, configuracionPuntaje = { correcta: 4.0, incorrecta: -0.5 }) {
        this.preguntas = preguntas.map(p => ({
            ...p,
            opciones: { ...p.opciones },
            respuestaUsuario: undefined // undefined = en blanco/omitida
        }));
        this.indicePregunta = 0;
        this.config = configuracionPuntaje;
    }

    obtenerPreguntaActual() {
        return this.preguntas[this.indicePregunta];
    }

    responderPregunta(letra) {
        this.preguntas[this.indicePregunta].respuestaUsuario = letra;
    }

    omitirPregunta() {
        this.preguntas[this.indicePregunta].respuestaUsuario = undefined;
    }

    siguientePregunta() {
        if (this.indicePregunta < this.preguntas.length - 1) {
            this.indicePregunta++;
            return true;
        }
        return false; // Fin del examen
    }

    anteriorPregunta() {
        if (this.indicePregunta > 0) {
            this.indicePregunta--;
            return true;
        }
        return false;
    }

    obtenerPuntaje() {
        return this.preguntas.reduce((total, p) => {
            if (p.respuestaUsuario === undefined) return total;
            return total + (p.respuestaUsuario === p.correcta ? this.config.correcta : this.config.incorrecta);
        }, 0);
    }

    obtenerResumenResultados() {
        let correctas = 0;
        let incorrectas = 0;
        let omitidas = 0;

        this.preguntas.forEach(p => {
            if (p.respuestaUsuario === undefined) {
                omitidas++;
            } else if (p.respuestaUsuario === p.correcta) {
                correctas++;
            } else {
                incorrectas++;
            }
        });

        return {
            correctas,
            incorrectas,
            omitidas,
            total: this.preguntas.length,
            puntaje: this.obtenerPuntaje()
        };
    }

    obtenerProgreso() {
        return {
            actual: this.indicePregunta + 1,
            total: this.preguntas.length
        };
    }
}

// Exportación condicional para compatibilidad híbrida (Navegador y Node/Vitest)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SimuladorEngine };
}
