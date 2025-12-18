import styles from './index.css?inline'
import { component$, useStylesScoped$, useSignal, useTask$, useVisibleTask$, $ } from '@builder.io/qwik';
import { routeLoader$, Form, routeAction$, server$ } from '@builder.io/qwik-city';
import axios from 'axios'
import { Card } from '~/components/Card.jsx'
import { Toast } from '~/components/bootstrap/toast.jsx'
import { Toaster, toast} from 'qwik-sonner'


export const useObtenerAsistentes = routeLoader$(async () => {
  const apiUrl = "https://api-ia-docentes-v2.yonaikereliezerbarretomaterano.workers.dev/asistentes"
  const response = await axios(apiUrl);
  const { data } = await response
  return data
});

export const useAñadirAsistente = routeAction$( async ({titulo, instruccion}) => {
  const apiUrl = "https://api-ia-docentes-v2.yonaikereliezerbarretomaterano.workers.dev/asistentes"
  try {
    await axios.post(apiUrl, { titulo, instruccion})
    return {
      success: true
    }
  } catch (err) {
    return {
      success: false,
      err
    }
  }
})

export const useEliminarAsistente = routeAction$( async ({ id }) => {
  const apiUrl = `https://api-ia-docentes-v2.yonaikereliezerbarretomaterano.workers.dev/asistentes/${id}`

  try {
    await axios.delete(apiUrl)
    return {
      success: true
    }
  } catch (err) {
    return {
      success: false,
      err
    }
  }
})

export const useEditarAsistente = routeAction$( async ({ id, titulo, instruccion }) => {
  const apiUrl = `https://api-ia-docentes-v2.yonaikereliezerbarretomaterano.workers.dev/asistentes/${id}`
  try {
    await axios.put(apiUrl, { titulo, instruccion })
    return { success: true }
  } catch (err) {
    return {
      success: false,
      err
    }
  }
})

export default component$(() => {
  useStylesScoped$(styles)
  const asistentes = useObtenerAsistentes()
  const añadirAsistente = useAñadirAsistente()
  const editarAsistente = useEditarAsistente()
  const eliminarAsistente = useEliminarAsistente()

  const offcanvasRef = useSignal()
  const offcanvasInstance = useSignal()


  useVisibleTask$( async () => {
    const bootstrap = await import("bootstrap")
    if (offcanvasRef.value) {
      offcanvasInstance.value = new bootstrap.Offcanvas(offcanvasRef.value)
    }
  })
  return (
    <section class="section bright">
      <nav class="navbar bg-body-tertiary">
        <div class="container-fluid">
          <h5 class="navbar-brand">Asistentes</h5>
          <ul class="navbar-nav">
            <li class="navbar-item">
              <button onClick$={() => offcanvasInstance.value.show()} class="btn btn-primary" type="button" >
                Nuevo
              </button>
            </li>
          </ul>
        </div>
      </nav>
       <div ref={offcanvasRef} class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasAñadirAsistente" aria-labelledby="offcanvasAñadirAsistenteLabel">
         <div class="offcanvas-header">
           <h5 class="offcanvas-title" id="offcanvasExampleLabel">Nuevo asistente</h5>
           <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
         </div>
         <div class="offcanvas-body">
          <Form action={añadirAsistente}>
            <div class="mb-3">
              <label>Titulo</label>
              <input class="form-control" type="text" name="titulo" placeholder="Nombre del asistente" />
            </div>
            <div class="mb-3">
              <label>Instruccion</label>
              <textarea class="form-control" name="instruccion" placeholder="Instrucciones detalladas del bot" rows={7}></textarea>
            </div>
            <button class="btn btn-primary">Añadir</button>
            {añadirAsistente.value?.success && offcanvasInstance.value.hide()}
          </Form>
         </div>
       </div>
       <div class="contenedor-asistentes">
        {asistentes.value.map(({ titulo, instruccion, id}) => (
          <Card key={id} titulo={titulo} instruccion={instruccion} id={id} editar={editarAsistente} eliminar={eliminarAsistente} tipo="asistente" />
        )).reverse()}
       </div>
    </section>
  );
});

export const head = {
  title: "Lista de asistentes"
}