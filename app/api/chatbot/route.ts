import { generateText } from "ai"

export const runtime = "edge"

// Sistema de guardrails según NFR-04
const SYSTEM_PROMPT = `Eres un asistente educativo farmacéutico de FarmaNexo. Tu objetivo es proporcionar información orientativa sobre medicamentos.

REGLAS ESTRICTAS (NO PUEDES VIOLARLAS):
1. NO des diagnósticos médicos
2. NO prescribas tratamientos ni dosis específicas
3. NO indiques iniciar o suspender medicamentos
4. NO des consejos que sustituyan la consulta médica
5. Solo proporciona información educativa general sobre:
   - Uso correcto de medicamentos (cómo aplicar, con o sin comida)
   - Conservación (refrigeración, protección de luz)
   - Advertencias generales de uso
   - Información de etiquetas y prospectos

SIEMPRE incluye este disclaimer al final de cada respuesta:
"⚠️ Esta información es orientativa y no sustituye la evaluación de un profesional de la salud."

Si te preguntan algo que requiere diagnóstico o prescripción, responde:
"No puedo proporcionar diagnósticos ni recomendar tratamientos. Te sugiero consultar con un médico o farmacéutico profesional."

Sé amable, claro y conciso en español de Perú.`

export async function POST(req: Request) {
    try {
        const { message, sessionId } = await req.json()

        if (!message || typeof message !== "string") {
            return Response.json({ error: "Mensaje inválido" }, { status: 400 })
        }

        // Filtro de seguridad adicional
        const dangerousKeywords = [
            "cuánto debo tomar",
            "qué dosis",
            "tengo estos síntomas",
            "me duele",
            "estoy enfermo",
            "diagnóstico",
            "recétame",
            "prescríbeme",
        ]

        const containsDangerousContent = dangerousKeywords.some((keyword) => message.toLowerCase().includes(keyword))

        if (containsDangerousContent) {
            return Response.json({
                response:
                    "No puedo proporcionar diagnósticos ni recomendar tratamientos específicos. Para consultas sobre tu salud o síntomas, te recomiendo acudir a un médico o farmacéutico profesional.\n\n⚠️ Esta información es orientativa y no sustituye la evaluación de un profesional de la salud.",
                sessionId,
            })
        }

        try {
            // Llamada al modelo de IA (usando AI SDK con AI Gateway de Vercel)
            const { text } = await generateText({
                model: "openai/gpt-4o-mini",
                system: SYSTEM_PROMPT,
                prompt: message,
                maxOutputTokens: 500,
                temperature: 0.7,
            })

            // Asegurar que el disclaimer esté presente
            const responseWithDisclaimer = text.includes("⚠️")
                ? text
                : `${text}\n\n⚠️ Esta información es orientativa y no sustituye la evaluación de un profesional de la salud.`

            return Response.json({
                response: responseWithDisclaimer,
                sessionId: sessionId || crypto.randomUUID(),
            })
        } catch (aiError: any) {
            console.error("[v0] Error en chatbot:", aiError)

            if (aiError?.message?.includes("Gateway") || aiError?.message?.includes("access failed")) {
                return Response.json({
                    response:
                        "El chatbot de IA requiere estar desplegado en Vercel para funcionar. En desarrollo local, puedes probar las demás funcionalidades de FarmaNexo.\n\nPara preguntas sobre medicamentos, te recomiendo consultar con un farmacéutico profesional.\n\n⚠️ Esta información es orientativa y no sustituye la evaluación de un profesional de la salud.",
                    sessionId: sessionId || crypto.randomUUID(),
                })
            }

            throw aiError
        }
    } catch (error) {
        console.error("[v0] Error general en chatbot:", error)
        return Response.json(
            {
                response:
                    "En este momento no puedo procesar tu consulta. Te recomiendo consultar directamente con un farmacéutico o médico para obtener información confiable.\n\n⚠️ Esta información es orientativa y no sustituye la evaluación de un profesional de la salud.",
            },
            { status: 500 },
        )
    }
}
