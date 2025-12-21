import styles from './index.css?inline'
import { component$, useVisibleTask$, useStylesScoped$, useSignal, $ } from '@builder.io/qwik';
import { useLocation, routeLoader$, routeAction$, Form } from '@builder.io/qwik-city';
import axios from 'axios'
import OpenAI from "openai";
import { Mensaje } from '~/components/Mensaje.jsx'

export const useObtenerAsistentePorId = routeLoader$(async ({ params }) => {
  const id = params.id

  const apiUrl = `https://api-ia-docentes-v2.yonaikereliezerbarretomaterano.workers.dev/asistentes/${id}`
  const response = await axios(apiUrl);
  const { data } = await response
  return data[0]
});

export const useMensajeAlAsistente = routeAction$( async ({ instruccion, mensaje }) => {
  const openai = new OpenAI({
    baseURL: "https://text.pollinations.ai/openai",
    apiKey: "qKR8cZHgwG6tByan",
    dangerouslyAllowBrowser: true,
  })

  try {
    const response = await openai.responses.create({
      model: "gemini",
      messages: [
        { role: 'system', content: instruccion },
        { role: 'user', content: mensaje }
      ]
    })
    return {
      success: true,
      response: response.choices[0].message.content
    }
  } catch (error) {
    console.error("Error en la acción AI:", error);
    return {
      success: false
    }
  }
})

export const useGuardarMensajeEnElHistorial = routeAction$(async ({ asistente_id, role, content }) => {
  const apiUrl = "https://api-ia-docentes-v2.yonaikereliezerbarretomaterano.workers.dev/historial"
  try {
    await axios.post(apiUrl, { asistente_id, role, content })
    return {
      success: true
    }
  } catch (err) {
    console.log(err)
    return {
      success: false,
      err
    }
  }
})

export default component$(() => {
  useStylesScoped$(styles)

  const asistente = useObtenerAsistentePorId()
  const mensajeAlAsistente = useMensajeAlAsistente()
  const guardarMensajeEnElHistorial = useGuardarMensajeEnElHistorial()

  const mensajeDelAsistente = useSignal("")
  const mensajeDelUsuario = useSignal("")
  const mensajes = useSignal([])

  const enviarMensaje = $(async () => {
    const mensaje = mensajeDelUsuario.value
    mensajes.value = [...mensajes.value, { role: "user", content: mensaje}]
    const idAsistente = asistente.value.id
    await guardarMensajeEnElHistorial.submit({ asistente_id: idAsistente, role: "user", content: mensaje})
    mensajeDelUsuario.value = ""
    const instruccion = asistente.value.instruccion
    const { value } = await mensajeAlAsistente.submit({ instruccion, mensaje })
    const { success, response } = value
    if (success) mensajes.value = [...mensajes.value, { role: "assistant", content: response }]
  })

  return (
    <article class="card">
      <header class="card-header">
        <h3>{asistente.value.titulo}</h3>
      </header>
      <div class="card-body">        
        {mensajes.value?.map(mensaje => <Mensaje key={mensaje.id} mensaje={mensaje} />)}
      </div>
      <footer class="card-footer">
        <div class="mb-3">
          <input type="text" value={asistente.value.instruccion} name="instruccion" hidden />
          <textarea bind:value={mensajeDelUsuario} class="form-control" name="mensaje" placeholder="Mensaje para el bot" rows={2}></textarea>
        </div>
        <button onClick$={() => enviarMensaje()} class="btn btn-primary">Enviar</button>
      </footer>
    </article>
  )
});