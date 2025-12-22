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

export const useObtenerHistorial = routeLoader$(async ({ params }) => {
  const id = params.id

  const apiUrl = `https://api-ia-docentes-v2.yonaikereliezerbarretomaterano.workers.dev/historial/${id}`
  const response = await axios(apiUrl);
  const { data } = await response
  return data
})

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
  const historial = useObtenerHistorial()
  const mensajeAlAsistente = useMensajeAlAsistente()
  const guardarMensajeEnElHistorial = useGuardarMensajeEnElHistorial()

  const mensajeDelAsistente = useSignal("")
  const mensajeDelUsuario = useSignal("")
  const mensajes = useSignal(historial.value)
  const contenedorMensajesRef = useSignal()
  const botonDeEnviar = useSignal()

  useVisibleTask$(({ track }) => {
      track(() => mensajes.value); // Rastrea cambios en la lista de mensajes
      
      const listaMensajes = contenedorMensajesRef.value?.querySelectorAll('.mensaje-item');
      const ultimoMensaje = listaMensajes?.[listaMensajes.length - 1];

      if (ultimoMensaje) {
        // scrollIntoView con 'start' hace que el inicio del mensaje 
        // se alinee con la parte superior del contenedor
        ultimoMensaje.scrollIntoView({
          behavior: 'smooth',
          block: 'start' 
        });
      }
    });

  const enviarMensaje = $(async () => {
    const mensajeTexto = mensajeDelUsuario.value.trim();
    const idAsistente = asistente.value.id;
    const instruccion = asistente.value.instruccion;
    botonDeEnviar.value.disabled = true

    if (!mensajeTexto) return;

    // 1. Limpiar input y agregar mensaje del usuario localmente
    mensajeDelUsuario.value = "";
    mensajes.value = [...mensajes.value, { role: "user", content: mensajeTexto }];

    // 2. Guardar mensaje del usuario en DB (en segundo plano)
    await guardarMensajeEnElHistorial.submit({
      asistente_id: idAsistente, 
      role: "user", 
      content: mensajeTexto 
    });

    // 3. Agregar estado de carga (Placeholder)
    mensajes.value = [
      ...mensajes.value,
      { role: "assistant", content: "Cargando...", isLoading: true },
    ];

    try {
      // 4. Petición a la IA
      const { value } = await mensajeAlAsistente.submit({ 
        instruccion, 
        mensaje: mensajeTexto 
      });

      if (value?.success) {
        const respuestaIA = value.response;

        // 5. Reemplazar el "escribiendo..." con la respuesta real
        mensajes.value = mensajes.value.map((msg, i) =>
          i === mensajes.value.length - 1 
            ? { role: "assistant", content: respuestaIA, isLoading: false } 
            : msg
        );

        // 6. Guardar respuesta de la IA en DB

        botonDeEnviar.value.disabled = false

        await guardarMensajeEnElHistorial.submit({ 
          asistente_id: idAsistente, 
          role: "assistant", 
          content: respuestaIA 
        });
      } else {
        throw new Error("Error en la respuesta de IA");
      }
    } catch (error) {
      // 7. Manejo de errores: Eliminar el placeholder de carga si falla
      mensajes.value = mensajes.value.filter((_, i) => i !== mensajes.value.length - 1);
      alert("No se pudo obtener respuesta del asistente.");
      botonDeEnviar.value.disabled = false
    }
  });

  return (
    <article class="card">
      <header class="card-header">
        <h3>{asistente.value.titulo}</h3>
      </header>
      <div class="card-body" ref={contenedorMensajesRef}>        
        {mensajes.value?.map(mensaje => (
          <div key={asistente.id} class="mensaje-item">
            <Mensaje mensaje={mensaje} />
          </div>
        ))}
      </div>
      <footer class="card-footer">
        <div class="mb-3">
          <input type="text" value={asistente.value.instruccion} name="instruccion" hidden />
          <textarea bind:value={mensajeDelUsuario} class="form-control" name="mensaje" placeholder="Mensaje para el bot" rows={2}></textarea>
        </div>
        <button ref={botonDeEnviar} onClick$={() => enviarMensaje()} class="btn btn-primary w-100">Enviar</button>
      </footer> 
    </article>
  )
});