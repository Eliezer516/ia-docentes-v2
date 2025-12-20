import styles from './index.css?inline'
import { component$, useVisibleTask$, useStylesScoped$ } from '@builder.io/qwik';
import { useLocation, routeLoader$ } from '@builder.io/qwik-city';
import axios from 'axios'

export const useObtenerAsistentePorId = routeLoader$(async ({ params }) => {
  const id = params.id

  const apiUrl = `https://api-ia-docentes-v2.yonaikereliezerbarretomaterano.workers.dev/asistentes/${id}`
  const response = await axios(apiUrl);
  const { data } = await response
  return data[0]
});

export default component$(() => {
  useStylesScoped$(styles)
  const asistente = useObtenerAsistentePorId()

  useVisibleTask$(() => {
    console.log(asistente.value)
  })
  return (
    <article class="card">
      <header class="card-header">
        <h3>{asistente.value.titulo}</h3>
      </header>
      <div class="card-body"></div>
      <footer class="card-footer">
        <button class="btn btn-primary">Enviar</button>
      </footer>
    </article>
  )
});