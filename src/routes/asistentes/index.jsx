import styles from './index.css?inline'
import { component$, useStylesScoped$, useSignal } from '@builder.io/qwik';
import { routeLoader$, Form, routeAction$ } from '@builder.io/qwik-city';
import axios from 'axios'

 
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

export default component$(() => {
  useStylesScoped$(styles)
  const asistentes = useObtenerAsistentes()
  const añadirAsistente = useAñadirAsistente()
  const eliminarAsistente = useEliminarAsistente()
  const modalRef = useSignal()
  // useTask$(({ track }) => {
  //   track(() => añadirAsistente.value?.success)
  //   server$(() => {
  //     console.log(asistentes.value);
  //   })();
  // });
  return (
    <section class="section bright">
      <nav>
        <h3>Asistentes</h3>
        <button onClick$={() => modalRef.showModal()} >Nuevo</button>
      </nav>
      <dialog ref={modalRef} drawer id="drawerExample">
         <header>
           <h3>Confirm your action!</h3>
         </header>
         <Form action={añadirAsistente}>
           <label>
             Titulo
             <input type="text" name="titulo" placeholder="Nombre del asistente" />
           </label>
           <label>
             Instruccion
             <textarea name="instruccion" placeholder="Instrucciones detalladas del bot" rows={5}></textarea>
           </label>
           <button>Añadir</button>
           {añadirAsistente.value?.success && modalRef.close()}
         </Form>
       </dialog>
       <div class="contenedor-asistentes">
        {asistentes.value.map((asistente) => (
          <article key={asistente.id}>
            <h3>{asistente.titulo}</h3>
            <footer>
              <button>Editar</button>
              <button onClick$={ async () => {
                const { id } = asistente
                const { value } = await eliminarAsistente.submit({ id })
                console.log(value)
              }}>Eliminar</button>
            </footer>
          </article>
        )).reverse()}
       </div>
    </section>
  );
});