import styles from './index.css?inline'
import { component$, useVisibleTask$, useStylesScoped$, useSignal, $ } from '@builder.io/qwik';
import { useLocation, routeLoader$, routeAction$, Form, Link, useNavigate } from '@builder.io/qwik-city';
import axios from 'axios'
import OpenAI from "openai";
import { Mensaje } from '~/components/Mensaje.jsx'
import { Card } from '~/components/Card.jsx'



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
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: "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",
  })

  try {
    const response = await openai.chat.completions.create({
      model: "arcee-ai/trinity-mini:free",
      messages: [
        { role: 'system', content: instruccion },
        { role: 'user', content: mensaje }
      ],
      reasoning: {
        effort: "none"
      }
    })
    return {
      success: true,
      response: response.choices[0].message.content
    }
  } catch (error) {
    console.error("Error en la acción AI:", error);
    return {
      success: false,
      error
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

export const useObtenerAsistentes = routeLoader$(async () => {
  const apiUrl = "https://api-ia-docentes-v2.yonaikereliezerbarretomaterano.workers.dev/asistentes"
  const response = await axios(apiUrl);
  const { data } = await response
  return data
});

export default component$(() => {
  useStylesScoped$(styles)
  const nav = useNavigate()

  const asistente = useObtenerAsistentePorId()
  const asistentes = useObtenerAsistentes()
  const historial = useObtenerHistorial()
  const mensajeAlAsistente = useMensajeAlAsistente()
  const guardarMensajeEnElHistorial = useGuardarMensajeEnElHistorial()

  const mensajeDelAsistente = useSignal("")
  const mensajeDelUsuario = useSignal("")
  const mensajes = useSignal(historial.value)
  const contenedorMensajesRef = useSignal()
  const botonDeEnviar = useSignal()

  const offcanvasRef = useSignal()
  const offcanvasInstance = useSignal()

  useVisibleTask$( async () => {
    const bootstrap = await import("bootstrap")
    if (offcanvasRef.value) {
      offcanvasInstance.value = new bootstrap.Offcanvas(offcanvasRef.value)
    }
  })


  useVisibleTask$(({ track }) => {
    // Rastreamos el historial que viene del servidor (loader)
    track(() => historial.value);
    // Actualizamos la señal local con el nuevo historial de la base de datos
    mensajes.value = historial.value;
  });

  useVisibleTask$(({ track }) => {
    // Rastreamos la señal de mensajes que se actualiza al cambiar de ruta
    track(() => mensajes.value);

    // Usamos un pequeño delay para permitir que Qwik renderice el nuevo DOM
    setTimeout(() => {
      // Buscamos todos los elementos con la clase que definiste
      const listaMensajes = contenedorMensajesRef.value?.querySelectorAll('.mensaje-item');
      const ultimoMensaje = listaMensajes?.[listaMensajes.length - 1];

      if (ultimoMensaje) {
        // 'start' alinea el inicio del elemento con la parte superior del contenedor
        ultimoMensaje.scrollIntoView({
          behavior: 'smooth',
          block: 'start' 
        });
      }
    }, 100); // Un margen ligeramente mayor ayuda a la estabilidad visual
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
      alert("No se pudo obtener respuesta del asistente. " + mensajeAlAsistente.value?.error);
      botonDeEnviar.value.disabled = false
    }
  });

  return (
    <>
      <article class="card chat">
        <header class="card-header d-flex align-items-center">
          <span class="fs-4">{asistente.value.titulo}</span>
          <button class="btn btn-primary ms-auto" onClick$={() => offcanvasInstance.value.show()}>
            <div>&#8801;</div>
          </button>
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
            <textarea bind:value={mensajeDelUsuario} class="form-control shadow-none" name="mensaje" placeholder="Mensaje para el bot" rows={2}></textarea>
          </div>
          <button ref={botonDeEnviar} onClick$={() => enviarMensaje()} class="btn btn-primary shadow-none w-100">Enviar</button>
        </footer> 
      </article>
      <div ref={offcanvasRef} class="offcanvas offcanvas-end" tabindex="-1" id="asistentes" aria-labelledby="asistentesLabel">
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="asistentesLabel">Asistentes</h5>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
          {asistentes.value.map(asistente => (
            <Link onClick$={() => offcanvasInstance.value.hide()} href={`/asistente/${asistente.id}`} key={asistente.id} class="btn btn-primary w-100 mb-2">{asistente.titulo}</Link>
          ))}
        </div>
      </div>
    </>
  )
});

export const head = ({ resolveValue }) => {
  const title = resolveValue(useObtenerAsistentePorId)
  return {
    title: title.titulo
  }
}
