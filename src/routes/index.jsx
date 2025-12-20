import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from '@builder.io/qwik-city';
import axios from 'axios'
import { Card } from '~/components/Card.jsx'

export const useObtenerAsistentes = routeLoader$(async () => {
  const apiUrl = "https://api-ia-docentes-v2.yonaikereliezerbarretomaterano.workers.dev/asistentes"
  const response = await axios(apiUrl);
  const { data } = await response
  return data
});


export default component$(() => {
  const estilos = {
    centrar: {
      "display": "grid",
      "place-items": "center",
      "min-height": "100dvh"
    }
  }

  const asistentes = useObtenerAsistentes()

  return (
    <main style={estilos.centrar}>
      <Card tipo="asistentes" asistentes={asistentes} />
    </main>
  );
});

export const head = {
  title: "Inicio",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
