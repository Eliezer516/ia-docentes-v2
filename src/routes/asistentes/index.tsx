import { component$, useTask$ } from '@builder.io/qwik';
import { routeLoader$, server$ } from '@builder.io/qwik-city';

type Asistente = {
  id: string;
  titulo: string;
  instruccion: string;
}
 
export const useObtenerAsistentes = routeLoader$(async () => {
  const apiUrl = "https://api-ia-docentes-v2.yonaikereliezerbarretomaterano.workers.dev/asistentes"
  const response = await fetch(apiUrl);
  const data = await response.json()
  return data
});

export default component$(() => {
  const asistentes = useObtenerAsistentes();
  useTask$(() => {
    server$(() => {
      console.log(asistentes.value);
    })();
  });
  return (
    <section class="section bright">
      {asistentes.value.map((asistente: Asistente) => (
        <article key={asistente.id}>
          <h3>{asistente.titulo}</h3>
          <p>{asistente.instruccion}</p>
        </article>
      ))}
    </section>
  );
});